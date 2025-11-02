<?php

namespace App\Console\Commands\Rpc;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Process\Process;
use Illuminate\Support\Facades\Log;

class FetchValidatorSkipRateServer extends Command
{
    protected $signature = 'rpc:fetch-validator-skip-rate-server';
    protected $description = 'Fetch skip rate for all validators from data.validators using Solana CLI';

    protected $solanaPath = '/usr/local/bin/solana';

    public function handle()
    {
        $this->detectSolanaBinary();

        $epoch = $this->getEpoch();
        $this->info("Current epoch: $epoch");

        // ✅ Получаем список vote аккаунтов из таблицы data.validators
        $validators = DB::table('data.validators')
            ->pluck('vote_pubkey')
            ->filter()
            ->unique()
            ->toArray();

        if (empty($validators)) {
            $this->error("❌ No validators found in data.validators");
            return 0;
        }

        $this->info("Found " . count($validators) . " validators");

        foreach ($validators as $voteKey) {
            $this->processValidator($voteKey, $epoch);
        }

        $this->cleanup();
        $this->info("✅ Finished processing validators skip-rate");

        return 0;
    }

    private function processValidator(string $voteKey, int $epoch)
    {
        $this->info("⏳ Processing validator: $voteKey");

        $leaderSlots = $this->getLeaderSlots($voteKey);

        if (empty($leaderSlots)) {
            $this->warn("⚠️ No leader slots assigned for: $voteKey");
            return;
        }

        $produced = 0;
        $skipped = 0;

        foreach ($leaderSlots as $slot) {
            $block = $this->executeCommand("{$this->solanaPath} block $slot --output json");

            if (!empty($block)) {
                $produced++;
            } else {
                $skipped++;
            }
        }

        $total = $produced + $skipped;
        $skipRate = round(($skipped / max(1, $total)) * 100, 2);

        DB::table('data.validator_skiprate')->insert([
            'vote_pubkey' => $voteKey,
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

    private function getLeaderSlots($voteKey)
    {
        $out = $this->executeCommand("{$this->solanaPath} leader-schedule --no-duplicates --output json");

        return isset($out[$voteKey]) ? $out[$voteKey] : [];
    }

    private function executeCommand($cmd)
    {
        $process = Process::fromShellCommandline($cmd, null, null, null, 60);
        $process->run();

        if (!$process->isSuccessful()) {
            return null;
        }

        return json_decode($process->getOutput(), true);
    }

    private function cleanup()
    {
        DB::table('data.validator_skiprate')
            ->where('created_at', '<', now()->subDays(30))
            ->delete();
    }
}