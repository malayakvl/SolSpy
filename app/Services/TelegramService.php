<?php

namespace App\Services;

class TelegramService
{
    public static function sendMessage(string $text, string $chatId)
    {
        $token = env('TELEGRAM_BOT_TOKEN');

        $url = "https://api.telegram.org/bot{$token}/sendMessage";

        $data = [
            'chat_id' => $chatId,
            'text'    => $text,
            'parse_mode' => 'HTML',
        ];

        file_get_contents($url . "?" . http_build_query($data));
    }
}
