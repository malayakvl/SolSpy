<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class RpcProxyController extends Controller
{
    protected $rpcUrl = 'http://103.167.235.81:8899'; // URL приватная нода

    public function proxy(Request $request)
    {
        // Пересылаем JSON-RPC запрос на ноду
        $response = Http::withHeaders([
            'Content-Type' => 'application/json'
        ])->post($this->rpcUrl, $request->all());

        // Возвращаем JSON обратно клиенту
        return $response->json();
    }
}
