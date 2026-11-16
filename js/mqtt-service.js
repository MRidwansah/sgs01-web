class MqttService {
  constructor(config, handlers) {
    this.config = config;
    this.handlers = handlers;
    this.client = null;
  }

  connect() {
    const clientId = "SGS01-Web-" + Math.random().toString(16).substring(2, 8);
    this.client = mqtt.connect(this.config.brokerUrl, {
      clientId: clientId,
      clean: true,
      reconnectPeriod: 3000
    });

    this.client.on("connect", () => {
      this.client.subscribe([
        this.config.topics.telemetry,
        this.config.topics.status
      ]);
      if (this.handlers.onBrokerConnect) this.handlers.onBrokerConnect();
    });

    this.client.on("close", () => {
      if (this.handlers.onBrokerDisconnect) this.handlers.onBrokerDisconnect();
    });

    this.client.on("message", (topic, message) => {
      const text = message.toString();

      if (topic === this.config.topics.telemetry && this.handlers.onTelemetry) {
        try {
          const data = JSON.parse(text);
          this.handlers.onTelemetry(data);
        } catch (err) {
          console.error("Format JSON tidak valid:", err);
        }
      }

      if (topic === this.config.topics.status && this.handlers.onDeviceStatus) {
        this.handlers.onDeviceStatus(text);
      }
    });
  }
}

window.MqttService = MqttService;