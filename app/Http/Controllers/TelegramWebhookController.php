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
        Log::channel('telegram')->info('Webhook request', $request->all());

        // ✅ Callback от inline-кнопки
        if (isset($request['callback_query'])) {
            $callback = $request['callback_query'];
            $chatId = $callback['from']['id'];

            // Ищем последнюю запись без chat_id
            $link = TelegramLink::whereNull('chat_id')
                ->orderBy('id', 'desc')
                ->first();

            if ($link) {
                $link->chat_id = $chatId;
                $link->save();

                $this->sendTelegramMessage($chatId, "✅ Telegram успешно подключён!");
                Log::channel('telegram')->info("Chat_id {$chatId} saved via callback");

            } else {
                $this->sendTelegramMessage($chatId, "⚠️ Не найден токен. Попробуйте подключить снова.");
                Log::channel('telegram')->warning("Callback but no pending token for chat {$chatId}");
            }

            return response()->json(['status' => 'callback_handled']);
        }

        // ✅ Обычные сообщения
        $message = $request->message ?? null;
        if (!$message) {
            return response()->json(['status' => 'ok']);
        }

        $chatId = $message['chat']['id'];
        $text = trim($message['text'] ?? '');

        // ✅ Пользователь запускает /start
        if ($text === '/start') {
            $this->sendTelegramMessageWithButton(
                $chatId,
                "👋 Привет! Чтобы завершить привязку Telegram, нажмите кнопку ниже 👇"
            );

            return response()->json(['status' => 'start_button_sent']);
        }

        // ✅ Обработка deep-link (если вдруг Telegram передал `/start token`)
        if (str_starts_with($text, '/start ')) {
            $token = trim(str_replace('/start', '', $text));

            $link = TelegramLink::where('token', $token)->first();

            if ($link) {
                $link->chat_id = $chatId;
                $link->save();

                $this->sendTelegramMessage($chatId, "✅ Telegram подключён!");
                Log::channel('telegram')->info("Chat_id {$chatId} saved via deep-link");
            } else {
                $this->sendTelegramMessage($chatId, "❌ Неверный или просроченный токен.");
                Log::channel('telegram')->warning("Invalid token {$token} via deep-link");
            }

            return response()->json(['status' => 'linked']);
        }

        // ✅ Любые другие сообщения
        $this->sendTelegramMessage($chatId, "ℹ️ Используйте кнопку для подключения.");
        return response()->json(['status' => 'ok']);
    }

    private function sendTelegramMessage(string $chatId, string $text): void
    {
        $token = env('TELEGRAM_BOT_TOKEN');

        Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $text,
        ]);
    }

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