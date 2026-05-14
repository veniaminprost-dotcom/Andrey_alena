(function () {
  const root = document.querySelector("[data-countdown]");
  if (!root) return;

  const target = new Date(root.dataset.countdown).getTime();
  const nodes = {
    days: root.querySelector("[data-days]"),
    hours: root.querySelector("[data-hours]"),
    minutes: root.querySelector("[data-minutes]"),
    seconds: root.querySelector("[data-seconds]")
  };

  const setValue = (node, value) => {
    const next = String(value).padStart(2, "0");
    if (node.textContent === next) return;
    node.textContent = next;
    node.classList.remove("tick");
    void node.offsetWidth;
    node.classList.add("tick");
  };

  const update = () => {
    const distance = Math.max(0, target - Date.now());
    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);

    setValue(nodes.days, days);
    setValue(nodes.hours, hours);
    setValue(nodes.minutes, minutes);
    setValue(nodes.seconds, seconds);
  };

  update();
  window.setInterval(update, 1000);
})();
