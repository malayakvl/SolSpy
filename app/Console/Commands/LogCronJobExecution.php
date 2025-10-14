<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class LogCronJobExecution extends Command
{
    // Укажи точную сигнатуру команды
    protected $signature = 'app:log-cron-job-execution {message} {--success} {--output=}';

    protected $description = 'Log a cron execution message for testing the scheduler';

    public function handle()
    {
        // Получаем аргументы и опции
        $message = $this->argument('message');
        $success = $this->option('success');
        $output = $this->option('output');

        // Формируем сообщение для лога
        $logMessage = $output ?? ($success ? "$message - SUCCESS" : "$message - FAILED");

        // Записываем в лог (используем канал 'cron', если настроен, или 'default')
        Log::channel('cron')->info($logMessage);

        // Выводим в консоль
        $this->info($logMessage);

        return 0; // Успешное выполнение
    }
}