import { createContext, useContext, useEffect, useState } from "react";
import mqtt from "mqtt";
import { toast } from "sonner";

const MqttContext = createContext();

export function MqttProvider({
  children,
  host,
  port,
  clientId,
  username,
  password,
}) {
  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectUrl = `wss://${host}:${port}/mqtt`;

    const mqttClient = mqtt.connect(connectUrl, {
      clientId,
      username,
      password,
      clean: true,
      reconnectPeriod: 2000,
      connectTimeout: 4000,
    });

    mqttClient.on("connect", () => {
      console.log("MQTT Connected");
      setIsConnected(true);

      mqttClient.subscribe("#", (err) => {
        if (err) console.log("Subscribe Error:", err);
      });
    });

    mqttClient.on("message", (topic, payload) => {
      const msg = payload.toString();
      console.log("MQTT Message:", topic, msg);

      toast(`${topic}: ${msg}`);
    });

    mqttClient.on("error", () => {
      console.log("MQTT Error");
      setIsConnected(false);
    });

    setClient(mqttClient);

    return () => mqttClient.end();
  }, []);

  const publishMessage = (topic, message) => {
    if (!client || !isConnected) return;
    client.publish(topic, message);
  };

  return (
    <MqttContext.Provider value={{ publishMessage, isConnected }}>
      {children}
    </MqttContext.Provider>
  );
}

export const useMqtt = () => useContext(MqttContext);
