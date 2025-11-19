import { useEffect, useState, useRef } from "react";
import axios from "axios";
import mqtt from "mqtt";

const API_BASE = "http://localhost/robots_api/api";

export default function useMqtt({ host, port, clientId, username, password }) {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [robotsData, setRobotsData] = useState([]);

  useEffect(() => {
    const fetchRobots = async () => {
      try {
        const res = await axios.get(`${API_BASE}/robots`);
        setRobotsData(res.data);
      } catch (err) {
        console.error("Failed to fetch robots data:", err);
      }
    };
    fetchRobots();
  }, []);

  const findTopicMain = (topic_sub) => {
    for (const robot of robotsData) {
      if (robot.Sections) {
        for (const sectionKey in robot.Sections) {
          const section = robot.Sections[sectionKey];
          if (section.Topic_subscribe === topic_sub) {
            return section.Topic_main;
          }
        }
      }
    }
    return topic_sub;
  };

  const processAndSaveMessage = async (topic, messageString) => {
    try {

      let messageData;
      let finalMessageObj;

      try {
        messageData = JSON.parse(messageString);
        
        finalMessageObj = {
          topic_main: messageData.topic_main || findTopicMain(topic),
          message: messageData.message || JSON.stringify(messageData),
          type: messageData.type || "info",
          date: messageData.date || new Date().toISOString().slice(0, 10),
          time: messageData.time || new Date().toISOString().slice(11, 19)
        };
      } catch (parseError) {
        console.log("📝 PLAIN TEXT MESSAGE");
        finalMessageObj = {
          topic_main: findTopicMain(topic),
          message: messageString,
          type: "info",
          date: new Date().toISOString().slice(0, 10),
          time: new Date().toISOString().slice(11, 19)
        };
      }

      console.log("💾 FINAL MESSAGE OBJECT:", finalMessageObj);

      try {
        await axios.post(`${API_BASE}/notifications.php`, finalMessageObj);
        console.log(" Notification saved");

        await axios.post(`${API_BASE}/logs.php`, finalMessageObj);
        console.log(" Log saved");

        setMessages(prev => [...prev, finalMessageObj]);
        
        return finalMessageObj;
      } catch (error) {
        console.error(" Failed to save message:", error);
        return null;
      }

    } catch (error) {
      console.error(" Error processing message:", error);
      return null;
    }
  };

  const sendLowVoltageAlert = async (robotName, voltage, topic, robotSectionInfo) => {
    try {
      console.log(` LOW VOLTAGE ALERT: ${voltage}V in robot ${robotName}`);
      
      alert(` Danger Alert: Robot "${robotName}" voltage is critically low (${voltage}V)!`);
      
      const alertMessage = {
        topic_main: robotSectionInfo ? findTopicMain(topic) : topic,
        message: `⚠️ Danger: Robot "${robotName}" voltage is critically low (${voltage}V)!`,
        type: "alert",
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toISOString().slice(11, 19)
      };

      await axios.post(`${API_BASE}/notifications.php`, alertMessage);
      await axios.post(`${API_BASE}/logs.php`, alertMessage);
      console.log(" Low voltage alert saved to both databases");
      
    } catch (error) {
      console.error(" Failed to send low voltage alert:", error);
    }
  };

  const updateAllFieldsSeparately = async (robotId, sectionName, updatedData) => {
    try {
      console.log(" UPDATING ALL FIELDS SEPARATELY:", { robotId, sectionName, updatedData });
      
      const currentRobotResponse = await axios.get(`${API_BASE}/robots/${robotId}`);
      const currentRobot = currentRobotResponse.data;
      
      const updates = [];
      
      if (updatedData.voltage !== undefined) {
        const voltagePayload = {
          ...currentRobot,
          Sections: {
            ...currentRobot.Sections,
            [sectionName]: {
              ...currentRobot.Sections[sectionName],
              Voltage: updatedData.voltage
            }
          }
        };
        
        updates.push(
          axios.put(`${API_BASE}/robots.php/${robotId}`, voltagePayload)
            .then(() => console.log(` VOLTAGE UPDATED: ${updatedData.voltage}`))
            .catch(err => console.error(` VOLTAGE UPDATE FAILED:`, err))
        );
      }
      
      // 🔥 تحديث Status
      if (updatedData.mode !== undefined) {
        const statusPayload = {
          ...currentRobot,
          Sections: {
            ...currentRobot.Sections,
            [sectionName]: {
              ...currentRobot.Sections[sectionName],
              Status: updatedData.mode
            }
          }
        };
        
        updates.push(
          axios.put(`${API_BASE}/robots.php/${robotId}`, statusPayload)
            .then(() => console.log(` STATUS UPDATED: "${updatedData.mode}"`))
            .catch(err => console.error(` STATUS UPDATE FAILED:`, err))
        );
      }
      
      // 🔥 تحديث Cycles
      if (updatedData.cycles !== undefined) {
        const cyclesPayload = {
          ...currentRobot,
          Sections: {
            ...currentRobot.Sections,
            [sectionName]: {
              ...currentRobot.Sections[sectionName],
              Cycles: updatedData.cycles
            }
          }
        };
        
        updates.push(
          axios.put(`${API_BASE}/robots.php/${robotId}`, cyclesPayload)
            .then(() => console.log(` CYCLES UPDATED: ${updatedData.cycles}`))
            .catch(err => console.error(` CYCLES UPDATE FAILED:`, err))
        );
      }
      
      for (let i = 0; i < updates.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        await updates[i];
      }
      
      console.log(" ALL SEPARATE UPDATES COMPLETED");
      
    } catch (error) {
      console.error(" SEPARATE UPDATES FAILED:", error);
    }
  };

  const updateRobotSectionData = async (robotId, sectionName, updatedData, robotName, topic, robotSectionInfo) => {
    try {
      console.log(" ATTEMPTING SINGLE UPDATE WITH ALL FIELDS");
      
      const currentRobotResponse = await axios.get(`${API_BASE}/robots/${robotId}`);
      const currentRobot = currentRobotResponse.data;
      
      const updatedSections = {
        ...currentRobot.Sections,
        [sectionName]: {
          ...currentRobot.Sections[sectionName],
          Voltage: updatedData.voltage !== undefined ? updatedData.voltage : currentRobot.Sections[sectionName].Voltage,
          Status: updatedData.mode !== undefined ? updatedData.mode : currentRobot.Sections[sectionName].Status,
          Cycles: updatedData.cycles !== undefined ? updatedData.cycles : currentRobot.Sections[sectionName].Cycles
        }
      };

      const updatePayload = {
        ...currentRobot,
        Sections: updatedSections
      };

      console.log("📦 SINGLE PAYLOAD:", updatedSections);

      const response = await axios.put(`${API_BASE}/robots.php/${robotId}`, updatePayload);
      console.log(" SINGLE UPDATE RESPONSE:", response.data);
      
      if (updatedData.voltage && updatedData.voltage < 15) {
        console.log("🔋 LOW VOLTAGE DETECTED, SENDING ALERT...");
        await sendLowVoltageAlert(robotName, updatedData.voltage, topic, robotSectionInfo);
      }
      
      setTimeout(async () => {
        console.log(" STARTING SEPARATE UPDATES AS BACKUP...");
        await updateAllFieldsSeparately(robotId, sectionName, updatedData);
      }, 500);
      
      return response.data;
    } catch (error) {
      console.error(" SINGLE UPDATE FAILED, using separate updates...");
      await updateAllFieldsSeparately(robotId, sectionName, updatedData);
      
      if (updatedData.voltage && updatedData.voltage < 15) {
        console.log("🔋 LOW VOLTAGE DETECTED, SENDING ALERT...");
        await sendLowVoltageAlert(robotName, updatedData.voltage, topic, robotSectionInfo);
      }
      
      throw error;
    }
  };

  const findRobotAndSectionByTopic = (topic) => {
    for (const robot of robotsData) {
      if (robot.Sections) {
        for (const sectionName in robot.Sections) {
          const section = robot.Sections[sectionName];
          if (section.Topic_subscribe === topic) {
            return { robot, sectionName, section };
          }
        }
      }
    }
    return null;
  };

  const extractAllDataFromMessage = (messageString) => {
    console.log("🔍 EXTRACTING ALL DATA FROM MESSAGE:", messageString);
    
    const statusData = {};
    
    const voltageMatch = messageString.match(/voltage:\s*(\d+)/i);
    if (voltageMatch) {
      statusData.voltage = parseInt(voltageMatch[1]);
      console.log(" EXTRACTED VOLTAGE:", statusData.voltage);
    }
    
    const modeMatch = messageString.match(/mode:\s*([a-zA-Z]+)/i);
    if (modeMatch) {
      statusData.mode = modeMatch[1];
      console.log(" EXTRACTED MODE:", statusData.mode);
    }
    
    const cyclesMatch = messageString.match(/cycles:\s*(\d+)/i);
    if (cyclesMatch) {
      statusData.cycles = parseInt(cyclesMatch[1]);
      console.log(" EXTRACTED CYCLES:", statusData.cycles);
    }
    
    return Object.keys(statusData).length > 0 ? statusData : null;
  };

  useEffect(() => {
    if (!robotsData.length) return;

    const connectUrl = `wss://${host}:${port}/mqtt`;
    const client = mqtt.connect(connectUrl, {
      clean: true,
      connectTimeout: 4000,
      keepalive: 60,
      clientId,
      username,
      password,
    });

    clientRef.current = client;

    client.on("connect", () => {
      setIsConnected(true);
      console.log("MQTT Connected");

      robotsData.forEach(robot => {
        if (robot.Sections) {
          Object.values(robot.Sections).forEach(section => {
            if (section.Topic_subscribe) {
              client.subscribe(section.Topic_subscribe, { qos: 0 });
              console.log("Subscribed to:", section.Topic_subscribe);
            }
          });
        }
      });
    });

    client.on("error", (err) => console.log("MQTT Error:", err));

    client.on("message", async (topic, message) => {
      console.log(" RAW MQTT MESSAGE:", { topic, message: message.toString() });

      const messageString = message.toString();
      
      const messageData = extractAllDataFromMessage(messageString);
      
      if (messageData) {
        console.log("🎯 PROCESSING MESSAGE_STATUS DATA:", messageData);
        
        try {
          const robotSectionInfo = findRobotAndSectionByTopic(topic);
          
          if (robotSectionInfo) {
            const { robot, sectionName, section } = robotSectionInfo;
            console.log("🤖 FOUND ROBOT FOR UPDATE:", {
              robotId: robot.id,
              sectionName,
              robotName: robot.RobotName,
              currentData: {
                Voltage: section.Voltage,
                Status: section.Status,
                Cycles: section.Cycles
              }
            });
            
            await updateRobotSectionData(
              robot.id, 
              sectionName, 
              messageData, 
              robot.RobotName, 
              topic, 
              robotSectionInfo
            );
            console.log(" UPDATE PROCESS INITIATED FOR ALL FIELDS");
            
          } else {
            console.log(" No matching robot found for topic:", topic);
          }
        } catch (error) {
          console.error(" Error processing message update:", error);
        }
      } else {
        console.log("📝 PROCESSING NORMAL MESSAGE...");
        const msgObj = await processAndSaveMessage(topic, messageString);
        
        if (msgObj) {
          console.log(" Message processed and saved:", msgObj);
        }
      }
    });

    return () => client.end();
  }, [host, port, clientId, username, password, robotsData]);

  useEffect(() => {
    if (!isConnected || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    const isStatusUpdate = lastMsg.message.includes('message_status:');

    if (!isStatusUpdate) {
      console.log("📝 Backup: Message already saved in database");
    }
  }, [messages, isConnected]);

  const publish = (topic, msg) => {
    if (clientRef.current) {
      console.log("📤 Publishing MQTT message:", { topic, msg });
      clientRef.current.publish(topic, msg, { qos: 0 });
    }
  };

  const publishMessageStatusUpdate = (topic, voltage, mode, cycles) => {
    const message = `message_status:{voltage:${voltage}, mode:${mode}, cycles:${cycles}}`;
    publish(topic, message);
  };

  const publishStructuredMessage = (topic, messageData) => {
    const structuredMessage = {
      topic_main: messageData.topic_main,
      message: messageData.message,
      type: messageData.type || "info",
      date: messageData.date || new Date().toISOString().slice(0, 10),
      time: messageData.time || new Date().toISOString().slice(11, 19)
    };
    publish(topic, JSON.stringify(structuredMessage));
  };

  return {
    client: clientRef.current,
    isConnected,
    messages,
    publishMessage: publish,
    publishMessageStatusUpdate,
    publishStructuredMessage
  };
}