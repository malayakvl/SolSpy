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
        Log::info('Telegram webhook request: ', $request->all());

        $message = $request->message ?? null;
        if (!$message) {
            return response()->json(['status' => 'ok']);
        }

        $chatId = $message['chat']['id'];
        $text = $message['text'] ?? '';

        // If command /start TOKEN
        if (str_starts_with($text, '/start ')) {
            $token = trim(str_replace('/start', '', $text));

            $link = TelegramLink::where('token', $token)->first();

            if ($link) {
                $link->chat_id = $chatId;
                $link->save();

                $this->sendTelegramMessage($chatId, "✅ Telegram notifications enabled!\nYou will now receive alerts.");
            } else {
                $this->sendTelegramMessage($chatId, "❌ Token invalid or expired.");
            }

            return response()->json(['status' => 'linked']);
        }

        // If user just types /start without token
        if ($text === '/start') {
            $this->sendTelegramMessage($chatId, "👋 Hi! Please click the button on the website to connect Telegram.");
        }

        return response()->json(['status' => 'ok']);
    }

    private function sendTelegramMessage($chatId, $text)
    {
        $token = env('TELEGRAM_BOT_TOKEN');

        Http::post("https://api.telegram.org/bot{$token}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $text
        ]);
    }
}
