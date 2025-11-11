<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TelegramLink;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class TelegramWebhookController extends Controller
{
    public function handle(Request $request)
    {
        // 1️⃣ Логируем весь приходящий запрос
        Log::channel('telegram')->info('Webhook request received', $request->all());

        // 2️⃣ Callback от inline-кнопки (сначала)
        if (isset($request['callback_query'])) {
            $callback = $request['callback_query'];
            $chatId = $callback['from']['id'] ?? null;
            Log::channel('telegram')->info('Callback received', ['chat_id' => $chatId]);

            // Ищем последнюю запись без chat_id
            $link = TelegramLink::whereNull('chat_id')->orderBy('id', 'desc')->first();

            if ($link) {
                $link->chat_id = $chatId;
                $link->save();

                // ✅ Сообщение о подключении
                $this->sendTelegramMessage($chatId, "✅ Telegram успешно подключён! 🎉 Вы теперь будете получать уведомления.");

                Log::channel('telegram')->info("Chat_id {$chatId} saved via callback");
            } else {
                $this->sendTelegramMessage($chatId, "⚠️ Не найден токен. Попробуйте подключить снова.");
                Log::channel('telegram')->warning("Callback but no pending token for chat {$chatId}");
            }

            return response()->json(['status' => 'callback_handled']);
        }

        // 3️⃣ Обычные сообщения
        $message = $request->message ?? null;
        if (!$message) {
            Log::channel('telegram')->info('No message in request');
            return response()->json(['status' => 'ok']);
        }

        $chatId = $message['chat']['id'] ?? null;
        $text = trim($message['text'] ?? '');
        Log::channel('telegram')->info('Processing message', [
            'chat_id' => $chatId,
            'text' => $text,
            'hex_text' => bin2hex($text)
        ]);

        // 4️⃣ Обработка deep-link /start TOKEN
        if (preg_match('/^\/start\s+(\S+)$/', $text, $matches)) {
            $token = $matches[1];
            Log::channel('telegram')->info('Deep-link detected', [
                'chat_id' => $chatId,
                'token' => $token
            ]);

            $link = TelegramLink::where('token', $token)->first();

            if ($link) {
                $link->chat_id = $chatId;
                $link->save();

                // ✅ Сообщение о подключении
                $this->sendTelegramMessage($chatId, "✅ Telegram подключён! 🎉 Вы теперь будете получать уведомления.");

                Log::channel('telegram')->info("Chat_id {$chatId} saved via deep-link", ['token' => $token]);
            } else {
                $this->sendTelegramMessage($chatId, "❌ Неверный или просроченный токен.");
                Log::channel('telegram')->warning("Invalid token {$token} via deep-link", ['chat_id' => $chatId]);
            }

            return response()->json(['status' => 'linked']);
        }

        // 5️⃣ Plain /start
        if ($text === '/start') {
            Log::channel('telegram')->info('Received /start, sending inline button', ['chat_id' => $chatId]);
            $this->sendTelegramMessageWithButton(
                $chatId,
                "👋 Привет! Чтобы завершить привязку Telegram, нажмите кнопку ниже 👇"
            );

            return response()->json(['status' => 'start_button_sent']);
        }

        // 6️⃣ Любые другие сообщения
        Log::channel('telegram')->info('Other message received', [
            'chat_id' => $chatId,
            'text' => $text
        ]);
        $this->sendTelegramMessage($chatId, "ℹ️ Используйте кнопку для подключения.");
        return response()->json(['status' => 'ok']);
    }

    // Отправка простого сообщения
    private function sendTelegramMessage(string $chatId, string $text): void
    {
        $token = env('TELEGRAM_BOT_TOKEN');
        Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $text,
        ]);
    }

    // Отправка inline-кнопки
    private function sendTelegramMessageWithButton(string $chatId, string $text): void
    {
        $token = env('TELEGRAM_BOT_TOKEN');
        Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $text,
            'reply_markup' => [
                'inline_keyboard' => [
                    [
                        [
                            'text' => '✅ Подтвердить Telegram',
                            'callback_data' => 'confirm_telegram',
                        ],
                    ],
                ],
            ],
        ]);
    }
}
