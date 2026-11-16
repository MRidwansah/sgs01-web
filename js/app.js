(function () {
  const CONFIG = window.SGS_CONFIG;

  function setBadge(el, text, isOnline) {
    el.textContent = text;
    el.className = `badge ${isOnline ? "badge-online" : "badge-offline"}`;
  }

  function renderTelemetry(d) {
    // Update waktu
    document.getElementById("last-time").textContent =
      new Date().toLocaleTimeString("id-ID");

    // 1. Api
    const apiEl = document.getElementById("val-api");
    const cardApi = document.getElementById("card-api");
    apiEl.textContent = d.api ? "TERDETEKSI" : "AMAN";
    apiEl.className = `value ${d.api ? "text-danger" : "text-ok"}`;
    cardApi.className = `card ${d.api ? "card-danger" : ""}`;

    // 2. Buzzer
    const buzzerEl = document.getElementById("val-buzzer");
    const cardBuzzer = document.getElementById("card-buzzer");
    buzzerEl.textContent = d.buzzer ? "ON (BUNYI)" : "OFF";
    buzzerEl.className = `value ${d.buzzer ? "text-danger" : ""}`;
    cardBuzzer.className = `card ${d.buzzer ? "card-danger" : ""}`;

    // 3. Suhu & Kelembapan
    document.getElementById("val-suhu").textContent =
      d.suhu === null ? "Gagal baca" : `${d.suhu} °C`;
    document.getElementById("val-hum").textContent =
      d.kelembapan === null ? "Gagal baca" : `${d.kelembapan} %`;

    // 4. Gas MQ-2
    const gasEl = document.getElementById("val-gas");
    const cardGas = document.getElementById("card-gas");
    const gasTinggi = d.gas >= CONFIG.gasThreshold;
    gasEl.textContent = `${d.gas} ADC`;
    gasEl.className = `value ${gasTinggi ? "text-warn" : ""}`;
    cardGas.className = `card ${gasTinggi ? "card-warning" : ""}`;

    // 5. Jarak
    document.getElementById("val-jarak").textContent =
      d.jarak < 0 ? "Timeout" : `${d.jarak} cm`;

    // 6. Gerakan Robot & Blynk
    document.getElementById("val-gerak").textContent = d.gerak || "STOP";
    const blynkEl = document.getElementById("val-blynk");
    blynkEl.textContent = d.blynk ? "Terhubung" : "Terputus";
    blynkEl.className = `value ${d.blynk ? "text-ok" : "text-danger"}`;

    // 7. Banner Status Utama
    const banner = document.getElementById("status-banner");
    const title = document.getElementById("status-title");
    const desc = document.getElementById("status-desc");

    if (d.status === "KEBAKARAN" || d.api) {
      banner.className = "banner banner-kebakaran";
      title.textContent = "KEBAKARAN";
      desc.textContent = "Bahaya! Api terdeteksi, buzzer aktif, dan peringatan Telegram terkirim.";
    } else if (d.status === "WASPADA") {
      banner.className = "banner banner-waspada";
      title.textContent = "WASPADA";
      desc.textContent = "Terdeteksi peningkatan konsentrasi gas/asap atau suhu di atas normal.";
    } else {
      banner.className = "banner banner-normal";
      title.textContent = "NORMAL";
      desc.textContent = "Lingkungan aman. Buzzer dalam kondisi tidak aktif.";
    }
  }

  const brokerBadge = document.getElementById("badge-broker");
  const espBadge = document.getElementById("badge-esp");

  const service = new window.MqttService(CONFIG, {
    onBrokerConnect: () => {
      setBadge(brokerBadge, "Broker: Connected", true);
    },
    onBrokerDisconnect: () => {
      setBadge(brokerBadge, "Broker: Reconnecting...", false);
    },
    onDeviceStatus: (status) => {
      const online = status === "ONLINE";
      setBadge(espBadge, `ESP32: ${status}`, online);
    },
    onTelemetry: (data) => {
      setBadge(espBadge, "ESP32: ONLINE", true);
      renderTelemetry(data);
    }
  });

  service.connect();
})();