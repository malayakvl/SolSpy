<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\TelegramLink;
use Illuminate\Support\Facades\Log;

class TelegramConnectController extends Controller
{
    public function generateLink(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        // Генерируем безопасный токен (32 символа)
        $token = Str::random(32);

        // Сохраняем токен в таблицу telegram_links
        $link = TelegramLink::updateOrCreate(
            ['user_id' => $user->id],
            [
                'token' => $token,
                'chat_id' => null // пока пользователь не привязан
            ]
        );

        // Берём имя бота из .env
        $botName = env('TELEGRAM_BOT_NAME', 'solspyapp_bot');

        // Логируем генерацию ссылки
        Log::channel('telegram')->info("Generated Telegram link for user {$user->id}", [
            'token' => $token
        ]);

        // Возвращаем ссылку пользователю
        return response()->json([
            'url' => "https://t.me/{$botName}?start={$token}",
        ]);
    }
}
