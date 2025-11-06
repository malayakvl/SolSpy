<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\TelegramLink;

class TelegramConnectController extends Controller
{
    public function generateLink(Request $request)
    {
        $user = $request->user();
        // Генерируем безопасный токен (один раз)
        $token = Str::random(32);

        // Сохраняем токен в таблицу (пока таблицы нет — создадим дальше)
        TelegramLink::updateOrCreate(
            ['user_id' => $user->id],
            ['token' => $token]
        );

        // Возвращаем ссылку
        $botName = 'solspyapp_bot'; // <-- потом вынесем в .env

        return response()->json([
            'url' => "https://t.me/{$botName}?start={$token}",
        ]);
    }
}
