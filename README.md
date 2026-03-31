
# Bententrade Website

Готовый фронтенд проект для деплоя на Railway.

## Локальный запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

## Продакшен запуск (как на Railway)

```bash
npm run start
```

## Переменные окружения

Создайте `.env` на основе `.env.example`:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=https://your-api-domain/functions/v1/make-server-ee878259
```

`VITE_API_BASE_URL` позволяет переключить API на ваш бэкенд/БД в Railway без правок кода.

## Railway

- Конфиг деплоя находится в `railway.json`
- Build: `npm ci && npm run build`
- Start: `npm run start`
  