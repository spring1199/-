# Адууны бүртгэлийн вэб апп (MongoDB + Node/Express + React/Vite)

## Суурилуулалт
1) MongoDB локал ажиллуул (mongod).
2) Сервер:
```bash
cd server
npm i
npm run dev
```

3) Клиент:
```bash
cd ../client
npm i
npm run dev
```

- API: http://localhost:4000
- UI:  http://localhost:5173

## Боломжууд
- Адуу: бүртгэх, жагсаалт, устгах
- Удам: эцэг/эх оноох үед **offspring автоматаар** синк
- Сүрэг: үүсгэх, азарга сонгох, гишүүдийн тоо
- Хайлт: ерөнхий (ямар ч талбар), болон **сүрэг дотор** хайлт
- Пагинац: ерөнхий жагсаалт, сүрэг дотор
- Нэвтрэлт: админ ба хэрэглэгчийн эрхээр нэвтрэх, бүртгэл үүсгэх

## Тохиргоо
- `server/.env` дотор Mongo URI, PORT болон JWT_SECRET тодорхойлно.

## Netlify-д байршуулалт
1. Клиентийн талд байрлах `client/.env.example` файлыг хуулж `.env` нэртэй файл үүсгэнэ.
   ```bash
   cd client
   cp .env.example .env
   ```
2. `.env` файл дотор `VITE_API_URL` хувьсагчид олон нийтэд нэвтрэх боломжтой серверийнхээ үндсэн хаягийг `/api` суффикстайгаар зааж өгнө. (Жишээ нь: `https://your-backend.example.com/api`).
3. Netlify дээр шинэ сайт үүсгэн, энэ Git агуулахыг холбохдоо `Base directory`-г `client`, `Build command`-ыг `npm install && npm run build`, `Publish directory`-г `dist` гэж тохируулна.
4. Netlify Dashboard дээрх **Site settings → Environment variables** хэсэгт `VITE_API_URL`-ийг үүсгээд серверийн URL-ээ (жишээ: `https://your-backend.example.com/api`) оруулна.
5. Деплой хийсний дараа Netlify таны React аппыг `client/dist` сангаас автоматаар түгээж, `netlify.toml` дахь redirect тохиргооны ачаар SPA маршрут бүр зөв үйлчилнэ.
