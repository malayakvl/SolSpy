<?php

namespace App\Console\Commands\Rpc;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Process\Process;
use Illuminate\Support\Facades\Log;

class FetchValidatorSkipRateServer extends Command
{
    protected $signature = 'rpc:fetch-validator-skip-rate-server {validator? : Specific validator vote pubkey to process} {--limit=100 : Maximum slots to check per validator}';
    protected $description = 'Fetch skip rate for all validators from data.validators using Solana CLI';

    protected $solanaPath = '/usr/local/bin/solana';

    public function handle()
    {
        $this->detectSolanaBinary();

        $epoch = $this->getEpoch();
        $this->info("Current epoch: $epoch");

        $specificValidator = $this->argument('validator');
        
        if ($specificValidator) {
            // Обрабатываем конкретного валидатора
            $validator = DB::table('data.validators')
                ->select('vote_pubkey', 'node_pubkey')
                ->where('vote_pubkey', $specificValidator)
                ->first();
                
            if (!$validator) {
                $this->error("Validator not found: $specificValidator");
                return 1;
            }
            
            $this->info("Processing specific validator: $specificValidator");
            $this->processValidator($validator, $epoch);
        } else {
            // Обрабатываем всех валидаторов
            $validators = DB::table('data.validators')
                ->select('vote_pubkey', 'node_pubkey')
                ->get();

            if ($validators->isEmpty()) {
                $this->error("❌ No validators found in data.validators");
                return 0;
            }

            $this->info("Found " . count($validators) . " validators");

            foreach ($validators as $validator) {
                $this->processValidator($validator, $epoch);
            }
        }

        $this->cleanup();
        $this->info("✅ Finished processing validators skip-rate");

        return 0;
    }

    private function processValidator($validator, int $epoch)
    {
        $voteKey = $validator->vote_pubkey;
        $nodeKey = $validator->node_pubkey ?? $voteKey;
        
        $this->info("⏳ Processing validator: $voteKey (node: $nodeKey)");

        // Пробуем получить слоты сначала по vote pubkey, затем по node pubkey
        $leaderSlots = $this->getLeaderSlots($voteKey, $nodeKey);
        
        if (empty($leaderSlots)) {
            $this->warn("⚠️ No leader slots assigned for: $voteKey");
            return;
        }

        $this->info("Found " . count($leaderSlots) . " leader slots");

        $produced = 0;
        $skipped = 0;
        $processed = 0;
        $maxSlots = $this->option('limit'); // Используем опцию limit

        foreach ($leaderSlots as $slot) {
            if ($processed >= $maxSlots) {
                $this->info("Reached slot processing limit ($maxSlots)");
                break;
            }
            
            $block = $this->executeCommand("{$this->solanaPath} block $slot --output json");

            if (!empty($block)) {
                $produced++;
            } else {
                $skipped++;
            }
            
            $processed++;
            
            // Показываем прогресс каждые 10 слотов
            if ($processed % 10 == 0) {
                $this->info("Processed $processed slots so far (produced: $produced, skipped: $skipped)");
            }
        }

        $total = $produced + $skipped;
        $skipRate = $total > 0 ? round(($skipped / $total) * 100, 2) : 0;

        DB::table('data.validator_skiprate')->insert([
            'vote_pubkey' => $voteKey,
            'node_pubkey' => $nodeKey,
            'epoch'       => $epoch,
            'total_slots' => $total,
            'produced'    => $produced,
            'skipped'     => $skipped,
            'skip_rate'   => $skipRate,
            'created_at'  => now()
        ]);

        $this->info("✅ $voteKey — Skip Rate: $skipRate% | Slots: $total | Produced: $produced | Skipped: $skipped");
    }

    private function detectSolanaBinary()
    {
        if (!file_exists($this->solanaPath) || !is_executable($this->solanaPath)) {
            $this->solanaPath = "/root/.local/share/solana/install/active_release/bin/solana";
        }
        if (!file_exists($this->solanaPath) || !is_executable($this->solanaPath)) {
            throw new \Exception("❌ Solana binary not found");
        }
    }

    private function getEpoch()
    {
        $out = $this->executeCommand("{$this->solanaPath} epoch-info --output json");
        return $out['epoch'] ?? 0;
    }

    private function getLeaderSlots($voteKey, $nodeKey)
    {
        // Получаем полное расписание лидеров
        $schedule = $this->executeCommand("{$this->solanaPath} leader-schedule --no-duplicates --output json");
        
        if (empty($schedule) || !is_array($schedule)) {
            $this->info("Empty or invalid leader schedule response");
            return [];
        }

        $this->info("Leader schedule contains " . count($schedule) . " validators");
        
        // Проверяем по vote pubkey
        if (isset($schedule[$voteKey])) {
            $slots = $schedule[$voteKey];
            $this->info("Found " . count($slots) . " slots for vote pubkey $voteKey");
            return $slots;
        }
        
        // Проверяем по node pubkey
        if ($nodeKey !== $voteKey && isset($schedule[$nodeKey])) {
            $slots = $schedule[$nodeKey];
            $this->info("Found " . count($slots) . " slots for node pubkey $nodeKey");
            return $slots;
        }
        
        // Покажем несколько первых записей для отладки
        $firstEntries = array_slice($schedule, 0, 3, true);
        $this->info("Keys not found. First 3 entries in schedule:");
        foreach ($firstEntries as $key => $slots) {
            $this->info("  $key: " . count($slots) . " slots");
        }
        
        return [];
    }

    private function executeCommand($cmd)
    {
        $this->info("Executing: $cmd");
        $process = Process::fromShellCommandline($cmd, null, null, null, 60);
        $process->run();

        if (!$process->isSuccessful()) {
            $this->info("Command failed with exit code: " . $process->getExitCode());
            return null;
        }

        $output = $process->getOutput();
        $this->info("Command output length: " . strlen($output));
        
        // Для команды leader-schedule покажем дополнительную информацию
        if (strpos($cmd, 'leader-schedule') !== false) {
            $data = json_decode($output, true);
            if ($data && is_array($data)) {
                $this->info("Leader schedule parsed successfully, contains " . count($data) . " entries");
            } else {
                $this->info("Failed to parse leader schedule JSON");
                // Покажем начало вывода для отладки
                $this->info("First 500 chars of output: " . substr($output, 0, 500));
            }
        }
        
        return json_decode($output, true);
    }

    private function cleanup()
    {
        DB::table('data.validator_skiprate')
            ->where('created_at', '<', now()->subDays(30))
            ->delete();
    }
}