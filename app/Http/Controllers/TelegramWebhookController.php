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
        // Логируем весь update в отдельный лог
        Log::channel('telegram')->info('Webhook request:', $request->all());

        // Достаём сообщение из всех возможных полей
        $message = $request->message
            ?? $request->edited_message
            ?? ($request->callback_query['message'] ?? null);

        if (!$message) {
            Log::channel('telegram')->warning('No message found in Telegram update', $request->all());
            return response()->json(['status' => 'ok']);
        }

        $chatId = $message['chat']['id'] ?? null;
        $text = $message['text'] ?? '';

        if (!$chatId) {
            Log::channel('telegram')->warning('No chat_id found in message', $request->all());
            return response()->json(['status' => 'ok']);
        }

        // Обработка команды /start <token>
        if (str_starts_with($text, '/start ')) {
            $token = ltrim(trim(str_replace('/start', '', $text)));

            $link = TelegramLink::where('token', $token)->first();

            if ($link) {
                $link->chat_id = $chatId;
                $link->save();

                Log::channel('telegram')->info("Chat_id {$chatId} saved for token {$token}");

                $this->sendTelegramMessage($chatId, "✅ Telegram notifications enabled!\nYou will now receive alerts.");
            } else {
                Log::channel('telegram')->warning("Token {$token} not found for chat {$chatId}");
                $this->sendTelegramMessage($chatId, "❌ Token invalid or expired.");
            }

            return response()->json(['status' => 'linked']);
        }

        // Если пользователь написал просто /start
        if ($text === '/start') {
            $this->sendTelegramMessage($chatId, "👋 Hi! Please click the button on the website to connect Telegram.");
        }

        return response()->json(['status' => 'ok']);
    }

    private function sendTelegramMessage($chatId, $text)
    {
        $token = env('TELEGRAM_BOT_TOKEN');

        if (!$token) {
            Log::channel('telegram')->error('TELEGRAM_BOT_TOKEN not set in .env');
            return;
        }

        try {
            Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $text,
            ]);
        } catch (\Exception $e) {
            Log::channel('telegram')->error('Error sending Telegram message: ' . $e->getMessage(), [
                'chat_id' => $chatId,
                'text' => $text
            ]);
        }
    }
}
