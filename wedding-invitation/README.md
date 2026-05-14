# Свадебное приглашение Андрея и Алёны

Mobile-first веб-приглашение с таймером, картой, галереей образов, RSVP-формой и отправкой заявок в Telegram группу.

## Структура

- `index.html` - основная страница.
- `server.js` - Node.js сервер для Timeweb Cloud: отдаёт сайт и принимает `/api/rsvp`.
- `package.json` - команда запуска `npm start`.
- `assets/css/style.css` - стили и адаптив.
- `assets/js/countdown.js` - обратный отсчет до 18 июля 2026, 11:00.
- `assets/js/main.js` - анимации, слайдер, форма, музыка, конфетти.
- `assets/js/telegram-bot.js` - клиентский сервис отправки RSVP и локальный backup.
- `api/rsvp.js` - serverless endpoint для Vercel/Netlify-формата, оставлен как запасной вариант.
- `assets/images` - фото пары, образы гостей, палитра, референсы.
- `assets/audio` - музыка для кнопки включения.

## Как создать Telegram бота

1. Откройте Telegram и найдите `@BotFather`.
2. Отправьте команду `/newbot`.
3. Укажите имя бота, например `Andrey Alena Wedding RSVP`.
4. Укажите username бота, который заканчивается на `bot`, например `andrey_alena_rsvp_bot`.
5. BotFather выдаст токен вида `123456789:AA...`. Сохраните его.

## Как получить ID группы или чата

1. Добавьте созданного бота в нужную Telegram группу.
2. Дайте боту право читать/отправлять сообщения.
3. Напишите любое сообщение в группе.
4. Откройте в браузере:

```text
https://api.telegram.org/botВАШ_ТОКЕН/getUpdates
```

5. Найдите объект `chat` и поле `id`. Для групп ID обычно отрицательный, например `-1001234567890`.

## Куда вставить данные

Токен нельзя хранить в браузерном JavaScript. Его нужно передать в переменные окружения на хостинге.

Для Timeweb Cloud App Platform добавьте переменные:

```text
TELEGRAM_BOT_TOKEN=новый_токен_бота
TELEGRAM_CHAT_ID=id_группы_или_чата
```

## Деплой на Timeweb Cloud App Platform

1. Загрузите проект в GitHub/GitLab или другой репозиторий, который можно подключить к Timeweb Cloud.
2. В Timeweb Cloud откройте `App Platform` и создайте приложение.
3. Тип приложения: `Backend` или `Node.js`.
4. Директория проекта: `wedding-invitation`, если репозиторий содержит всю текущую папку выше. Если в репозитории лежит только содержимое `wedding-invitation`, оставьте корень проекта.
5. Команда установки: можно оставить пустой или указать:

```bash
npm install
```

6. Команда запуска:

```bash
npm start
```

7. Переменные окружения:

```text
TELEGRAM_BOT_TOKEN=новый_токен_бота
TELEGRAM_CHAT_ID=id_группы_или_чата
```

8. После запуска откройте домен приложения. Главная страница должна открыться сразу, а форма будет отправлять POST-запрос на `/api/rsvp`.

Timeweb Cloud обычно сам передает порт в переменной `PORT`. В `server.js` это уже учтено:

```js
const port = Number(process.env.PORT || 3000);
```

## Локальный запуск Node.js версии

Из папки `wedding-invitation`:

```bash
npm start
```

Откройте:

```text
http://localhost:3000
```

Для локального теста Telegram перед запуском нужно задать переменные окружения:

```bash
TELEGRAM_BOT_TOKEN=новый_токен TELEGRAM_CHAT_ID=id_чата npm start
```

Если переменные не заданы, сайт откроется, но RSVP покажет ошибку отправки и сохранит заявку в `localStorage`.

## Альтернативные хостинги

Для Vercel:

```bash
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_CHAT_ID
```

Для Netlify используйте раздел `Site configuration -> Environment variables` и добавьте:

```text
TELEGRAM_BOT_TOKEN=ваш_токен
TELEGRAM_CHAT_ID=id_группы
```

После деплоя форма будет отправлять POST-запрос на `/api/rsvp`, а endpoint отправит сообщение в Telegram.

## Дизайн-система

Подключены шрифты из референсов:

- `Pinyon Script` - имена, цитата, акценты, RSVP-заголовок.
- `Great Vibes` - запасной каллиграфический шрифт.
- `Cormorant`, `Cormorant Garamond`, `Cormorant SC` - основной текст, заголовки, таймер и строгие блоки.

Основная палитра задана CSS-переменными в `assets/css/style.css`:

```css
--olive-green: #6B7B5E;
--dusty-rose: #C9B1B1;
--sage-green: #9CAF9E;
--dusty-blue: #B8C5D0;
--beige-bg: #F5F1E8;
--dark-text: #4A4A4A;
--white: #FFFFFF;
--brown: #8B7355;
```

## Формат сообщения в Telegram

```text
🎉 НОВАЯ РЕГИСТРАЦИЯ НА СВАДЬБУ!

👤 Имя: [ФИО]
👥 Гости: [состав]
🔢 Количество: [число]
📱 Телефон: [номер]
📅 Дата регистрации: [дата и время]
Комментарий: [текст]
```

## Как протестировать

1. Установите переменные окружения на хостинге.
2. Откройте опубликованную страницу.
3. Заполните RSVP-форму тестовыми данными.
4. Проверьте, что сообщение пришло в группу.
5. Если Telegram временно недоступен, данные заявки сохраняются в `localStorage` браузера под ключом `andrey-alena-rsvp-backup`.

## Локальный просмотр

Статическую страницу можно открыть через локальный сервер:

```bash
python3 -m http.server 8080
```

Затем открыть `http://localhost:8080/wedding-invitation/`.

Локально без serverless окружения форма покажет ошибку отправки, но сохранит backup в `localStorage`.
