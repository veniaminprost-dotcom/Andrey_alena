const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ ok: false, error: "Telegram is not configured" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();

  if (name.length < 3 || phone.replace(/\D/g, "").length !== 11) {
    return res.status(400).json({ ok: false, error: "Invalid RSVP data" });
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
    return res.status(502).json({ ok: false, error: result.description || "Telegram request failed" });
  }

  return res.status(200).json({ ok: true });
};
