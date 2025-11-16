# Telegram уведомления для Laravel + React

## 📌 Описание

Этот проект позволяет:

- Пользователям подписываться на Telegram уведомления через кнопку на сайте  
- Сохранять их `chat_id` в базе данных  
- Отправлять уведомления через Telegram API  
- Использовать ngrok для локального или серверного тестирования без HTTPS

---

## ⚙️ Требования

- Laravel ≥ 9.x  
- PHP ≥ 8.x  
- PostgreSQL  
- React (frontend)  
- ngrok (для публичного URL на сервере/локалке)  
- Telegram бот (токен)  

---

## 1️⃣ Настройка `.env`

```env
APP_URL=http://localhost
TELEGRAM_BOT_TOKEN=ВАШ_БОТ_ТОКЕН
TELEGRAM_BOT_NAME=solspyapp_bot
NGROK_URL=https://ваш_ngrok_url
```

```bash
sudo apt install ngrok
ngrok config add-authtoken ВАШ_ТОКЕН
```

```bash
sudo ngrok http 80
https://xxxxx.ngrok-free.dev -> http://localhost:80
```
```bash
BOT_TOKEN="ВАШ_БОТ_ТОКЕН"
NGROK_URL="https://xxxxx.ngrok-free.dev"
```
##  Обязательно - устанавливаем webhook

```bash
curl -F "url=${NGROK_URL}/api/telegram/webhook" \
"https://api.telegram.org/bot${BOT_TOKEN}/setWebhook"
```

##  Проверяем webhook

```bash
curl "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | jq
```


```bash
| Действие                 | Команда                        |
| ------------------------ | ------------------------------ |
| **Остановить сервис**    | `sudo systemctl stop ngrok`    |
| **Запустить сервис**     | `sudo systemctl start ngrok`   |
| **Перезапустить**        | `sudo systemctl restart ngrok` |
| **Отключить автозапуск** | `sudo systemctl disable ngrok` |
| **Включить автозапуск**  | `sudo systemctl enable ngrok`  |
| **Проверить статус**     | `sudo systemctl status ngrok`  |
| **Посмотреть логи**      | `sudo journalctl -u ngrok -f`  |
```