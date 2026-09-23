<?php

namespace App\Console\Commands\DaylyUpdated;

use Dotenv\Dotenv;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Exception;
use phpseclib3\Net\SSH2;

class FetchValidatorLogoNames extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'validators:fetch-logo-names';

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
        Log::info('Command fetch-logo-names executed at ' . now());
        $this->info('Start fetching validator names from server!');
        Log::info('Command app:fetch-sfdp executed at ' . now());
        $solanaPath = '/usr/local/bin/solana';
        $rpcUrl = env('SOLANA_RPC_URL', 'http://127.0.0.1:8899');

        try {
            $dotenv = Dotenv::createImmutable(base_path());
            $dotenv->load();

            $ssh = new SSH2(env('VALIDATOR_SERVER_HOST', '103.167.235.81'));
            $ssh->setTimeout(30);

            $loginSuccess = $ssh->login(
                env('VALIDATOR_SERVER_USER', 'root'),
                env('VALIDATOR_SERVER_PASSWORD')
            );

            if (!$loginSuccess) {
                $this->error('SSH login failed');
                return 1;
            }

            $this->info('SSH connection established');

            $infoCommand = "{$solanaPath} validator-info get -um --output json";
            $infoOutput = $ssh->exec($infoCommand);

            $validatorsInfoMap = [];

            if (!empty($infoOutput)) {
                $infoData = json_decode($infoOutput, true);

                if (is_array($infoData)) {
                    foreach ($infoData as $item) {
                        $identity = $item['identityPubkey'] ?? null;
                        if ($identity) {
                            $validatorsInfoMap[$identity] = [
                                'name'     => $item['info']['name'] ?? null,
                                'icon_url' => $item['info']['iconUrl'] ?? null,
                                'website'  => $item['info']['website'] ?? null,
                                'details'  => $item['info']['details'] ?? null,
                            ];
//                            if ($identity === 'A23LfQn6khffj2hGhGfXr6P52W2pxrVcCaHVQLYQgiX2') {
//                                DB::table('data.validators')
//                                    ->where('node_pubkey', $identity)
//                                    ->update([
//                                        'name'       => $item['info']['name'] ?? null,
//                                        'avatar_file_url'   => $item['info']['iconUrl'] ?? null,
//                                        'url'    => $item['info']['website'] ?? null,
//                                        'details'    => $item['info']['details'] ?? null,
//                                        'updated_at' => now(),
//                                    ]);
//                            }
                            DB::table('data.validators')
                                ->where('node_pubkey', $identity)
                                ->update([
                                    'name'       => $item['info']['name'] ?? null,
                                    'avatar_file_url'   => $item['info']['icon_url'] ?? null,
                                    'url'    => $item['info']['website'] ?? null,
                                    'details'    => $item['info']['details'] ?? null,
                                    'updated_at' => now(),
                                ]);

                        }
                    }
                    $this->info("Успешно получена информация для " . count($validatorsInfoMap) . " валидаторов.");
                }
            } else {
                $this->warn("Не удалось получить validator-info с сервера.");
            }

        } catch (\Exception $e) {
            $this->error("Failed to load .env file: " . $e->getMessage());
            Log::channel('sfdp')->error("Failed to load .env file: " . $e->getMessage());
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