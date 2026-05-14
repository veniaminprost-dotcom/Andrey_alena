const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const publicDir = __dirname;
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon"
};

const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
};

const readBody = (req) => new Promise((resolve, reject) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 128 * 1024) {
      reject(new Error("Request body is too large"));
      req.destroy();
    }
  });
  req.on("end", () => resolve(body));
  req.on("error", reject);
});

const handleRsvp = async (req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405, { "Allow": "POST" });
    return sendJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return sendJson(res, 500, { ok: false, error: "Telegram is not configured" });
  }

  let body;
  try {
    body = JSON.parse(await readBody(req) || "{}");
  } catch (error) {
    return sendJson(res, 400, { ok: false, error: "Invalid JSON" });
  }

  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();

  if (name.length < 3 || phone.replace(/\D/g, "").length !== 11) {
    return sendJson(res, 400, { ok: false, error: "Invalid RSVP data" });
  }

  const text = [
    "<b>🎉 НОВАЯ РЕГИСТРАЦИЯ НА СВАДЬБУ!</b>",
    "",
    `👤 Имя: ${escapeHtml(name)}`,
    `👥 Гости: ${escapeHtml(body.guests || "Не указано")}`,
    `🔢 Количество: ${escapeHtml(body.guestCount || "Не указано")}`,
    `📱 Телефон: ${escapeHtml(phone)}`,
    `📅 Дата регистрации: ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}`,
    body.comment ? `Комментарий: ${escapeHtml(body.comment)}` : "",
    "",
    `Страница: ${escapeHtml(body.page || "")}`
  ].filter(Boolean).join("\n");

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    });

    const result = await telegramResponse.json();
    if (!telegramResponse.ok || !result.ok) {
      return sendJson(res, 502, { ok: false, error: result.description || "Telegram request failed" });
    }

    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, 502, { ok: false, error: "Telegram request failed" });
  }
};

const serveStatic = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === "/") pathname = "/index.html";
  if (pathname.endsWith("/")) pathname += "index.html";

  const filePath = path.normalize(path.join(publicDir, pathname));
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const isAsset = pathname.startsWith("/assets/");
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": isAsset ? "public, max-age=31536000, immutable" : "no-cache"
    });
    return res.end(file);
  } catch (error) {
    if (error.code === "ENOENT") {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Not found");
    }

    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Server error");
  }
};

const server = http.createServer(async (req, res) => {
  if (req.url?.startsWith("/api/rsvp")) {
    return handleRsvp(req, res);
  }

  return serveStatic(req, res);
});

server.listen(port, host, () => {
  console.log(`Wedding invitation server is running on http://${host}:${port}`);
});
