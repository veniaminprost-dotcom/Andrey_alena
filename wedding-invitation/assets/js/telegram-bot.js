window.RsvpApi = (function () {
  const endpoint = "/api/rsvp";
  const storageKey = "andrey-alena-rsvp-backup";

  const saveBackup = (payload) => {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    saved.push({ ...payload, savedAt: new Date().toISOString() });
    localStorage.setItem(storageKey, JSON.stringify(saved.slice(-20)));
  };

  const send = async (payload) => {
    saveBackup(payload);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Не удалось отправить заявку");
    }

    return result;
  };

  return { send };
})();
