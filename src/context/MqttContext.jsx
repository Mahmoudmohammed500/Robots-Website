import React, { createContext, useContext } from 'react';
import useMqtt from '../hooks/useMqtt';

const MqttContext = createContext();

export const MqttProvider = ({ children }) => {
  const mqttConfig = {
    host: import.meta.env.VITE_MQTT_HOST || 'localhost',
    port: import.meta.env.VITE_MQTT_PORT || 8884,
    clientId: `web_client_${Math.random().toString(16).slice(2)}`,
    username: import.meta.env.VITE_MQTT_USERNAME || '',
    password: import.meta.env.VITE_MQTT_PASSWORD || '',
  };

  const mqtt = useMqtt(mqttConfig);

  return (
    <MqttContext.Provider value={mqtt}>
      {children}
    </MqttContext.Provider>
  );
};

export const useMqttContext = () => {
  const context = useContext(MqttContext);
  if (!context) {
    throw new Error('useMqttContext must be used within a MqttProvider');
  }
  return context;
};