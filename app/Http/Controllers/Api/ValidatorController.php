<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Settings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\SpyRankService;
use App\Services\TotalStakeService;
use App\Services\ValidatorDataService;
use App\Models\ValidatorOrder;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use phpseclib3\Net\SSH2;
use Illuminate\Support\Facades\Http;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ValidatorExport;

class ValidatorController extends Controller
{
    protected $validatorDataService;
    protected $totalStakeService;
    protected $spyRankService;

    public function __construct(
        ValidatorDataService $validatorDataService,
        TotalStakeService $totalStakeService,
        SpyRankService $spyRankService
    ) {
        $this->validatorDataService = $validatorDataService;
        $this->totalStakeService = $totalStakeService;
        $this->spyRankService = $spyRankService;
    }

    private function rpcCall($url, $method, $params = [])
    {
        $data = [
            'jsonrpc' => '2.0',
            'id' => 1,
            'method' => $method,
            'params' => $params
        ];
        

        $ch = curl_init('http://103.167.235.81:8899');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new \Exception("RPC error: HTTP $httpCode");
        }

        $json = json_decode($response, true);
        if (isset($json['error'])) {
            throw new \Exception($json['error']['message']);
        }

        return $json;
    }

public function getNextLeaderSlots(Request $request)
{
    // ✅ Get node_pubkey from request, fallback to default Vladika validator
    $nodePubkey = $request->query('node_pubkey', "DwDtUqBZJtbT64Vh4hLtX7x3epoXsoRLY5bGQ87wWnSe");
    $rpcUrl = 'http://103.167.235.81:8899';

    try {
        // -------- GET CURRENT SLOT & EPOCH INFO ---------------------
        $currentSlot = $this->rpcCall($rpcUrl, 'getSlot')['result'];
        $epochInfo = $this->rpcCall($rpcUrl, 'getEpochInfo')['result'];

        $epoch = $epochInfo['epoch'];
        $epochAbsoluteStart = $epochInfo['absoluteSlot'];
        $slotsInEpoch = $epochInfo['slotsInEpoch'];

        // -------- GET LEADER SLOTS (in-epoch indexes) ----------------
        $schedule = $this->rpcCall($rpcUrl, 'getLeaderSchedule', [null, ['identity' => $nodePubkey]]);
        $mySlots = $schedule['result'][$nodePubkey] ?? [];

        // Convert to absolute slots
        $myAbsoluteSlots = array_map(
            fn($s) => $epochAbsoluteStart + $s,
            $mySlots
        );

        // Future only
        $futureSlots = array_slice(
            array_filter($myAbsoluteSlots, fn($s) => $s > $currentSlot),
            0,
            5
        );

        if (empty($futureSlots)) {
            return response()->json([
                'next_slots' => [],
                'msg' => 'No upcoming leader slots left in this epoch'
            ]);
        }

        // -------- GET MORE ACCURATE TIME ESTIMATION --------
        // Get current time and a recent block time for better estimation
        $currentTime = time();
        $refSlot = $currentSlot;
        $refTime = $currentTime;

        // Try to get a more recent block time for better accuracy
        for ($i = 0; $i < 10; $i++) {
            $testSlot = $currentSlot - $i * 50;
            if ($testSlot < 0) break;

            $timeResult = $this->rpcCall($rpcUrl, 'getBlockTime', [$testSlot]);

            if (isset($timeResult['result']) && $timeResult['result'] !== null) {
                $refSlot = $testSlot;
                $refTime = $timeResult['result'];
                break;
            }
        }

        // Calculate average slot time based on recent data
        $slotTimeAverage = 0.4; // Default to 0.4 seconds per slot
        if ($currentSlot > $refSlot && $currentTime > $refTime) {
            $slotTimeAverage = ($currentTime - $refTime) / ($currentSlot - $refSlot);
        }

        // -------- FORMAT OUTPUT ---------------------------------------
        $result = [];
        foreach ($futureSlots as $slot) {
            $diffSlots = $slot - $refSlot;
            $etaSec = $diffSlots * $slotTimeAverage;
            $etaTs = $refTime + $etaSec;

            $result[] = [
                'absolute_slot' => $slot,
                'slot_in_epoch' => $slot - $epochAbsoluteStart,
                'epoch' => $epoch,
                'eta_seconds' => round($etaSec, 1),
                'eta_local' => date('Y-m-d H:i:s', $etaTs), // UTC time
                'in_minutes' => round($etaSec / 60, 1)
            ];
        }

        return response()->json([
            'validator_identity' => $nodePubkey,
            'current_slot' => $currentSlot,
            'epoch' => $epoch,
            'next_slots' => $result
        ]);

    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

public function getSkippedStats(Request $request)
{
    $identity = $request->query('identity');

    if (!$identity) {
        return response()->json(['error' => 'identity required'], 400);
    }

    $rpcUrl = 'http://103.167.235.81:8899';

    // 1. Get leader schedule
    $schedule = $this->rpcCall($rpcUrl, 'getLeaderSchedule', [null, ['identity' => $identity]]);
    $slots = $schedule['result'][$identity] ?? [];

    if (empty($slots)) {
        return response()->json([
            'identity' => $identity,
            'checked' => 0,
            'produced' => 0,
            'skipped' => 0,
            'skip_rate' => 0,
            'history' => []
        ]);
    }

    // 2. Epoch info
    $epochInfo = $this->rpcCall($rpcUrl, 'getEpochInfo')['result'];
    $currentEpoch = $epochInfo['epoch'];
    $currentSlot = $epochInfo['absoluteSlot'];

    // 3. Keep only current epoch slots
    $slots = array_filter($slots, function($slot) use ($currentEpoch) {
        return intdiv($slot, 432000) === $currentEpoch;
    });

    // 4. Filter only past + available slots
    $firstAvailable = $this->rpcCall($rpcUrl, 'getFirstAvailableBlock')['result'] ?? 0;

    $validSlots = array_filter($slots, function($s) use ($currentSlot, $firstAvailable) {
        return $s <= $currentSlot && $s >= $firstAvailable;
    });

    // Fallback — if everything filtered out (purge / epoch start)
    if (empty($validSlots)) {
        $validSlots = array_slice($slots, -200);
    }

    // Analyze last 200 slots max
    $recentSlots = array_slice($validSlots, -200);

    $produced = 0;
    $skipped = 0;
    $history = [];

    foreach ($recentSlots as $slot) {
        $block = $this->rpcCall($rpcUrl, 'getBlock', [$slot]);

        if (isset($block['error'])) {
            $history[] = [
                'slot' => $slot,
                'ok' => null,
                'reason' => $block['error']['message'] ?? 'unavailable'
            ];
            continue;
        }

        $ok = !empty($block['result']);
        $history[] = ['slot' => $slot, 'ok' => $ok];

        if ($ok) {
            $produced++;
        } else {
            $skipped++;
        }
    }

    $checked = $produced + $skipped;

    return response()->json([
        'identity' => $identity,
        'checked' => $checked,
        'produced' => $produced,
        'skipped' => $skipped,
        'skip_rate' => $checked > 0 ? round(($skipped / $checked) * 100, 2) : 0,
        'epoch' => $currentEpoch,
        'history' => $history
    ]);
}


public function getLeaderSlots(Request $request)
{
    $identity = $request->query('node_pubkey');

    if (!$identity) {
        return response()->json(['error' => 'identity required'], 400);
    }

    $rpcUrl = 'http://103.167.235.81:8899';

    // 1) Epoch info
    $epochInfo = $this->rpcCall($rpcUrl, 'getEpochInfo');
    $currentSlot = $epochInfo['result']['absoluteSlot'] ?? null;
    $epoch = $epochInfo['result']['epoch'] ?? null;
    $epochSlotIndex = $epochInfo['result']['slotIndex'] ?? null;
    $slotsInEpoch = $epochInfo['result']['slotsInEpoch'] ?? null;

    // 2) Leader schedule
    $schedule = $this->rpcCall($rpcUrl, 'getLeaderSchedule', [null, ['identity' => $identity]]);
    $slots = $schedule['result'][$identity] ?? [];

    // ✅ stake валидатора и сети
    $stakeInfo = $this->rpcCall($rpcUrl, 'getVoteAccounts');
    $active = $stakeInfo['result']['current'] ?? [];
    $found = collect($active)->firstWhere('nodePubkey', $identity);

    $validatorStake = $found['activatedStake'] ?? 0;
    $totalNetworkStake = array_sum(array_column($active, 'activatedStake'));

    $stakeShare = $totalNetworkStake > 0 ? ($validatorStake / $totalNetworkStake) : 0;

    // ✅ Ожидаемые слоты по stake
    $expectedSlots = round($stakeShare * $slotsInEpoch);

    if (!$slots || !$currentSlot) {
        return response()->json([
            'epoch' => $epoch,
            'leader_slots' => 0,
            'past_slots' => 0,
            'produced_slots' => 0,
            'skipped_slots' => 0,
            'produced_rate' => 0,
            'skip_rate' => 0,
            'epoch_progress' => 0,
            'history_checked' => 0,
            'history' => []
        ]);
    }

    // 3) First block available
    $firstAvailable = $this->rpcCall($rpcUrl, 'getFirstAvailableBlock')['result'] ?? 0;

    // Past slots only
    $pastSlots = array_filter($slots, fn($s) => $s <= $currentSlot);
    $pastCount = count($pastSlots);

    $produced = 0;
    $skipped = 0;
    $history = [];

    foreach ($pastSlots as $slot) {
        if ($slot < $firstAvailable) {
            $history[] = [
                'slot' => $slot,
                'ok' => null,
                'reason' => 'pruned'
            ];
            continue;
        }

        $block = $this->rpcCall($rpcUrl, 'getBlock', [$slot]);

        if (!empty($block['result'])) {
            $produced++;
            $history[] = ['slot' => $slot, 'ok' => true];
        } else {
            $skipped++;
            $history[] = ['slot' => $slot, 'ok' => false];
        }
    }

    $total = max(1, $produced + $skipped);

    return response()->json([
        'epoch' => $epoch,
        'leader_slots' => count($slots),      // ВСЕ слоты в эпохе
        'past_slots' => $pastCount,           // ПРОШЕДШИЕ слоты
        'expected_slots' => $expectedSlots, // ✅ ЭТО ГЛАВНОЕ!
        'produced_slots' => $produced,
        'skipped_slots' => $skipped,
        'produced_rate' => round(($produced / $total) * 100, 2),
        'skip_rate' => round(($skipped / $total) * 100, 2),
        'epoch_progress' => round(($epochSlotIndex / $slotsInEpoch) * 100, 2),
        'history_checked' => $pastCount,
        'history' => $history
    ]);
}




public function hardware(Request $request)
{
    // $ip = $request->query('ip');
    // if (!$ip) {
    //     return response()->json(['error' => 'IP required'], 400);
    // }

    // $ports = [9100, 9101, 9200, 8080];
    // $metrics = null;

    // foreach ($ports as $port) {
    //     $url = "http://{$ip}:{$port}/metrics";

    //     try {
    //         $context = stream_context_create(['http' => ['timeout' => 2]]);
    //         $metrics = @file_get_contents($url, false, $context);

    //         if ($metrics !== false) {
    //             break; // Метрики найдены — выходим из цикла
    //         }
    //     } catch (\Throwable $e) {
    //         continue;
    //     }
    // }

    // if (!$metrics) {
    //     return response()->json(['error' => 'metrics_unavailable']);
    // }

    // // RAM
    // preg_match('/node_memory_MemTotal_bytes\s+(\d+)/', $metrics, $ram);

    // // CPU cores count
    // preg_match_all('/node_cpu_seconds_total\{.*cpu="(\d+)"\}/', $metrics, $cpuMatches);
    // $cpuCores = isset($cpuMatches[1]) ? count(array_unique($cpuMatches[1])) : null;

    // // Disk
    // preg_match('/node_filesystem_size_bytes\{[^}]*mountpoint="\/"[^}]*\}\s+(\d+)/', $metrics, $disk);

    // return response()->json([
    //     'source'       => $ip,
    //     'ram_bytes'    => $ram[1] ?? null,
    //     'cpu_cores'    => $cpuCores,
    //     'disk_bytes'   => $disk[1] ?? null,
    // ]);
        $ip = '208.76.223.94';
        $asn = '20473'; // optional: string or number or descriptive "Hetzner"
        $vote = '53RJBy7aBGA7Aag6AryxEmBbsHDgwfBWagLrPbGHnfvR'; // optional, not used directly here

        if (!$ip && !$vote) {
            return response()->json(['error' => 'ip or vote is required'], 400);
        }

        // cache key per ip or vote
        $cacheKey = 'hw_estimate:' . ($ip ?: 'vote_' . $vote);
        $cached = Cache::get($cacheKey);
        if ($cached) return response()->json($cached);

        $result = [
            'ip' => $ip,
            'asn' => $asn,
            'rdns' => null,
            'http_server' => null,
            'tls_cn' => null,
            'estimate' => null,
            'confidence' => 0,
            'reasons' => [],
            'fetched_at' => now()->toISOString()
        ];

        // 1) reverse DNS (best-effort)
        try {
            if ($ip) {
                $rdns = @gethostbyaddr($ip);
                if ($rdns && $rdns !== $ip) {
                    $result['rdns'] = $rdns;
                }
            }
        } catch (\Throwable $e) {
            // ignore
        }

        // 2) try HTTP HEAD on likely hosts (use http(s) as available)
        $tryHosts = [];
        if ($request->query('host')) {
            $tryHosts[] = $request->query('host');
        }
        if (!empty($result['rdns'])) {
            $tryHosts[] = 'https://' . $result['rdns'];
            $tryHosts[] = 'http://' . $result['rdns'];
        }
        if ($ip) {
            $tryHosts[] = 'https://' . $ip;
            $tryHosts[] = 'http://' . $ip;
        }

        // try HEAD requests, short timeout
        $tried = [];
        foreach ($tryHosts as $u) {
            if (in_array($u, $tried)) continue;
            $tried[] = $u;
            try {
                $resp = Http::timeout(3)->withHeaders(['User-Agent' => 'ValidatorEstimator/1.0'])->head($u);
                if ($resp->successful() || in_array($resp->status(), [200,301,302,403,401])) {
                    $result['http_server'] = $resp->header('Server') ?? null;
                    // if GET allowed and small body, fetch small JSON
                    if ($resp->status() === 200 && strpos($resp->header('Content-Type',''), 'application/json') !== false) {
                        $get = Http::timeout(3)->get($u);
                        if ($get->successful()) {
                            // optionally parse JSON if it looks like solana-hardware.json
                        }
                    }
                    // try to get TLS cert CN if HTTPS
                    if (stripos($u, 'https://') === 0) {
                        try {
                            $host = parse_url($u, PHP_URL_HOST);
                            $port = parse_url($u, PHP_URL_PORT) ?: 443;
                            $context = stream_context_create(["ssl" => ["capture_peer_cert" => true, "verify_peer" => false, "verify_peer_name" => false]]);
                            $client = @stream_socket_client("ssl://{$host}:{$port}", $errno, $errstr, 3, STREAM_CLIENT_CONNECT, $context);
                            if ($client) {
                                $params = stream_context_get_options($client);
                            }
                            // simpler: use openssl to fetch cert
                            $cert = @openssl_x509_parse(@stream_context_get_params($client)['options']['ssl']['peer_certificate'] ?? null);
                            if (!empty($cert) && !empty($cert['subject'])) {
                                $cn = $cert['subject']['CN'] ?? null;
                                if ($cn) $result['tls_cn'] = $cn;
                            }
                        } catch (\Throwable $e) {
                            // ignore
                        }
                    }
                    // we got at least one valid host response — stop scanning more hosts
                    break;
                }
            } catch (\Throwable $e) {
                // ignore timeouts/errors
            }
        }

        // 3) heuristics mapping provider/rdns/asn -> estimate ranges
        $providerHints = $asn ? $asn : ($result['rdns'] ?? '');
        $hintsLower = strtolower($providerHints . ' ' . ($result['rdns'] ?? '') . ' ' . ($result['http_server'] ?? '') . ' ' . ($result['tls_cn'] ?? ''));

        // small provider -> estimated specs mapping (ranges)
        $mappings = [
            // dedicated hosting / colocation (likely strong machines)
            'hetzner' => ['ram_gb' => [64,512], 'cpu_cores' => [8,64], 'disk' => 'NVMe', 'confidence' => 60],
            'ovh' => ['ram_gb' => [32,256], 'cpu_cores' => [8,64], 'disk' => 'NVMe', 'confidence' => 55],
            'ionos' => ['ram_gb' => [16,128], 'cpu_cores' => [4,32], 'disk' => 'SSD/NVMe', 'confidence' => 40],
            'amazonaws' => ['ram_gb' => [4,256], 'cpu_cores' => [2,64], 'disk' => 'EBS (varies)', 'confidence' => 40],
            'ec2' => ['ram_gb' => [4,256], 'cpu_cores' => [2,64], 'disk' => 'EBS', 'confidence' => 40],
            'digitalocean' => ['ram_gb' => [2,64], 'cpu_cores' => [1,16], 'disk' => 'SSD', 'confidence' => 45],
            'linode' => ['ram_gb' => [2,64], 'cpu_cores' => [1,16], 'disk' => 'SSD', 'confidence' => 40],
            'google' => ['ram_gb' => [4,256], 'cpu_cores' => [2,64], 'disk' => 'Persistent Disk', 'confidence' => 40],
            'azure' => ['ram_gb' => [4,256], 'cpu_cores' => [2,64], 'disk' => 'Managed Disk', 'confidence' => 40],
            'vultr' => ['ram_gb' => [2,64], 'cpu_cores' => [1,32], 'disk' => 'NVMe/SSD', 'confidence' => 40],
            'equinix' => ['ram_gb' => [32,512], 'cpu_cores' => [16,64], 'disk' => 'NVMe', 'confidence' => 60],
            'jelastic' => ['ram_gb' => [2,32], 'cpu_cores' => [1,16], 'disk' => 'SSD', 'confidence' => 30]
        ];

        $matched = null;
        foreach ($mappings as $k => $v) {
            if (strpos($hintsLower, $k) !== false) {
                $matched = $v;
                $result['reasons'][] = "matched_provider:{$k}";
                break;
            }
        }

        // default fallback: if ASN contains only digits or 'AS' - small adjustment: cloud likely
        if (!$matched) {
            if ($asn && preg_match('/AS?\s*\d+/i', $asn)) {
                $matched = ['ram_gb' => [8,128], 'cpu_cores' => [2,32], 'disk' => 'SSD', 'confidence' => 25];
                $result['reasons'][] = 'asn_detected_generic';
            } else {
                // if reverse DNS looks like a personal domain -> small VM
                if (!empty($result['rdns']) && preg_match('/home|user|client|dyn|pppoe/i', $result['rdns'])) {
                    $matched = ['ram_gb' => [2,16], 'cpu_cores' => [1,8], 'disk' => 'SSD/HDD', 'confidence' => 20];
                    $result['reasons'][] = 'rdns_home_generic';
                } else {
                    $matched = ['ram_gb' => [8,64], 'cpu_cores' => [2,24], 'disk' => 'SSD', 'confidence' => 15];
                    $result['reasons'][] = 'fallback_generic';
                }
            }
        }

        // entropy: increase confidence if http_server contains "k8s" or "cloud" patterns
        if (!empty($result['http_server'])) {
            $hs = strtolower($result['http_server']);
            if (strpos($hs, 'cloudflare') !== false) {
                $result['reasons'][] = 'via_cloudflare';
                $matched['confidence'] = min(90, ($matched['confidence'] ?? 10) + 10);
            } elseif (strpos($hs, 'nginx') !== false) {
                $result['reasons'][] = 'http_nginx';
            }
        }

        // finalize estimate (choose median of range)
        $ramRange = $matched['ram_gb'];
        $cpuRange = $matched['cpu_cores'];
        $ramMedian = (int) round(($ramRange[0] + $ramRange[1]) / 2);
        $cpuMedian = (int) round(($cpuRange[0] + $cpuRange[1]) / 2);

        $estimate = [
            'ram_gb_range' => [$ramRange[0], $ramRange[1]],
            'ram_gb_median' => $ramMedian,
            'cpu_cores_range' => [$cpuRange[0], $cpuRange[1]],
            'cpu_cores_median' => $cpuMedian,
            'disk' => $matched['disk'] ?? 'unknown',
            'confidence' => $matched['confidence'] ?? 10
        ];

        $result['estimate'] = $estimate;
        $result['confidence'] = $estimate['confidence'];

        // cache for 1 hour to avoid re-probing
        Cache::put($cacheKey, $result, now()->addMinutes(60));

        return response()->json($result);
}








  public function getSkippedSlots(Request $request)
    {
        $nodePubkey = $request->query('node_pubkey');
        if (!$nodePubkey) {
            return response()->json(['error' => 'node_pubkey required'], 400);
        }

        $rpcUrl = 'http://103.167.235.81';
        $cacheKey = "skipped_slots_{$nodePubkey}";
        $cacheTtl = 60;

        return Cache::remember($cacheKey, $cacheTtl, function () use ($rpcUrl, $nodePubkey) {
            try {
                // 1. Текущий слот и эпоха
                $currentSlot = $this->rpcCall($rpcUrl, 'getSlot')['result'];
                $epochInfo = $this->rpcCall($rpcUrl, 'getEpochInfo')['result'];
                $epoch = $epochInfo['epoch'];
                $epochProgress = $epochInfo['slotIndex'] / $epochInfo['slotsInEpoch'];
                $progressPercent = round($epochProgress * 100, 1);

                // 2. Leader Slots
                $schedule = $this->rpcCall($rpcUrl, 'getLeaderSchedule', [null, ['identity' => $nodePubkey]]);
                $leaderSlots = $schedule['result'][$nodePubkey] ?? [];
                $totalLeaderSlots = count($leaderSlots);

                if ($totalLeaderSlots === 0) {
                    return response()->json([
                        'epoch' => $epoch,
                        'leader_slots' => 0,
                        'produced_slots' => 0,
                        'skipped_slots' => 0,
                        'skip_rate' => 0,
                        'produced_rate' => 100,
                        'epoch_progress' => $progressPercent,
                        'message' => 'Нет слотов в текущей эпохе'
                    ]);
                }

                // 3. Считаем только прошедшие слоты
                $produced = 0;
                $skipped = 0;
                $pastSlots = 0;

                foreach ($leaderSlots as $slot) {
                    if ($slot > $currentSlot) {
                        continue;
                    }

                    $pastSlots++;

                    try {
                        $block = $this->rpcCall($rpcUrl, 'getBlockHeight', [$slot, ['commitment' => 'confirmed']]);
                        if (isset($block['result']) && $block['result'] !== null) {
                            $produced++;
                        } else {
                            $skipped++;
                        }
                    } catch (\Exception $e) {
                        $skipped++;
                    }
                }

                // 4. Проценты
                $skipRate = $pastSlots > 0 ? ($skipped / $pastSlots) * 100 : 0;
                $producedRate = 100 - $skipRate;

                return response()->json([
                    'epoch' => $epoch,
                    'epoch_progress' => $progressPercent,
                    'leader_slots' => $totalLeaderSlots,
                    'past_slots' => $pastSlots,
                    'produced_slots' => $produced,
                    'skipped_slots' => $skipped,
                    'skip_rate' => round($skipRate, 2),
                    'produced_rate' => round($producedRate, 2),
                ]);

            } catch (\Exception $e) {
                \Log::error('SkippedSlots error', ['error' => $e->getMessage()]);
                return response()->json([
                    'epoch' => 0,
                    'leader_slots' => 0,
                    'produced_slots' => 0,
                    'skipped_slots' => 0,
                    'skip_rate' => 0,
                    'produced_rate' => 100,
                    'error' => 'RPC error'
                ], 500);
            }
        });
    }

    public function timeoutData(Request $request)
    {
        $page = max(1, (int) $request->input('page', 1)); // Получаем номер страницы с фронтенда, приводим к integer с минимумом 1
        $limit = 10; // Количество записей на страницу
        $offset = ($page - 1) * $limit; // Расчет offset
        $filterType = $request->input('filterType', 'all'); // Get filter type
        $searchTerm = $request->input('search', ''); // Get search term
        $sortColumn = $request->input('sortColumn', 'id'); // Get sort column
        $validatorId = $request->input('validatorId'); // Get sort column
        $sortDirection = $request->input('sortDirection', 'ASC'); // Get sort direction
        $userId = $request->user() ? $request->user()->id : null;
        
        // Get display options from request parameters
        $displayOptions = [
            'all' => $request->input('displayAll', false) === 'true',
            'top' => $request->input('displayTop', false) === 'true',
            'highlight' => $request->input('displayHighlight', false) === 'true',
            'notRussian' => $request->input('displayNotRussian', false) === 'true',
            'onlyWithName' => $request->input('displayOnlyWithName', false) === 'true',
            'onlyWithWebsite' => $request->input('displayOnlyWithWebsite', false) === 'true',
            'onlyValidated' => $request->input('displayOnlyValidated', false) === 'true',
            'onlyWithMevAndZeroCommission' => $request->input('displayOnlyWithMevAndZeroCommission', false) === 'true'
        ];
        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;
        // Fetch timeout data using service
        $data = $this->validatorDataService->timeoutData(
            $sortColumn, 
            $sortDirection, 
            $totalStakeLamports,
            $userId, 
            $filterType, 
            $limit, 
            $offset, 
            $searchTerm,
            $validatorId,
            $displayOptions
        );
        return response()->json([
            'validatorsData' => $data['validatorsData'],
            'settingsData' => Settings::first(),
            'totalCount' => $data['filteredTotalCount'],
            'currentPage' => $page,
            'filterType' => $filterType,
            'totalStakeData' => $stakeData[0],
        ]);
    }

     public function timeoutNoticeData(Request $request)
    {
        $page = max(1, (int) $request->input('page', 1)); // Получаем номер страницы с фронтенда, приводим к integer с минимумом 1
        $limit = 10; // Количество записей на страницу
        $offset = ($page - 1) * $limit; // Расчет offset
        $filterType = $request->input('filterType', 'all'); // Get filter type
        $searchTerm = $request->input('search', ''); // Get search term
        $sortColumn = $request->input('sortColumn', 'id'); // Get sort column
        $sortDirection = $request->input('sortDirection', 'ASC'); // Get sort direction
        $userId = $request->user() ? $request->user()->id : null;
        
        // For unauthenticated users, get favorite validator IDs from request parameter
        $favoriteIds = null;
        if (!$userId) {
            $favoriteIds = $request->input('ids', []); // Get from localStorage parameter
            if (is_string($favoriteIds)) {
                $favoriteIds = json_decode($favoriteIds, true) ?: [];
            }
        }
        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;

        // Fetch timeout data using service
        $data = $this->validatorDataService->timeoutNoticeData(
            $sortColumn, 
            $sortDirection, 
            $totalStakeLamports,
            $userId, 
            $filterType, 
            $limit, 
            $offset, 
            $searchTerm,
            $favoriteIds
        );

        return response()->json([
            'validatorsData' => $data['validatorsData'],
            'settingsData' => Settings::first(),
            'totalCount' => $data['filteredTotalCount'],
            'currentPage' => $page,
            'filterType' => $filterType,
            'totalStakeData' => $stakeData[0],
        ]);
    }

    public function timeoutFavoriteData(Request $request)
    {
        $page = max(1, (int) $request->input('page', 1)); // Получаем номер страницы с фронтенда, приводим к integer с минимумом 1
        $limit = 10; // Количество записей на страницу
        $offset = ($page - 1) * $limit; // Расчет offset
        $filterType = $request->input('filterType', 'all'); // Get filter type
        $searchTerm = $request->input('search', ''); // Get search term
        $sortColumn = $request->input('sortColumn', 'id'); // Get sort column
        $sortDirection = $request->input('sortDirection', 'ASC'); // Get sort direction
        $userId = $request->user() ? $request->user()->id : null;
        
        // For unauthenticated users, get favorite validator IDs from request parameter
        $favoriteIds = null;
        if (!$userId) {
            $favoriteIds = $request->input('ids', []); // Get from localStorage parameter
            if (is_string($favoriteIds)) {
                $favoriteIds = json_decode($favoriteIds, true) ?: [];
            }
        }
        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;

        // Fetch timeout data using service
        $data = $this->validatorDataService->timeoutFavoriteData(
            $sortColumn, 
            $sortDirection, 
            $totalStakeLamports,
            $userId, 
            $filterType, 
            $limit, 
            $offset, 
            $searchTerm,
            $favoriteIds
        );

        return response()->json([
            'validatorsData' => $data['validatorsData'],
            'settingsData' => Settings::first(),
            'totalCount' => $data['filteredTotalCount'],
            'currentPage' => $page,
            'filterType' => $filterType,
            'totalStakeData' => $stakeData[0],
        ]);
    }

    public function timeoutBlockedData(Request $request)
    {
        $page = max(1, (int) $request->input('page', 1)); // Получаем номер страницы с фронтенда, приводим к integer с минимумом 1
        $limit = 10; // Количество записей на страницу
        $offset = ($page - 1) * $limit; // Расчет offset
        $filterType = $request->input('filterType', 'all'); // Get filter type
        $searchTerm = $request->input('search', ''); // Get search term
        $sortColumn = $request->input('sortColumn', 'id'); // Get sort column
        $sortDirection = $request->input('sortDirection', 'ASC'); // Get sort direction
        $userId = $request->user() ? $request->user()->id : null;
        
        // For unauthenticated users, get favorite validator IDs from request parameter
        $blockedIds = null;
        if (!$userId) {
            $blockedIds = $request->input('validatorBlocked', []); // Get from localStorage parameter
            if (is_string($blockedIds)) {
                $blockedIds = json_decode($blockedIds, true) ?: [];
            }
        }
        
        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;

        // Fetch timeout data using service
        $data = $this->validatorDataService->timeoutBlockedData(
            $sortColumn, 
            $sortDirection, 
            $totalStakeLamports,
            $userId, 
            $filterType, 
            $limit, 
            $offset, 
            $searchTerm,
            $blockedIds
        );

        return response()->json([
            'validatorsData' => $data['validatorsData'],
            'settingsData' => Settings::first(),
            'totalCount' => $data['filteredTotalCount'],
            'currentPage' => $page,
            'filterType' => $filterType,
            'totalStakeData' => $stakeData[0],
        ]);
    }

    public function timeoutComparisonData(Request $request)
    {
        $page = max(1, (int) $request->input('page', 1)); // Получаем номер страницы с фронтенда, приводим к integer с минимумом 1
        $limit = 10; // Количество записей на страницу
        $offset = ($page - 1) * $limit; // Расчет offset
        $filterType = $request->input('filterType', 'all'); // Get filter type
        $searchTerm = $request->input('search', ''); // Get search term
        $sortColumn = $request->input('sortColumn', 'id'); // Get sort column
        $sortDirection = $request->input('sortDirection', 'ASC'); // Get sort direction
        $userId = $request->user() ? $request->user()->id : null;
        
        // For unauthenticated users, get favorite validator IDs from request parameter
        $compareIds = null;
        if (!$userId) {
            $compareIds = $request->input('validatorCompare', []); // Get from localStorage parameter
            if (is_string($compareIds)) {
                $compareIds = json_decode($compareIds, true) ?: [];
            }
        }
        
        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;

        // Fetch timeout data using service
        $data = $this->validatorDataService->timeoutCompareData(
            $sortColumn, 
            $sortDirection, 
            $totalStakeLamports,
            $userId, 
            $filterType, 
            $limit, 
            $offset, 
            $searchTerm,
            $compareIds
        );

        return response()->json([
            'validatorsData' => $data['validatorsData'],
            'settingsData' => Settings::first(),
            'totalCount' => $data['filteredTotalCount'],
            'currentPage' => $page,
            'filterType' => $filterType,
            'totalStakeData' => $stakeData[0],
        ]);
    }

    /**
     * Public method for fetching favorite validators for unauthenticated users
     */
    public function publicFavoriteData(Request $request)
    {
        $page = max(1, (int) $request->input('page', 1)); // Получаем номер страницы с фронтенда, приводим к integer с минимумом 1
        $limit = 10; // Количество записей на страницу
        $offset = ($page - 1) * $limit; // Расчет offset
        $filterType = $request->input('filterType', 'all'); // Get filter type
        $searchTerm = $request->input('search', ''); // Get search term
        $sortColumn = $request->input('sortColumn', 'id'); // Get sort column
        $sortDirection = $request->input('sortDirection', 'ASC'); // Get sort direction
        // For unauthenticated users, get favorite validator IDs from request parameter
        $favoriteIds = $request->input('ids', []); // Get from localStorage parameter
        if (is_string($favoriteIds)) {
            $favoriteIds = json_decode($favoriteIds, true) ?: [];
        }
        
        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;

        // Fetch timeout data using service
        $data = $this->validatorDataService->timeoutFavoriteData(
            $sortColumn, 
            $sortDirection, 
            $totalStakeLamports,
            null, // userId is null for public access
            $filterType, 
            $limit, 
            $offset, 
            $searchTerm,
            $favoriteIds
        );

        return response()->json([
            'validatorsData' => $data['validatorsData'],
            'settingsData' => Settings::first(),
            'totalCount' => $data['filteredTotalCount'],
            'currentPage' => $page,
            'filterType' => $filterType,
            'totalStakeData' => $stakeData[0],
        ]);
    }

    /**
     * Public method for fetching favorite validators for unauthenticated users
     */
    public function publicComparisonData(Request $request)
    {
        $page = max(1, (int) $request->input('page', 1)); // Получаем номер страницы с фронтенда, приводим к integer с минимумом 1
        $limit = 10; // Количество записей на страницу
        $offset = ($page - 1) * $limit; // Расчет offset
        $filterType = $request->input('filterType', 'all'); // Get filter type
        $searchTerm = $request->input('search', ''); // Get search term
        $sortColumn = $request->input('sortColumn', 'id'); // Get sort column
        $sortDirection = $request->input('sortDirection', 'ASC'); // Get sort direction
        // For unauthenticated users, get favorite validator IDs from request parameter
        $favoriteIds = $request->input('ids', []); // Get from localStorage parameter
        if (is_string($favoriteIds)) {
            $favoriteIds = json_decode($favoriteIds, true) ?: [];
        }
        
        // Get total stake data
        $stakeData = $this->totalStakeService->getTotalStake();
        $totalStakeLamports = $stakeData[0]->total_network_stake_sol * 1000000000;

        // Fetch timeout data using service
        $data = $this->validatorDataService->timeoutFavoriteData(
            $sortColumn, 
            $sortDirection, 
            $totalStakeLamports,
            null, // userId is null for public access
            $filterType, 
            $limit, 
            $offset, 
            $searchTerm,
            $favoriteIds
        );

        return response()->json([
            'validatorsData' => $data['validatorsData'],
            'settingsData' => Settings::first(),
            'totalCount' => $data['filteredTotalCount'],
            'currentPage' => $page,
            'filterType' => $filterType,
            'totalStakeData' => $stakeData[0],
        ]);
    }

    public function removeComparisons(Request $request) {
        $userId = $request->user() ? $request->user()->id : null;
        $validatorId = $request->input('validatorId');

        $validator = DB::table('data.validators_comparison')
            ->where('validator_id', $validatorId)
            ->where('user_id', $userId)
            ->delete();

    }


    public function fetchByIds(Request $request) {
        $userId = $request->user() ? $request->user()->id : null;
        
        // Handle both query parameter and request body
        $ids = $request->input('ids', []);
        if (is_string($ids)) {
            $ids = explode(',', $ids);
        }
        $ids = array_filter($ids); // Remove empty values
        
        if (empty($ids)) {
            return response()->json([
                'validators' => []
            ]);
        }
        
        $query = DB::table('data.validators')
            ->leftJoin('data.countries', 'data.validators.country', '=', 'data.countries.name');
        
        // Only join favorites table if user is authenticated
        if ($userId) {
            $query->leftJoin('data.favorites', function($join) use ($userId) {
                $join->on('data.validators.id', '=', 'data.favorites.validator_id')
                     ->where('data.favorites.user_id', '=', $userId);
            })
            ->select('data.validators.*', 'data.favorites.id as favorite_id', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code');
        } else {
            $query->select('data.validators.*', 'data.countries.iso as country_iso', 'data.countries.iso3 as country_iso3', 'data.countries.phone_code as country_phone_code');
        }
        
        $validatorsData = $query
            ->whereIn('data.validators.id', $ids)
            ->orderBy('data.validators.id')
            ->get();

        return response()->json([
            'validators' => $validatorsData
        ]);
    }

    /**
     * Fetch validator metrics for SFDP calculation
     */
    public function getValidatorMetrics(Request $request)
    {
        $votePubkey = $request->input('votePubkey');
        $validatorIdentityPubkey = $request->input('validatorIdentityPubkey');
        
        if (!$votePubkey) {
            return response()->json(['error' => 'votePubkey is required'], 400);
        }
        
        // Get the validator data
        $validator = DB::table('data.validators')
            ->where('vote_pubkey', $votePubkey)
            ->first();
            
        if (!$validator) {
            return response()->json(['error' => 'Validator not found'], 404);
        }
        
        // Get current epoch from settings
        $settings = DB::table('data.settings')->first();
        $currentEpoch = $settings ? $settings->epoch : 0;
        
        // Get self-stake for this validator from stake_accounts table for all available epochs
        $selfStakeData = DB::table('data.stake_accounts')
            ->select('epoch', DB::raw('SUM(lamports) as total_lamports'))
            ->where('node_pubkey', $validatorIdentityPubkey)
            ->where('is_self_stake', true)
            ->groupBy('epoch')
            ->orderBy('epoch')
            ->get();
            
        // Convert to associative array for easier access
        $selfStakeByEpoch = [];
        foreach ($selfStakeData as $data) {
            $selfStakeByEpoch[$data->epoch] = $data->total_lamports / 1000000000; // Convert lamports to SOL
        }
        
        // Get current self-stake (for backward compatibility)
        $selfStakeLamports = DB::table('data.stake_accounts')
            ->where('node_pubkey', $validatorIdentityPubkey)
            ->where('is_self_stake', true)
            ->where('epoch', $currentEpoch)
            ->sum('lamports');
            
        $selfStake = $selfStakeLamports / 1000000000; // Convert lamports to SOL
        
        // Calculate self-stake trend information
        $selfStakeTrend = $this->calculateSelfStakeTrend($selfStakeByEpoch, $currentEpoch);
        
        // Get all validators to calculate cluster average
        $allValidators = DB::table('data.validators')
            ->whereNotNull('epoch_credits')
            ->get();
            
        // Calculate cluster average vote credits
        $totalCredits = 0;
        $validValidatorCount = 0;
        
        foreach ($allValidators as $v) {
            $epochCredits = json_decode($v->epoch_credits, true);
            if (!empty($epochCredits) && is_array($epochCredits)) {
                $lastCredit = end($epochCredits);
                if (is_array($lastCredit) && count($lastCredit) >= 2) {
                    $totalCredits += $lastCredit[1];
                    $validValidatorCount++;
                }
            }
        }
        
        $clusterAverageCredits = $validValidatorCount > 0 ? $totalCredits / $validValidatorCount : 0;
        
        // Get vote credits for current epoch
        $currentEpochCredits = 0;
        if ($validator->epoch_credits) {
            $epochCredits = json_decode($validator->epoch_credits, true);
            if (!empty($epochCredits) && is_array($epochCredits)) {
                $lastCredit = end($epochCredits);
                if (is_array($lastCredit) && count($lastCredit) >= 2) {
                    $currentEpochCredits = $lastCredit[1];
                }
            }
        }
        
        $metrics = [
            'validator' => [
                'name' => $validator->name,
                'votePubkey' => $validator->vote_pubkey,
                'nodePubkey' => $validator->node_pubkey,
                'currentEpoch' => $currentEpoch
            ],
            'voteCredits' => $currentEpochCredits,
            'clusterAverageCredits' => $clusterAverageCredits,
            'isDelinquent' => (bool)$validator->delinquent,
            'commission' => (int)($validator->commission ?? 0),
            'totalStake' => $validator->activated_stake ? $validator->activated_stake / 1000000000 : 0, // Convert lamports to SOL
            'selfStake' => $selfStake,
            'selfStakeHistory' => $selfStakeByEpoch, // Historical self-stake data
            'selfStakeTrend' => $selfStakeTrend, // Trend analysis of self-stake
            'infraConcentration' => null, // Not available in database
            'softwareVersion' => $validator->version ?? "unknown",
            'frankendancerVersion' => "unknown", // Not available in database
            'reportedEpochs' => null, // Not available in database
            'testnetEligibleEpochs' => null, // Not available in database
            'jitoMevCommission' => $validator->jito_commission ? $validator->jito_commission / 100 : null // Convert basis points to percentage
        ];
        
        return response()->json($metrics);
    }
    
    /**
     * Calculate trend information for self-stake based on historical data
     */
    private function calculateSelfStakeTrend($selfStakeByEpoch, $currentEpoch)
    {
        if (empty($selfStakeByEpoch)) {
            return [
                'trend' => 'unknown',
                'changePercent' => 0,
                'average' => 0,
                'min' => 0,
                'max' => 0
            ];
        }
        
        // Sort epochs in descending order to get the most recent first
        krsort($selfStakeByEpoch);
        $epochs = array_keys($selfStakeByEpoch);
        
        // Get the most recent and oldest values
        $mostRecentValue = $selfStakeByEpoch[$currentEpoch] ?? reset($selfStakeByEpoch);
        $oldestValue = end($selfStakeByEpoch);
        
        // Calculate percentage change
        $changePercent = 0;
        if ($oldestValue > 0) {
            $changePercent = (($mostRecentValue - $oldestValue) / $oldestValue) * 100;
        }
        
        // Calculate average
        $average = array_sum($selfStakeByEpoch) / count($selfStakeByEpoch);
        
        // Get min and max values
        $min = min($selfStakeByEpoch);
        $max = max($selfStakeByEpoch);
        
        // Determine trend
        $trend = 'stable';
        if ($changePercent > 5) {
            $trend = 'increasing';
        } elseif ($changePercent < -5) {
            $trend = 'decreasing';
        }
        
        return [
            'trend' => $trend,
            'changePercent' => round($changePercent, 2),
            'average' => round($average, 2),
            'min' => round($min, 2),
            'max' => round($max, 2)
        ];
    }
    
    /**
     * Fetch aggregated historical metrics for a validator
     */
    public function getHistoricalMetrics(Request $request)
    {
        $votePubkey = $request->input('votePubkey');
        $validatorIdentityPubkey = $request->input('validatorIdentityPubkey');
        
        if (!$votePubkey) {
            return response()->json(['error' => 'votePubkey is required'], 400);
        }
        
        // Get the validator data
        $validator = DB::table('data.validators')
            ->where('vote_pubkey', $votePubkey)
            ->first();
            
        if (!$validator) {
            return response()->json(['error' => 'Validator not found'], 404);
        }
        
        // Get current epoch from settings
        $settings = DB::table('data.settings')->first();
        $currentEpoch = $settings ? $settings->epoch : 0;
        
        // Get self-stake for this validator from stake_accounts table for all available epochs
        $selfStakeData = DB::table('data.stake_accounts')
            ->select('epoch', DB::raw('SUM(lamports) as total_lamports'))
            ->where('node_pubkey', $validatorIdentityPubkey)
            ->where('is_self_stake', true)
            ->groupBy('epoch')
            ->orderBy('epoch')
            ->get();
            
        // Convert to associative array for easier access
        $selfStakeByEpoch = [];
        foreach ($selfStakeData as $data) {
            $selfStakeByEpoch[$data->epoch] = $data->total_lamports / 1000000000; // Convert lamports to SOL
        }
        
        // Calculate self-stake trend information
        $selfStakeTrend = $this->calculateSelfStakeTrend($selfStakeByEpoch, $currentEpoch);
        
        // Get vote credits history
        $voteCreditsHistory = [];
        if ($validator->epoch_credits) {
            $epochCredits = json_decode($validator->epoch_credits, true);
            if (!empty($epochCredits) && is_array($epochCredits)) {
                // Get all available vote credits
                foreach ($epochCredits as $credit) {
                    $voteCreditsHistory[$credit[0]] = $credit[1]; // epoch => credits
                }
            }
        }
        
        // Calculate vote credits trend
        $voteCreditsTrend = $this->calculateVoteCreditsTrend($voteCreditsHistory, $currentEpoch);
        
        $historicalMetrics = [
            'validator' => [
                'name' => $validator->name,
                'votePubkey' => $validator->vote_pubkey,
                'nodePubkey' => $validator->node_pubkey,
                'currentEpoch' => $currentEpoch
            ],
            'selfStake' => [
                'history' => $selfStakeByEpoch,
                'trend' => $selfStakeTrend
            ],
            'voteCredits' => [
                'history' => $voteCreditsHistory,
                'trend' => $voteCreditsTrend
            ]
        ];
        
        return response()->json($historicalMetrics);
    }
    
    /**
     * Calculate trend information for vote credits based on historical data
     */
    private function calculateVoteCreditsTrend($voteCreditsHistory, $currentEpoch)
    {
        if (empty($voteCreditsHistory)) {
            return [
                'trend' => 'unknown',
                'changePercent' => 0,
                'average' => 0,
                'min' => 0,
                'max' => 0
            ];
        }
        
        // Sort epochs in descending order to get the most recent first
        krsort($voteCreditsHistory);
        $epochs = array_keys($voteCreditsHistory);
        
        // Get the most recent and oldest values
        $mostRecentValue = $voteCreditsHistory[$currentEpoch] ?? reset($voteCreditsHistory);
        $oldestValue = end($voteCreditsHistory);
        
        // Calculate percentage change
        $changePercent = 0;
        if ($oldestValue > 0) {
            $changePercent = (($mostRecentValue - $oldestValue) / $oldestValue) * 100;
        }
        
        // Calculate average
        $average = array_sum($voteCreditsHistory) / count($voteCreditsHistory);
        
        // Get min and max values
        $min = min($voteCreditsHistory);
        $max = max($voteCreditsHistory);
        
        // Determine trend
        $trend = 'stable';
        if ($changePercent > 5) {
            $trend = 'increasing';
        } elseif ($changePercent < -5) {
            $trend = 'decreasing';
        }
        
        return [
            'trend' => $trend,
            'changePercent' => round($changePercent, 2),
            'average' => round($average, 2),
            'min' => round($min, 2),
            'max' => round($max, 2)
        ];
    }

    public function markValidators(Request $request) {
        $checkedIds = $request->input('checkedIds', []);
        $value = $request->input('value');
        if (!empty($checkedIds) && in_array($value, ['highlight', 'top'])) {
            // Determine which field to update based on value
            if ($value === 'highlight')
                $field = 'is_highlighted';
            elseif ($value === 'top')
                $field = 'is_top';

            // Toggle field: false -> true, true -> false
            DB::statement(
                "UPDATE data.validators SET {$field} = NOT {$field} WHERE id = ANY(?)",
                ['{' . implode(',', $checkedIds) . '}']
            );
        }

        if (request()->header('X-Inertia')) {
            return back();
        }
    }

    public function addCompare(Request $request) {
        $user = $request->user();
        $validatorId = $request->input('validatorId');
        // DB::statement('SELECT data.toggle_comparisons(' .$user->id. ', ' .$validatorId. ')');
        DB::statement('SELECT data.validator_user_actions(' .$user->id. ', ' .$validatorId. ', \'compare\')');

        return response()->json([
            'success' => true,
            'message' => 'Comparison list updated'
        ]);
    }

    public function getComparisonCount(Request $request) {
        $user = $request->user();
        if ($user && $user->id) {
            // For registered users, count comparisons from database
            $count = DB::table('data.validators2users')
                ->where('user_id', $user->id)
                ->where('type', 'compare')
                ->where('user_id', $user->id)
                ->count();
                
            return response()->json([
                'count' => $count
            ]);
        }
        
        // For unregistered users, return 0 or handle appropriately
        return response()->json([
            'count' => 0
        ]);
    }

    public function addFavorite(Request $request) {
        $user = $request->user();
        if ($user->id) {
            $validatorId = $request->input('validatorId');
            // DB::statement('SELECT data.toggle_favorite(' .$user->id. ', ' .$validatorId. ')');
            DB::statement('SELECT data.validator_user_actions(' .$user->id. ', ' .$validatorId. ', \'favorite\')');
        }
        
        // Dispatch event for frontend to update favorite count
        // This would typically be done with Laravel's event broadcasting
        // For now, we'll just return a success response
        
        return response()->json([
            'success' => true,
            'message' => 'Favorites list updated'
        ]);
    }

    public function getFavoriteCount(Request $request) {
        $user = $request->user();
        if ($user && $user->id) {
            // For registered users, count favorites from database
            $count = DB::table('data.validators2users')
                ->where('user_id', $user->id)
                ->where('type', 'favorite')
                ->count();
                
            return response()->json([
                'count' => $count
            ]);
        }
        
        // For unregistered users, return 0 or handle appropriately
        return response()->json([
            'count' => 0
        ]);
    }

    public function addNotice(Request $request) {
        $user = $request->user();
        if ($user->id) {
            $validatorId = $request->input('validatorId');
            // DB::statement('SELECT data.toggle_favorite(' .$user->id. ', ' .$validatorId. ')');
            DB::statement('SELECT data.validator_user_actions(' .$user->id. ', ' .$validatorId. ', \'notice\')');
        }
        
        // Dispatch event for frontend to update favorite count
        // This would typically be done with Laravel's event broadcasting
        // For now, we'll just return a success response
        
        return response()->json([
            'success' => true,
            'message' => 'Notice list updated'
        ]);
    }

    public function getNoticeCount(Request $request) {
        $user = $request->user();
        if ($user && $user->id) {
            // For registered users, count favorites from database
            $count = DB::table('data.validators2users')
                ->where('user_id', $user->id)
                ->where('type', 'notice')
                ->count();
                
            return response()->json([
                'count' => $count
            ]);
        }
        
        // For unregistered users, return 0 or handle appropriately
        return response()->json([
            'count' => 0
        ]);
    }

    public function banValidator(Request $request) {
        $user = $request->user();
        
        $validatorId = $request->input('validatorId');
        // Assuming there's a ban function in the database
        $result = DB::statement('SELECT data.toggle_ban(' .$user->id. ', ' .$validatorId. ')');
        
        return response()->json([
            'success' => true,
            'message' => 'Ban status updated'
        ]);
    }

    public function updateOrder(Request $request)
    {
        // $request->validate([
        //     'validatorIds' => 'required|array',
        //     'validatorIds.*' => 'integer|exists:validators,id',
        //     'listType' => 'required|string'
        // ]);
        
        $validatorIds = $request->input('validatorIds');
        $listType = $request->input('listType', 'top');
        // Removed debugging statement
        // exit;
        // Use a transaction to ensure data consistency
        // DB::transaction(function () use ($validatorIds, $listType) {
        //     // Delete existing order records for this list type
        //     ValidatorOrder::where('list_type', $listType)->delete();
            
        //     // Create new order records
        //     foreach ($validatorIds as $index => $validatorId) {
        //         ValidatorOrder::create([
        //             'validator_id' => $validatorId,
        //             'sort_order' => $index,
        //             'list_type' => $listType
        //         ]);
        //     }
        // });
        
        return response()->json(['message' => 'Order updated successfully']);
    }
    
    /**
     * Get the order of validators for a specific list type
     *
     * @param  string  $listType
     * @return \Illuminate\Http\Response
     */
    public function getOrder($listType = 'top')
    {
        $orderRecords = ValidatorOrder::where('list_type', $listType)
            ->join('validators', 'validator_orders.validator_id', '=', 'validators.id')    
            ->orderBy('sort_order')
            ->get(['validator_id', 'sort_order']);
            // Removed debugging statement
            // exit;
        return response()->json($orderRecords);
    }


    public function getValidatorScore(Request $request)
    {
        $pubkey = $request->query('pubkey');
        
        // Simple validation - ensure we have a pubkey parameter
        if (!$pubkey) {
            return response()->json(['error' => 'pubkey parameter required'], 400);
        }

        // Кэшируем данные на 10 секунд
        $data = Cache::remember('validator_' . $pubkey, 10, function () use ($pubkey) {
            // First try to get from database (new approach)
            $validator = DB::table('validator_scores')->where('vote_pubkey', $pubkey)->first();
            
            if ($validator) {
                // Return data from database
                return [
                    'rank' => $validator->rank,
                    'votePubkey' => $validator->vote_pubkey,
                    'nodePubkey' => $validator->node_pubkey,
                    'uptime' => $validator->uptime,
                    'rootSlot' => $validator->root_slot,
                    'voteSlot' => $validator->vote_slot,
                    'commission' => (float)$validator->commission,
                    'credits' => $validator->credits,
                    'version' => $validator->version,
                    'stake' => $validator->stake,
                    'stakePercent' => $validator->stake_percent,
                ];
            }
            
            // Fallback to old method if not found in database
            // Check if we should use SSH (for local development) or direct execution (for server)
            $useSSH = env('VALIDATOR_USE_SSH', false);
            
            if ($useSSH) {
                return $this->getValidatorScoreViaSSH($pubkey);
            } else {
                return $this->getValidatorScoreLocally($pubkey);
            }
        });

        if (isset($data['error'])) {
            return response()->json(['error' => $data['error']], 404);
        }

        return response()->json($data);
    }
    
    /**
     * Get validator score via SSH connection (for local development)
     */
    private function getValidatorScoreViaSSH($pubkey)
    {
        $ssh = null;
        try {
            // Подключение к удалённому серверу
            $ssh = new SSH2(env('VALIDATOR_SERVER_HOST', '103.167.235.81')); // IP сервера
            
            // Set timeout for the connection
            $ssh->setTimeout(30);
            
            // Try to login
            $loginSuccess = $ssh->login(env('VALIDATOR_SERVER_USER', 'root'), env('VALIDATOR_SERVER_PASSWORD'));
            
            if (!$loginSuccess) {
                Log::error('SSH login failed for validator score fetch - login returned false');
                return ['error' => 'SSH login failed - invalid credentials'];
            }

            // Use the confirmed working path for solana command
            $solanaPath = "/usr/local/bin/solana";
            
            // Use the exact same command that works on the server
            $validatorCommand = "$solanaPath validators -um --sort=credits -r -n | grep -e " . escapeshellarg($pubkey);
            $output = $ssh->exec($validatorCommand);
            $exitStatus = $ssh->getExitStatus();

            // Log the command and output for debugging
            Log::info('SSH command execution', [
                'command' => $validatorCommand,
                'exit_status' => $exitStatus,
                'output_length' => strlen($output),
                'output_preview' => substr($output, 0, 100)
            ]);

            // Even if grep returns exit status 1 (not found), we might still have output
            // Only consider it an error if we have no output
            if (!$output || trim($output) === '') {
                Log::error('Validator not found for pubkey: ' . $pubkey . ' Exit status: ' . $exitStatus);
                return ['error' => 'Validator not found', 'pubkey' => $pubkey, 'exit_status' => $exitStatus];
            }

            // Парсинг: "192 Hgo... DHo... 0% 368557078 ( 0) 368557047 ( 0) 0.00% 975094 2.3.8 15888.204260276 SOL (0.00%)"
            $parts = preg_split('/\s+/', trim($output));

            // Based on the actual output, we need 17 parts minimum
            if (count($parts) < 17) {
                Log::error('Invalid CLI output format for pubkey: ' . $pubkey . ' with parts count: ' . count($parts));
                Log::error('Output was: ' . $output);
                return ['error' => 'Invalid CLI output format', 'parts_count' => count($parts), 'output' => $output, 'parts' => $parts];
            }

            // Parse the output correctly based on actual format
            return [
                'rank' => (int)$parts[0],                    // 186
                'votePubkey' => $parts[2],                   // HgozywotiKv4F5g3jCgideF3gh9sdD3vz4QtgXKjWCtB
                'nodePubkey' => $parts[3],                   // DHoZJqvvMGvAXw85Lmsob7YwQzFVisYg8HY4rt5BAj6M
                'uptime' => $parts[4],                       // 0%
                'rootSlot' => (int)str_replace(['(', ')'], '', $parts[5]), // 368561621
                'voteSlot' => (int)str_replace(['(', ')'], '', $parts[8]), // 368561590
                'commission' => (float)str_replace('%', '', $parts[11]),   // 0.00%
                'credits' => (int)$parts[12],                // 1047512
                'version' => $parts[13],                     // 2.3.8
                'stake' => $parts[14],                       // 15888.204260276
                'stakePercent' => str_replace(['(', ')', '%'], '', $parts[16]), // 0.00%
            ];
        } catch (\Exception $e) {
            Log::error('Exception in getValidatorScoreViaSSH: ' . $e->getMessage());
            return ['error' => 'Exception occurred: ' . $e->getMessage()];
        } finally {
            // Ensure SSH connection is closed
            if ($ssh instanceof SSH2) {
                try {
                    $ssh->disconnect();
                } catch (\Exception $e) {
                    Log::warning('Failed to disconnect SSH: ' . $e->getMessage());
                }
            }
        }
    }
    
    /**
     * Get validator score locally (for server deployment)
     */
    private function getValidatorScoreLocally($pubkey)
    {
        try {
            // Use the symbolic link path which should be accessible to all users
            $solanaPath = "/usr/local/bin/solana";
            
            // Check if the solana binary exists and is executable via the symbolic link
            if (!file_exists($solanaPath) || !is_executable($solanaPath)) {
                Log::error('Solana binary not accessible via symbolic link', [
                    'path' => $solanaPath,
                    'exists' => file_exists($solanaPath),
                    'executable' => is_executable($solanaPath)
                ]);
                
                // Fallback to direct path
                $solanaPath = "/root/.local/share/solana/install/active_release/bin/solana";
                if (!file_exists($solanaPath) || !is_executable($solanaPath)) {
                    return ['error' => 'Solana binary not found or not executable'];
                }
            }
            
            // Execute the command using the accessible path
            $command = "$solanaPath validators -um --sort=credits -r -n | grep -e " . escapeshellarg($pubkey);
            
            // Add environment variables that might be needed
            $env = [
                'HOME' => getenv('HOME') ?: '/var/www',
                'PATH' => getenv('PATH') ?: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
                'SHELL' => getenv('SHELL') ?: '/bin/bash'
            ];
            
            $process = Process::fromShellCommandline($command, null, $env, null, 60);
            
            // Run with more verbose error handling
            $process->run();
            
            $output = $process->getOutput();
            $errorOutput = $process->getErrorOutput();
            $exitCode = $process->getExitCode();
            
            // Log detailed information for debugging
            Log::info('Validator command execution details', [
                'command' => $command,
                'exit_code' => $exitCode,
                'output_length' => strlen($output),
                'output' => $output,
                'error_output' => $errorOutput,
                'working_directory' => getcwd(),
                'user' => get_current_user(),
                'env_path' => $env['PATH']
            ]);
            
            // Even if grep returns exit code 1 (no matches), we might still have valid output
            // But if we have no output at all, then it's an error
            if (!$output || trim($output) === '') {
                // Let's also check if there's meaningful error output
                if ($errorOutput && trim($errorOutput) !== '' && strpos($errorOutput, 'not found') === false) {
                    Log::error('Command execution failed with error output', [
                        'error_output' => $errorOutput,
                        'exit_code' => $exitCode
                    ]);
                    return ['error' => 'Command execution failed', 'pubkey' => $pubkey, 'exit_code' => $exitCode, 'error_output' => $errorOutput];
                }
                
                return ['error' => 'Validator not found', 'pubkey' => $pubkey, 'exit_code' => $exitCode, 'error_output' => $errorOutput];
            }

            // Парсинг: "192 Hgo... DHo... 0% 368557078 ( 0) 368557047 ( 0) 0.00% 975094 2.3.8 15888.204260276 SOL (0.00%)"
            $parts = preg_split('/\s+/', trim($output));

            // Based on the actual output, we need 17 parts minimum
            if (count($parts) < 17) {
                return ['error' => 'Invalid CLI output format', 'parts_count' => count($parts), 'output' => $output, 'parts' => $parts];
            }

            // Parse the output correctly based on actual format
            return [
                'rank' => (int)$parts[0],                    // 186
                'votePubkey' => $parts[2],                   // HgozywotiKv4F5g3jCgideF3gh9sdD3vz4QtgXKjWCtB
                'nodePubkey' => $parts[3],                   // DHoZJqvvMGvAXw85Lmsob7YwQzFVisYg8HY4rt5BAj6M
                'uptime' => $parts[4],                       // 0%
                'rootSlot' => (int)str_replace(['(', ')'], '', $parts[5]), // 368561621
                'voteSlot' => (int)str_replace(['(', ')'], '', $parts[8]), // 368561590
                'commission' => (float)str_replace('%', '', $parts[11]),   // 0.00%
                'credits' => (int)$parts[12],                // 1047512
                'version' => $parts[13],                     // 2.3.8
                'stake' => $parts[14],                       // 15888.204260276
                'stakePercent' => str_replace(['(', ')', '%'], '', $parts[16]), // 0.00%
            ];
        } catch (\Exception $e) {
            Log::error('Exception in getValidatorScoreLocally: ' . $e->getMessage(), ['exception' => $e]);
            return ['error' => 'Exception occurred: ' . $e->getMessage()];
        }
    }

    public function export(Request $request)
    {
        // Get all validators data for export
        $validators = DB::table('data.validators')
            ->select([
                'id',
                'vote_pubkey',
                'node_pubkey',
                'name',
                'activated_stake',
                'commission'
            ])
            ->get()
            ->toArray();

        // Convert to array format expected by ValidatorExport
        $data = array_map(function ($validator) {
            return [
                $validator->id,
                $validator->vote_pubkey,
                $validator->node_pubkey,
                $validator->name,
                $validator->activated_stake,
                $validator->commission
            ];
        }, $validators);

        return Excel::download(new ValidatorExport($data), 'validators_export.xlsx');
    }


    
    
    /**
     * Get validator score locally (for server deployment)
     */
    private function getValidatorScoreLocallyOld($pubkey)
    {
        try {
            // Execute the solana command directly (as confirmed it works on the server)
            // $command = "solana validators -um --sort=credits -r -n | grep -e " . escapeshellarg($pubkey);
            // $command = "solana validators -um --sort=credits -r -n | grep -e " . escapeshellarg($pubkey);
            $command = "/root/.local/share/solana/install/active_release/bin/solana validators -um --sort=credits -r -n | grep -e HgozywotiKv4F5g3jCgideF3gh9sdD3vz4QtgXKjWCtB";
            $process = Process::fromShellCommandline($command, null, null, null, 30);
            
            // Run with more verbose error handling
            $process->run();
            
            $output = $process->getOutput();

            $process = Process::fromShellCommandline($command);
            $process->setTimeout(30);
            $process->run(); 
            
            // Even if grep returns exit status 1 (not found), we might still have output
            // Only consider it an error if we have no output at all
            $output = $process->getOutput();
            if (!$output || trim($output) === '') {
                // Log the error for debugging
                $errorOutput = $process->getErrorOutput();
                $exitCode = $process->getExitCode();
                
                Log::error('Validator not found or command failed for pubkey: ' . $pubkey . ' Exit code: ' . $exitCode . ' Error: ' . $errorOutput);
                
                // Even with exit code 1, if we have output it's still valid
                if ($exitCode == 1 && strpos($errorOutput, 'not found') === false) {
                    // This is normal for grep when no matches found, continue
                } else {
                    return ['error' => 'Validator not found or command failed', 'pubkey' => $pubkey, 'exit_code' => $exitCode, 'error_output' => $errorOutput];
                }
            }

            // If we have no output, that means validator not found
            if (!$output || trim($output) === '') {
                Log::error('Validator not found for pubkey: ' . $pubkey);
                return ['error' => 'Validator not found', 'pubkey' => $pubkey];
            }

            // Парсинг: "192 Hgo... DHo... 0% 368557078 ( 0) 368557047 ( 0) 0.00% 975094 2.3.8 15888.204260276 SOL (0.00%)"
            $parts = preg_split('/\s+/', trim($output));

            // Based on the actual output, we need 17 parts minimum
            if (count($parts) < 17) {
                Log::error('Invalid CLI output format for pubkey: ' . $pubkey . ' with parts count: ' . count($parts));
                Log::error('Output was: ' . $output);
                return ['error' => 'Invalid CLI output format', 'parts_count' => count($parts), 'output' => $output, 'parts' => $parts];
            }

            // Parse the output correctly based on actual format
            return [
                'rank' => (int)$parts[0],                    // 186
                'votePubkey' => $parts[2],                   // HgozywotiKv4F5g3jCgideF3gh9sdD3vz4QtgXKjWCtB
                'nodePubkey' => $parts[3],                   // DHoZJqvvMGvAXw85Lmsob7YwQzFVisYg8HY4rt5BAj6M
                'uptime' => $parts[4],                       // 0%
                'rootSlot' => (int)str_replace(['(', ')'], '', $parts[5]), // 368561621
                'voteSlot' => (int)str_replace(['(', ')'], '', $parts[8]), // 368561590
                'commission' => (float)str_replace('%', '', $parts[11]),   // 0.00%
                'credits' => (int)$parts[12],                // 1047512
                'version' => $parts[13],                     // 2.3.8
                'stake' => $parts[14],                       // 15888.204260276
                'stakePercent' => str_replace(['(', ')', '%'], '', $parts[16]), // 0.00%
            ];
        } catch (\Exception $e) {
            Log::error('Exception in getValidatorScoreLocally: ' . $e->getMessage());
            return ['error' => 'Exception occurred: ' . $e->getMessage()];
        }
    }
} 
