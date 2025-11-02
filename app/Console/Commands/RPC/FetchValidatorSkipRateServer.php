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

    public function handle()
    {
        // Use the symbolic link path which should be accessible
        $solanaPath = "/usr/local/bin/solana";
        
        // Check if the solana binary exists and is executable
        if (!file_exists($solanaPath) || !is_executable($solanaPath)) {
            // Fallback to direct path
            $solanaPath = "/root/.local/share/solana/install/active_release/bin/solana";
            if (!file_exists($solanaPath) || !is_executable($solanaPath)) {
                $this->error('Solana binary not found or not executable');
                return 1;
            }
        }
        
        $epoch = $this->getEpoch($solanaPath);
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
            $this->processValidator($validator, $epoch, $solanaPath);
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
                $this->processValidator($validator, $epoch, $solanaPath);
            }
        }

        $this->cleanup();
        $this->info("✅ Finished processing validators skip-rate");

        return 0;
    }

    private function processValidator($validator, int $epoch, string $solanaPath)
    {
        $voteKey = $validator->vote_pubkey;
        $nodeKey = $validator->node_pubkey ?? $voteKey;
        
        $this->info("⏳ Processing validator: $voteKey (node: $nodeKey)");

        // Пробуем получить слоты сначала по vote pubkey, затем по node pubkey
        $leaderSlots = $this->getLeaderSlots($voteKey, $nodeKey, $solanaPath);
        
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
            
            // Проверяем, существует ли блок для этого слота
            $block = $this->executeSolanaCommand("$solanaPath block $slot --output json", 30);

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

    private function getEpoch(string $solanaPath)
    {
        $output = $this->executeSolanaCommand("$solanaPath epoch-info --output json", 30);
        $data = json_decode($output, true);
        return $data['epoch'] ?? 0;
    }

    private function getLeaderSlots($voteKey, $nodeKey, string $solanaPath)
    {
        // Получаем расписание лидеров в текстовом формате (без --no-duplicates)
        $output = $this->executeSolanaCommand("$solanaPath leader-schedule", 60);
        
        if (empty($output)) {
            $this->info("Empty leader schedule response");
            return [];
        }

        // Парсим текстовый вывод в формате:
        // slot_number       pubkey
        $lines = explode("\n", trim($output));
        $schedule = [];
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Разбиваем строку по пробелам
            $parts = preg_split('/\s+/', $line);
            if (count($parts) >= 2) {
                $slot = intval($parts[0]);
                $pubkey = $parts[1];
                
                // Группируем слоты по pubkey
                if (!isset($schedule[$pubkey])) {
                    $schedule[$pubkey] = [];
                }
                $schedule[$pubkey][] = $slot;
            }
        }

        if (empty($schedule)) {
            $this->info("Failed to parse leader schedule");
            // Покажем начало вывода для отладки
            $this->info("First 500 chars of output: " . substr($output, 0, 500));
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

    private function executeSolanaCommand($command, $timeout)
    {
        $this->info("Executing: $command");
        
        $process = Process::fromShellCommandline($command, null, null, null, $timeout);
        $process->run();

        if (!$process->isSuccessful()) {
            $this->info("Command failed with exit code: " . $process->getExitCode());
            // Покажем ошибку для отладки
            $this->info("Error output: " . $process->getErrorOutput());
            return null;
        }

        $output = $process->getOutput();
        $this->info("Command output length: " . strlen($output));
        
        return $output;
    }

    private function cleanup()
    {
        DB::table('data.validator_skiprate')
            ->where('created_at', '<', now()->subDays(30))
            ->delete();
    }
}