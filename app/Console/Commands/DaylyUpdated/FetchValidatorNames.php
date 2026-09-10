<?php

namespace App\Console\Commands\DaylyUpdated;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Exception;

class FetchValidatorNames extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'validators:fetch-names';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Parse and update validator names from Jito Stakenet Steward by vote_pubkey';

    /**
     * Execute the console command.
     */
    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::info('Command validators:fetch-names executed at ' . now());
        $this->info('Start fetching validator names from Jito Stakenet!');

        try {
            // Берем только тех валидаторов, у которых имя всё еще NULL
            $validators = DB::table('data.validators')
                ->select('id', 'name', 'vote_pubkey', 'node_pubkey')
                ->whereNull('name')
                ->where('credits_current_epoch', '>', 0)
                ->groupBy('id', 'name', 'vote_pubkey', 'node_pubkey')
                ->get();

            if ($validators->isEmpty()) {
                $this->info('No validators with NULL name found.');
                return 0;
            }

            $this->info("Found " . count($validators) . " validators to parse.");

            foreach ($validators as $validator) {
                $validatorId = $validator->id;
                $votePubkey  = $validator->vote_pubkey;

                if (empty($votePubkey)) {
                    $this->warn("Validator ID: {$validatorId} has empty vote_pubkey. Skipping.");
                    continue;
                }

                $this->info("Parsing name for validator ID: {$validatorId} (vote_pubkey: {$votePubkey})");

                // Парсим название через HTML-контент страницы Jito
                $result = $this->parseNameFromJito($votePubkey);
//dd($result);exit;
                if (!empty($result['name']) && !$result['is_placeholder']) {
                    // Обновляем запись в БД ТОЛЬКО если найдено реальное имя
//                    DB::table('data.validators')
//                        ->where('id', $validatorId)
//                        ->update([
//                            'name'       => $result['name'],
//                            'updated_at' => now(),
//                        ]);

                    $this->info("SUCCESS: Updated validator ID {$validatorId} with name: \"{$result['name']}\"");
                } else {
                    // Имени нет или вернулась заглушка — оставляем NULL, чтобы крон проверил позже
//                    $reason = $result['description'] ?? 'No moniker available yet.';
//                    $this->warn("SKIP: Validator ID {$validatorId} kept as NULL.");
//                    $this->line("<comment>Details:</comment> {$reason}");
                }

                $this->line('----------------------------------------------------');

                // Пауза 0.5 сек, чтобы не упереться в лимиты Cloudflare
                usleep(500000);
            }

            $this->info('TASK DONE: Process completed!');
            return 0;

        } catch (Exception $e) {
            $this->error('Error fetching validator names: ' . $e->getMessage());
            Log::error('Error in validators:fetch-names: ' . $e->getMessage(), ['exception' => $e]);
            return 1;
        }
    }


    private function parseNameFromJito(string $votePubkey): array
    {
        $url = "https://www.jito.network/stakenet/steward/" . urlencode($votePubkey) . "/";

        try {
            $response = Http::withHeaders([
                'User-Agent'      => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept'          => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language' => 'en-US,en;q=0.9',
            ])
                ->timeout(12)
                ->get($url);

            if (!$response->successful()) {
                return [
                    'name'           => null,
                    'is_placeholder' => true,
                    'description'    => "HTTP request failed with status {$response->status()}"
                ];
            }

            $html = $response->body();
            if (empty($html)) {
                return [
                    'name'           => null,
                    'is_placeholder' => true,
                    'description'    => 'Empty HTML response'
                ];
            }

            // ДЕТЕКТ "НЕ НАЙДЕН НА JITO": Проверяем наличие текста ошибки на странице
            if (str_contains($html, 'Matching Validator Not Found') || str_contains($html, 'No validator found for this vote account')) {
                $shortKey = mb_substr($votePubkey, 0, 4) . '...' . mb_substr($votePubkey, -4);

                return [
                    'name'           => null,
                    'is_placeholder' => true,
                    'description'    => "Валидатор не найден в базе Jito Stakenet (Matching Validator Not Found). " .
                        "Этот публичный адрес ({$votePubkey}) является Identity-ключом без зарегистрированного Name Moniker. " .
                        "В эксплорерах отображается как {$shortKey}."
                ];
            }

            $rawName = null;

            // 1. Поиск по H1 с Tailwind-классом text-balance
            if (preg_match('/<h1[^>]*class="[^"]*text-balance[^"]*"[^>]*>([\s\S]*?)<\/h1>/i', $html, $matches)) {
                $rawName = trim(strip_tags($matches[1]));
            }
            // 2. Резервный поиск по любому H1
            elseif (preg_match('/<h1[^>]*>([\s\S]*?)<\/h1>/i', $html, $matches)) {
                $rawName = trim(strip_tags($matches[1]));
            }
            // 3. Резервный поиск по OpenGraph
            elseif (preg_match('/<meta\s+property="og:title"\s+content="([^"]+)"/i', $html, $matches)) {
                $rawName = trim(str_replace(['| Jito', 'Stakenet'], '', $matches[1]));
            }

            if (!empty($rawName)) {
                $cleanName = html_entity_decode($rawName, ENT_QUOTES | ENT_HTML5, 'UTF-8');

                // ДЕТЕКТ ЗАГЛУШКИ В H1: Проверяем, не вывелся ли сокращенный адрес (Validator Ge3g...Gt8W или Ge3g...Gt8W)
                if (preg_match('/^[A-Za-z0-9]{3,6}\.\.\.[A-Za-z0-9]{3,6}$/', $cleanName) || str_contains($cleanName, 'Validator ')) {
                    // Если это просто "Validator Ge3g...Gt8W", чистим и помечаем как заглушку
                    if (!preg_match('/[a-z]{3,}/i', str_replace(['Validator', ' ', '.'], '', $cleanName))) {
                        $shortKey = mb_substr($votePubkey, 0, 4) . '...' . mb_substr($votePubkey, -4);

                        return [
                            'name'           => null,
                            'is_placeholder' => true,
                            'description'    => "У валидатора ({$votePubkey}) нет текстового имени в метаданных. Jito отдаёт дефолтный заголовок {$shortKey}."
                        ];
                    }
                }

                // Найдено настоящее имя
                return [
                    'name'           => $cleanName,
                    'is_placeholder' => false,
                    'description'    => null
                ];
            }

        } catch (Exception $e) {
            Log::warning("Failed to parse validator HTML from Jito ({$votePubkey}): " . $e->getMessage());
        }

        return [
            'name'           => null,
            'is_placeholder' => true,
            'description'    => 'Failed to extract name from page structure'
        ];
    }
}