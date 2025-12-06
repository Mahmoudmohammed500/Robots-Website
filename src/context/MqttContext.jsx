import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import mqtt from "mqtt";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "./AuthContext";

const MqttContext = createContext();

export function MqttProvider({ children }) {
  const { userRole, projectName: projectNameFromCookie } = useAuth();
  
  const [clients, setClients] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [activeConnections, setActiveConnections] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [robotsData, setRobotsData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const robotsDataRef = useRef([]);
  const projectsDataRef = useRef([]);
  const usersDataRef = useRef([]);
  const clientsRef = useRef({});
  
  const processingMessagesRef = useRef(new Map());
  const messageHistoryRef = useRef(new Map());
  const lastProcessedMessageRef = useRef(null);
  const dangerMessagesSet = useRef(new Set());

  const userRoleRef = useRef(userRole);
  const projectNameCookieRef = useRef(projectNameFromCookie);

  useEffect(() => {
    userRoleRef.current = userRole;
    projectNameCookieRef.current = projectNameFromCookie;
    console.log("🔄 Updated user info in MqttContext:", { userRole, projectNameFromCookie });
  }, [userRole, projectNameFromCookie]);

  const fetchInitialData = useCallback(async () => {
    try {
      console.log("🔄 Fetching initial data from API...");
      
      const robotsRes = await axios.get(`${API_BASE}/robots.php`);
      const robotsArray = Array.isArray(robotsRes.data) ? robotsRes.data : [];
      robotsDataRef.current = robotsArray;
      setRobotsData(robotsArray);
      
      console.log(`✅ Loaded ${robotsArray.length} robots`);
      
      try {
        const projectsRes = await axios.get(`${API_BASE}/projects.php`);
        const projectsArray = Array.isArray(projectsRes.data) ? projectsRes.data : [];
        setProjectsData(projectsArray);
        projectsDataRef.current = projectsArray;
        console.log(`✅ Loaded ${projectsArray.length} projects`);
      } catch (projectsError) {
        console.warn("Could not fetch projects:", projectsError.message);
        setProjectsData([]);
      }
      
      try {
        const usersRes = await axios.get(`${API_BASE}/users.php`);
        const usersArray = Array.isArray(usersRes.data) ? usersRes.data : [];
        setUsersData(usersArray);
        usersDataRef.current = usersArray;
        console.log(`✅ Loaded ${usersArray.length} users`);
      } catch (usersError) {
        console.warn("Could not fetch users:", usersError.message);
        setUsersData([]);
      }
      
      return robotsArray;
    } catch (error) {
      console.error("❌ Failed to fetch initial data:", error);
      return [];
    }
  }, [API_BASE]);

  const extractMqttConnectionsFromRobot = (robot) => {
    if (!robot || !robot.Sections) return [];
    
    const connections = [];
    const robotId = robot.id;
    const robotName = robot.RobotName || robot.robotName;
    
    Object.entries(robot.Sections).forEach(([sectionName, sectionData]) => {
      if (sectionData && sectionData.mqttUrl && sectionData.mqttUsername && sectionData.mqttPassword) {
        connections.push({
          robotId,
          robotName,
          sectionName,
          sectionData,
          host: sectionData.mqttUrl.replace(/^wss?:\/\//, '').split('/')[0],
          port: 8884,
          username: sectionData.mqttUsername,
          password: sectionData.mqttPassword,
          clientId: `robot-${robotId}-${sectionName}-${Date.now()}`,
          topicSubscribe: sectionData.Topic_subscribe,
          topicMain: sectionData.Topic_main,
          topics: [sectionData.Topic_subscribe]
        });
      }
    });
    
    return connections;
  };

  const isAlertMessage = (message) => {
    if (!message) return false;
    
    const messageLower = message.toLowerCase();
    const alertKeywords = [
      'error', 'alert', 'warning', 'critical', 'fatal',
      'fail', 'failed', 'stopped', 'emergency', 'fault',
      'danger', 'issue', 'problem', 'shutdown', 'offline',
      'error code', 'alarm', 'malfunction', 'broken'
    ];
    
    const infoKeywords = [
      'info', 'information', 'started', 'running', 'online',
      'completed', 'success', 'ready', 'normal', 'ok',
      'initialized', 'connected', 'active', 'operational'
    ];
    
    const hasAlert = alertKeywords.some(keyword => messageLower.includes(keyword));
    const hasInfo = infoKeywords.some(keyword => messageLower.includes(keyword));
    
    return hasAlert && !hasInfo;
  };

  const createMessageKey = (topic, message, robotId, sectionName) => {
    const messageHash = btoa(unescape(encodeURIComponent(`${topic}:${message}`)));
    return `${robotId}:${sectionName}:${messageHash}`;
  };

  const isMessageDuplicate = (topic, message, robotId, sectionName) => {
    const key = createMessageKey(topic, message, robotId, sectionName);
    const now = Date.now();
    
    if (messageHistoryRef.current.has(key)) {
      const lastProcessed = messageHistoryRef.current.get(key);
      if (now - lastProcessed < 3000) {
        return true;
      }
    }
    
    return false;
  };

  const markMessageAsProcessed = (topic, message, robotId, sectionName) => {
    const key = createMessageKey(topic, message, robotId, sectionName);
    messageHistoryRef.current.set(key, Date.now());
    
    setTimeout(() => {
      messageHistoryRef.current.delete(key);
    }, 10000);
  };

  const isDangerMessageDuplicate = (message, robotId, sectionName, voltage = null) => {
    const dangerKey = voltage 
      ? `danger-${robotId}-${sectionName}-${voltage}`
      : `danger-${robotId}-${sectionName}-${message}`;
    
    if (dangerMessagesSet.current.has(dangerKey)) {
      return true;
    }
    
    dangerMessagesSet.current.add(dangerKey);
    setTimeout(() => {
      dangerMessagesSet.current.delete(dangerKey);
    }, 30000);
    
    return false;
  };

  const findTopicMain = useCallback((topic_sub) => {
    for (const robot of robotsDataRef.current) {
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
  }, []);

  const findRobotAndSectionByTopic = useCallback((topic) => {
    if (!robotsDataRef.current.length) return null;
    
    for (const robot of robotsDataRef.current) {
      if (robot.Sections) {
        for (const [sectionName, section] of Object.entries(robot.Sections)) {
          if (section.Topic_subscribe === topic) {
            return { 
              robot, 
              sectionName, 
              section,
              direction: 'fromRobot',
              topicType: 'subscribe'
            };
          }
        }
      }
    }
    return null;
  }, []);

  const shouldShowMessageToUser = useCallback(async (robotSectionInfo) => {
    try {
      const currentUserRole = userRoleRef.current;
      const currentProjectName = projectNameCookieRef.current;
      
      console.log("🔍 CHECKING USER PROJECT FILTER:", {
        userRole: currentUserRole,
        projectNameFromCookie: currentProjectName,
        robotProjectId: robotSectionInfo?.robot?.projectId
      });

      if (currentUserRole !== 'user') {
        console.log("👨‍💼 Admin/Dashboard user - showing all messages");
        return true;
      }

      if (!robotSectionInfo || !robotSectionInfo.robot) {
        console.log("❌ No robot info - cannot filter");
        return false;
      }

      const robotProjectId = robotSectionInfo.robot.projectId;
      console.log("🤖 Robot's projectId from database:", robotProjectId);

      if (!robotProjectId) {
        console.log("❌ Robot has no projectId assigned");
        return false;
      }

      if (!currentProjectName) {
        console.log("❌ No project name in cookies");
        return false;
      }

      try {
        const projectsRes = await axios.get(`${API_BASE}/projects.php`);
        const projectsArray = Array.isArray(projectsRes.data) ? projectsRes.data : [];
        
        const userProject = projectsArray.find(project => {
          const projectName = project.ProjectName || project.projectName;
          return projectName && projectName.trim() === currentProjectName.trim();
        });

        if (!userProject) {
          console.log("❌ No matching project found for cookie name:", currentProjectName);
          return false;
        }

        const userProjectId = userProject.id || userProject.projectId;
        console.log("✅ Found user's project ID:", userProjectId);
        
        const shouldShow = String(robotProjectId) === String(userProjectId);
        console.log(`🔁 Project comparison: ${robotProjectId} === ${userProjectId} => ${shouldShow}`);
        
        return shouldShow;
        
      } catch (error) {
        console.error("❌ Error fetching projects for comparison:", error);
        return false;
      }
    } catch (error) {
      console.error("❌ Error in shouldShowMessageToUser:", error);
      return false;
    }
  }, [API_BASE]);

  const processAndSaveMessage = useCallback(async (topic, messageString, robotId, sectionName, isFromButton = false, buttonName = null, robotSectionInfo = null, robotName = null) => {
    try {
      if (isMessageDuplicate(topic, messageString, robotId, sectionName)) {
        console.log("⏭️ Skipping duplicate message (already processed)");
        return null;
      }
      
      markMessageAsProcessed(topic, messageString, robotId, sectionName);
      
      let finalMessageObj;
      const nowDate = new Date().toISOString().slice(0, 10);
      const nowTime = new Date().toISOString().slice(11, 19);

      let trimmed = (typeof messageString === "string") ? messageString.trim() : String(messageString);

      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        trimmed = trimmed.slice(1, -1);
      }

      console.log("📨 PROCESSING MESSAGE (ONCE):", { 
        topic, 
        message: trimmed,
        robotId,
        sectionName,
        robotName
      });

      if (!robotSectionInfo) {
        robotSectionInfo = findRobotAndSectionByTopic(topic);
      }

      let topicMain;
      if (robotSectionInfo && robotSectionInfo.section && robotSectionInfo.section.Topic_main) {
        topicMain = robotSectionInfo.section.Topic_main;
      } else {
        topicMain = findTopicMain(topic);
      }

      console.log("🔍 Topic resolution:", {
        inputTopic: topic,
        topicMain: topicMain,
        hasRobotInfo: !!robotSectionInfo,
        robotName: robotSectionInfo?.robot?.RobotName
      });

      finalMessageObj = {
        topic_main: topicMain, 
        message: trimmed,
        type: "info",
        date: nowDate,
        time: nowTime,
        RobotId: robotId || (robotSectionInfo?.robot?.id),
        robotName: robotName || robotSectionInfo?.robot?.RobotName || robotSectionInfo?.robot?.robotName,
        sectionName: sectionName || robotSectionInfo?.sectionName
      };

      const isDangerMessage = finalMessageObj.message.includes('voltage is critically low') ||
                             finalMessageObj.message.includes('Danger Alert') ||
                             finalMessageObj.message.includes('⚠️ Danger');
      
      if (isDangerMessage) {
        const dangerDuplicate = isDangerMessageDuplicate(
          finalMessageObj.message,
          finalMessageObj.RobotId,
          finalMessageObj.sectionName
        );
        
        if (dangerDuplicate) {
          console.log("⏭️ Skipping duplicate danger message");
          return null;
        }
      }

      const finalKey = `save-${finalMessageObj.topic_main}-${finalMessageObj.message}-${finalMessageObj.date}-${finalMessageObj.time}`;
      if (messageHistoryRef.current.has(finalKey)) {
        console.log("⏭️ Skipping duplicate message save (final check)");
        return null;
      }
      
      messageHistoryRef.current.set(finalKey, Date.now());

      console.log("💾 SAVING MESSAGE (ONCE):", finalMessageObj);

      try {
        const notificationResponse = await axios.post(`${API_BASE}/notifications.php`, finalMessageObj);
        console.log("✅ Notification saved to database with topic_main:", finalMessageObj.topic_main);

        try {
          await axios.post(`${API_BASE}/logs.php`, finalMessageObj);
          console.log("✅ Log saved to database with topic_main:", finalMessageObj.topic_main);
        } catch (logError) {
          console.warn("Could not save to logs:", logError.message);
        }

        const newNotification = {
          ...finalMessageObj,
          notificationId: notificationResponse.data.notificationId || 
                         notificationResponse.data.id || 
                         `mqtt-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          timestamp: new Date().getTime(),
          isAlert: isAlertMessage(finalMessageObj.message),
          isMqtt: true,
          source: 'mqtt',
          displayMessage: `${finalMessageObj.robotName || 'Unknown Robot'} (${finalMessageObj.sectionName || 'Unknown Section'}): ${finalMessageObj.message}`
        };

        setNotifications(prev => {
          const isDuplicate = prev.some(notif => 
            notif.topic_main === newNotification.topic_main && 
            notif.message === newNotification.message && 
            notif.date === newNotification.date && 
            notif.time === newNotification.time
          );
          
          if (isDuplicate) {
            console.log("⏭️ Skipping duplicate notification in state");
            return prev;
          }
          
          const updated = [newNotification, ...prev];
          return updated.slice(0, 1000);
        });

        return finalMessageObj;
      } catch (error) {
        console.error("❌ Failed to save message to database:", error?.response?.data || error);
        return null;
      }

    } catch (err) {
      console.error("❌ Error in processAndSaveMessage:", err);
      return null;
    }
  }, [API_BASE, findTopicMain, findRobotAndSectionByTopic]);

  const sendEmailToProjectUsers = useCallback(async (projectId, robotName, voltage) => {
    try {
      const project = projectsDataRef.current.find(p => p.projectId === projectId || p.id === projectId);
      if (!project) {
        console.log("❌ Project not found for email sending");
        return;
      }
      
      const projectName = project.ProjectName || project.projectName;
      const projectUsers = usersDataRef.current.filter(user => {
        const userProjectName = user.ProjectName || user.projectName;
        return userProjectName && userProjectName.trim() === projectName.trim();
      });
      
      if (projectUsers.length === 0) {
        console.log("ℹ️ No users found for project:", projectName);
        return;
      }
      
      const emailMessage = `⚠️ Danger Alert: Robot "${robotName}" voltage is critically low (${voltage}V)!`;
      
      for (const user of projectUsers) {
        if (user.Email || user.email) {
          const userEmail = user.Email || user.email;
          try {
            await axios.post(`${API_BASE}/sendEmail.php`, {
              email: userEmail,
              message: emailMessage,
              subject: `Alert: Robot ${robotName} Low Voltage`
            });
          } catch (emailError) {
            console.error(`❌ Failed to send email to ${userEmail}:`, emailError);
          }
        }
      }
    } catch (error) {
      console.error("❌ Error in sendEmailToProjectUsers:", error);
    }
  }, [API_BASE]);

  const sendLowVoltageAlert = useCallback(async (robotName, voltage, topic, robotSectionInfo) => {
    try {
      console.log(`🔴 LOW VOLTAGE ALERT: ${voltage}V in robot ${robotName}`);
      
      const alertKey = `voltage-alert-${robotSectionInfo?.robot?.id}-${voltage}`;
      if (dangerMessagesSet.current.has(alertKey)) {
        console.log("⏭️ Skipping duplicate voltage alert");
        return;
      }
      
      const shouldShow = await shouldShowMessageToUser(robotSectionInfo);
      
      if (shouldShow) {
        toast.error(`⚠️ Danger Alert: Robot "${robotName}" voltage is critically low (${voltage}V)!`, {
          duration: 10000,
          // action: {
          //   label: 'View',
          //   onClick: () => console.log('Alert clicked'),
          // },
        });
      }
      
      const alertMessage = `⚠️ Danger: Robot "${robotName}" voltage is critically low (${voltage}V)!`;
      const msgObj = await processAndSaveMessage(
        topic,
        alertMessage,
        robotSectionInfo?.robot?.id,
        robotSectionInfo?.sectionName,
        false,
        null,
        robotSectionInfo,
        robotName
      );
      
      if (msgObj && !isDangerMessageDuplicate(alertMessage, robotSectionInfo?.robot?.id, robotSectionInfo?.sectionName, voltage)) {
        console.log("✅ Low voltage alert saved to notifications and logs with topic_main:", msgObj.topic_main);
        
        dangerMessagesSet.current.add(alertKey);
        setTimeout(() => {
          dangerMessagesSet.current.delete(alertKey);
        }, 30000);
      } else {
        console.log("⏭️ Skipping duplicate voltage alert (already processed)");
      }
      
      if (robotSectionInfo && robotSectionInfo.robot) {
        const projectId = robotSectionInfo.robot.projectId;
        await sendEmailToProjectUsers(projectId, robotName, voltage);
      }
      
    } catch (error) {
      console.error("❌ Failed to send low voltage alert:", error);
    }
  }, [API_BASE, sendEmailToProjectUsers, shouldShowMessageToUser, processAndSaveMessage, isDangerMessageDuplicate]);

  const handleHalfCycleFinished = useCallback(async (robotId, sectionName, topic, connection, robotSectionInfo) => {
    try {
      const processingKey = `halfcycle-${robotId}-${sectionName}`;
      
      if (processingMessagesRef.current.has(processingKey)) {
        console.log("⏭️ Skipping duplicate half-cycle processing");
        return;
      }
      
      processingMessagesRef.current.set(processingKey, true);
      setTimeout(() => {
        processingMessagesRef.current.delete(processingKey);
      }, 5000);
      
      console.log(`🔄 HANDLING HALF CYCLE FINISHED for ${robotId}-${sectionName}`);
      
      let currentRobot;
      try {
        const response = await axios.get(`${API_BASE}/robots/${robotId}`);
        currentRobot = response.data;
      } catch (error) {
        console.error("❌ Failed to fetch robot data:", error);
        currentRobot = robotsDataRef.current.find(r => r.id === robotId);
      }
      
      if (!currentRobot || !currentRobot.Sections || !currentRobot.Sections[sectionName]) {
        console.error("❌ Robot or section not found");
        return;
      }
      
      const currentCycles = currentRobot.Sections[sectionName]?.Cycles || 0;
      const newCycles = parseFloat(currentCycles) + 0.5;
      
      console.log(`🔢 Increasing cycles: ${currentCycles} → ${newCycles}`);
      
      const updatedSections = {
        ...currentRobot.Sections,
        [sectionName]: {
          ...currentRobot.Sections[sectionName],
          Cycles: newCycles
        }
      };
      
      const updatePayload = {
        ...currentRobot,
        Sections: updatedSections
      };
      
      try {
        const response = await axios.put(`${API_BASE}/robots.php/${robotId}`, updatePayload);
        console.log("✅ HALF CYCLE UPDATE SUCCESS:", response.data);
        
        const updatedRobot = response.data;
        const index = robotsDataRef.current.findIndex(r => r.id === robotId);
        if (index !== -1) {
          robotsDataRef.current[index] = updatedRobot;
          setRobotsData(prev => {
            const newData = [...prev];
            newData[index] = updatedRobot;
            return newData;
          });
        }
        
        const shouldShow = await shouldShowMessageToUser(robotSectionInfo);
        
        if (shouldShow) {
          const msg = `Half cycle finished for ${currentRobot.RobotName}. Cycles: ${newCycles}`;
          
          await processAndSaveMessage(
            topic,
            msg,
            robotId,
            sectionName,
            false,
            null,
            robotSectionInfo,
            currentRobot.RobotName
          );
          
          toast.success(`Half cycle finished for ${currentRobot.RobotName}. Cycles: ${newCycles}`);
        } else {
          console.log("⏭️ Skipping half-cycle toast (user not in same project)");
        }
        
      } catch (error) {
        console.error("❌ HALF CYCLE UPDATE FAILED:", error);
      }
      
    } catch (error) {
      console.error("❌ Error in handleHalfCycleFinished:", error);
    }
  }, [API_BASE, shouldShowMessageToUser, processAndSaveMessage]);

  const findActualButtonName = useCallback((topic, buttonValue) => {
    for (const robot of robotsDataRef.current) {
      if (!robot || !robot.Sections) continue;
      
      for (const sectionKey in robot.Sections) {
        const section = robot.Sections[sectionKey];
        if (!section) continue;
        
        if (section.Topic_main === topic || section.Topic_subscribe === topic) {
          if (section.ActiveBtns && Array.isArray(section.ActiveBtns)) {
            for (const activeBtn of section.ActiveBtns) {
              if (activeBtn && activeBtn.Name && 
                  activeBtn.Name.toLowerCase() === buttonValue.toLowerCase()) {
                return activeBtn.Name;
              }
              
              if (activeBtn && activeBtn.Command && activeBtn.Command === buttonValue) {
                return activeBtn.Name;
              }
            }
          }
          
          return buttonValue;
        }
      }
    }
    
    return buttonValue;
  }, []);

  const extractAllDataFromMessage = useCallback((messageString) => {
    const statusData = {};
    
    const voltagePatterns = [
      /voltage:\s*(\d+)/i,
      /voltage\s*=\s*(\d+)/i,
      /"voltage":\s*(\d+)/i,
      /volt.*?(\d+)/i
    ];
    
    for (const pattern of voltagePatterns) {
      const voltageMatch = messageString.match(pattern);
      if (voltageMatch && voltageMatch[1]) {
        statusData.voltage = parseInt(voltageMatch[1]);
        break;
      }
    }
    
    const modePatterns = [
      /mode:\s*([a-zA-Z]+)/i,
      /mode\s*=\s*([a-zA-Z]+)/i,
      /"mode":\s*"([a-zA-Z]+)"/i,
      /status:\s*([a-zA-Z]+)/i
    ];
    
    for (const pattern of modePatterns) {
      const modeMatch = messageString.match(pattern);
      if (modeMatch && modeMatch[1]) {
        statusData.mode = modeMatch[1];
        break;
      }
    }
    
    const currentUserRole = userRoleRef.current;
    if (currentUserRole === 'user' && messageString.includes('message_status:{cycles:')) {
      console.log("⏭️ Skipping cycles message_status for user");
      return null;
    }
    
    if (currentUserRole !== 'user') {
      const cyclesPatterns = [
        /cycles:\s*(\d+)/i,
        /cycles\s*=\s*(\d+)/i,
        /"cycles":\s*(\d+)/i,
        /cycle.*?(\d+)/i
      ];
      
      for (const pattern of cyclesPatterns) {
        const cyclesMatch = messageString.match(pattern);
        if (cyclesMatch && cyclesMatch[1]) {
          statusData.cycles = parseInt(cyclesMatch[1]);
          break;
        }
      }
    }
    
    if (messageString.includes('message_status:')) {
      const statusMatch = messageString.match(/message_status:\s*\{([^}]+)\}/i);
      if (statusMatch && statusMatch[1]) {
        const statusContent = statusMatch[1];
        
        const voltageMatch = statusContent.match(/voltage:\s*(\d+)/i);
        const modeMatch = statusContent.match(/mode:\s*([a-zA-Z]+)/i);
        
        if (voltageMatch && voltageMatch[1]) {
          statusData.voltage = parseInt(voltageMatch[1]);
        }
        
        if (modeMatch && modeMatch[1]) {
          statusData.mode = modeMatch[1];
        }
        
        if (currentUserRole !== 'user') {
          const cyclesMatch = statusContent.match(/cycles:\s*(\d+)/i);
          if (cyclesMatch && cyclesMatch[1]) {
            statusData.cycles = parseInt(cyclesMatch[1]);
          }
        }
      }
    }
    
    return Object.keys(statusData).length > 0 ? statusData : null;
  }, []);

  const updateAllFieldsSeparately = useCallback(async (robotId, sectionName, updatedData) => {
    try {
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
        
        updates.push(axios.put(`${API_BASE}/robots.php/${robotId}`, voltagePayload));
      }
      
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
        
        updates.push(axios.put(`${API_BASE}/robots.php/${robotId}`, statusPayload));
      }
      
      for (let i = 0; i < updates.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        await updates[i];
      }
      
    } catch (error) {
      console.error("❌ SEPARATE UPDATES FAILED:", error);
    }
  }, [API_BASE]);

  const updateRobotSectionData = useCallback(async (robotId, sectionName, updatedData, robotName, topic, robotSectionInfo) => {
    try {
      const currentRobotResponse = await axios.get(`${API_BASE}/robots/${robotId}`);
      const currentRobot = currentRobotResponse.data;
      
      const updatedSections = {
        ...currentRobot.Sections,
        [sectionName]: {
          ...currentRobot.Sections[sectionName],
          Voltage: updatedData.voltage !== undefined ? updatedData.voltage : currentRobot.Sections[sectionName].Voltage,
          Status: updatedData.mode !== undefined ? updatedData.mode : currentRobot.Sections[sectionName].Status,
        }
      };

      const updatePayload = {
        ...currentRobot,
        Sections: updatedSections
      };

      const response = await axios.put(`${API_BASE}/robots.php/${robotId}`, updatePayload);
      
      if (updatedData.voltage !== undefined && updatedData.voltage < 15) {
        await sendLowVoltageAlert(robotName, updatedData.voltage, topic, robotSectionInfo);
      }
      
      setTimeout(async () => {
        await updateAllFieldsSeparately(robotId, sectionName, updatedData);
      }, 500);
      
      return response.data;
    } catch (error) {
      await updateAllFieldsSeparately(robotId, sectionName, updatedData);
      
      if (updatedData.voltage !== undefined && updatedData.voltage < 15) {
        await sendLowVoltageAlert(robotName, updatedData.voltage, topic, robotSectionInfo);
      }
      
      throw error;
    }
  }, [API_BASE, updateAllFieldsSeparately, sendLowVoltageAlert]);

  const fetchAndConnectRobots = useCallback(async () => {
    if (isInitialized) return;

    try {
      console.log("Fetching robots from API for MQTT connections...");
      
      const robotsArray = await fetchInitialData();
      
      if (!robotsArray.length) {
        console.log("No robots data available yet");
        setIsInitialized(true);
        return;
      }
      
      console.log(`Found ${robotsArray.length} robots from API`);
      
      let allConnections = [];
      const newClients = {};
      
      robotsArray.forEach(robot => {
        const robotConnections = extractMqttConnectionsFromRobot(robot);
        allConnections = [...allConnections, ...robotConnections];
      });
      
      console.log(`Extracted ${allConnections.length} MQTT connections from robots`);
      
      if (allConnections.length === 0) {
        console.log("No MQTT connections found in robot data");
        setIsInitialized(true);
        return;
      }
      
      allConnections.forEach(connection => {
        try {
          const connectUrl = `wss://${connection.host}:${connection.port}/mqtt`;
          
          console.log(`Connecting to MQTT for ${connection.robotName} - ${connection.sectionName}...`);
          
          const client = mqtt.connect(connectUrl, {
            clientId: connection.clientId,
            username: connection.username,
            password: connection.password,
            clean: true,
            reconnectPeriod: 5000,
            connectTimeout: 10000,
            keepalive: 30,
          });

          client.on("connect", () => {
            console.log(`✅ MQTT Connected to: ${connection.robotName} - ${connection.sectionName}`);
            
            setActiveConnections(prev => {
              const existing = prev.filter(conn => 
                conn.robotId !== connection.robotId || conn.sectionName !== connection.sectionName
              );
              return [...existing, { 
                ...connection,
                connected: true,
                lastSeen: new Date().toISOString()
              }];
            });

            if (connection.topicSubscribe) {
              client.subscribe(connection.topicSubscribe, (err) => {
                if (err) {
                  console.error(`Subscribe error for ${connection.robotName}:`, err);
                } else {
                  console.log(`✅ Subscribed ONLY to Topic_subscribe: ${connection.topicSubscribe} for ${connection.robotName}`);
                }
              });
            }
          });

          client.on("message", async (topic, payload) => {
            try {
              const messageString = payload.toString();
              
              if (isMessageDuplicate(topic, messageString, connection.robotId, connection.sectionName)) {
                console.log("⏭️ Skipping duplicate message in MQTT handler");
                return;
              }
              
              console.log(`📩 MQTT Message from ${connection.robotName}:`, {
                topic,
                message: messageString,
                robotId: connection.robotId,
                robotName: connection.robotName,
                sectionName: connection.sectionName
              });
              
              const messageLower = messageString.toLowerCase();
              const messageExact = messageString.trim();
              
              const isHalfCycle = messageLower.includes('half cycle finished') || 
                                 messageExact === "Half cycle finished" ||
                                 messageLower.includes('half-cycle finished');
              
              const robotSectionInfo = findRobotAndSectionByTopic(topic);
              
              if (isHalfCycle) {
                console.log(`🎯 HALF CYCLE FINISHED DETECTED for ${connection.robotName}`);
                await handleHalfCycleFinished(
                  connection.robotId, 
                  connection.sectionName, 
                  topic, 
                  connection,
                  robotSectionInfo  
                );
                return;
              }
              
              const messageData = extractAllDataFromMessage(messageString);
              
              if (messageData) {
                console.log("🎯 PROCESSING MESSAGE_STATUS DATA:", messageData);
                
                try {
                  if (robotSectionInfo) {
                    const { robot, sectionName, section } = robotSectionInfo;
                    
                    await updateRobotSectionData(
                      robot.id, 
                      sectionName, 
                      messageData, 
                      robot.RobotName, 
                      topic, 
                      robotSectionInfo
                    );
                    
                  } else {
                    console.log("❌ No matching robot found for topic:", topic);
                  }
                } catch (error) {
                  console.error("❌ Error processing message update:", error);
                }
              } else {
                console.log("📝 PROCESSING NORMAL MESSAGE...");
                
                const msgObj = await processAndSaveMessage(
                  topic, 
                  messageString, 
                  connection.robotId, 
                  connection.sectionName,
                  false, 
                  null,
                  robotSectionInfo,
                  connection.robotName
                );
                
                if (msgObj) {
                  console.log("✅ Message processed and saved (ONCE):", msgObj);
                  
                  const shouldShow = await shouldShowMessageToUser(robotSectionInfo);
                  
                  const isScheduleMessage = messageString.toLowerCase().includes('schedule');
                  
                  if (shouldShow && !(userRoleRef.current === 'user' && isScheduleMessage)) {
                    const messageLower = msgObj.message.toLowerCase();
                    const robotDisplayName = msgObj.robotName || connection.robotName;
                    
                    if (msgObj.type === "alert" || 
                        messageLower.includes('alert') || 
                        messageLower.includes('error') ||
                        messageLower.includes('critical') ||
                        messageLower.includes('warning') ||
                        messageLower.includes('fail')) {
                      
                      toast.error(`🚨 ${robotDisplayName}`, {
                        description: msgObj.message.length > 100 ? 
                          `${msgObj.message.substring(0, 100)}...` : msgObj.message,
                        duration: 8000,
                      });
                    } else {
                      toast.info(`ℹ️ ${robotDisplayName}`, {
                        description: msgObj.message.length > 80 ? 
                          `${msgObj.message.substring(0, 80)}...` : msgObj.message,
                        duration: 5000,
                      });
                    }
                  } else {
                    console.log("⏭️ Skipping toast (user not in same project or schedule message for user)");
                  }
                }
              }

            } catch (error) {
              console.error("Error processing MQTT message:", error);
            }
          });

          client.on("error", (error) => {
            console.error(`❌ MQTT Error for ${connection.robotName} - ${connection.sectionName}:`, error);
            setActiveConnections(prev => 
              prev.map(conn => 
                (conn.robotId === connection.robotId && conn.sectionName === connection.sectionName)
                  ? { ...conn, connected: false, error: error.message }
                  : conn
              )
            );
          });

          client.on("close", () => {
            console.log(`🔌 MQTT Disconnected from ${connection.robotName} - ${connection.sectionName}`);
            setActiveConnections(prev => 
              prev.map(conn => 
                (conn.robotId === connection.robotId && conn.sectionName === connection.sectionName)
                  ? { ...conn, connected: false }
                  : conn
              )
            );
          });

          client.on("offline", () => {
            console.log(`📴 ${connection.robotName} - ${connection.sectionName} is offline`);
            setActiveConnections(prev => 
              prev.map(conn => 
                (conn.robotId === connection.robotId && conn.sectionName === connection.sectionName)
                  ? { ...conn, connected: false }
                  : conn
              )
            );
          });

          newClients[`${connection.robotId}-${connection.sectionName}`] = client;
          clientsRef.current[`${connection.robotId}-${connection.sectionName}`] = client;

        } catch (error) {
          console.error(`Failed to create MQTT connection for ${connection.robotName} - ${connection.sectionName}:`, error);
        }
      });

      setClients(newClients);
      setActiveConnections(allConnections.map(conn => ({ ...conn, connected: false })));
      setIsInitialized(true);
      
    } catch (error) {
      console.error("Failed to fetch robots from API:", error);
      setIsInitialized(true);
    }
  }, [API_BASE, isInitialized, fetchInitialData, extractAllDataFromMessage, updateRobotSectionData, processAndSaveMessage, findRobotAndSectionByTopic, handleHalfCycleFinished, shouldShowMessageToUser]);

  const reconnectConnection = useCallback((robotId, sectionName) => {
    const clientKey = `${robotId}-${sectionName}`;
    const client = clientsRef.current[clientKey];
    
    if (client) {
      console.log(`Reconnecting ${robotId}-${sectionName}...`);
      client.end();
      
      setTimeout(() => {
        fetchAndConnectRobots();
      }, 2000);
    }
  }, [fetchAndConnectRobots]);

  const reconnectAll = useCallback(() => {
    console.log("Reconnecting all MQTT connections...");
    Object.values(clientsRef.current).forEach(client => {
      if (client && client.end) {
        client.end();
      }
    });
    
    setClients({});
    clientsRef.current = {};
    setActiveConnections([]);
    setIsInitialized(false);
    
    setTimeout(() => {
      fetchAndConnectRobots();
    }, 3000);
  }, [fetchAndConnectRobots]);

  const publishMessage = useCallback((robotId, sectionName, topic, message) => {
    const clientKey = `${robotId}-${sectionName}`;
    const client = clientsRef.current[clientKey];
    
    if (!client || !client.connected) {
      console.error(`Cannot publish: No connected client for ${robotId}-${sectionName}`);
      return false;
    }
    
    try {
      client.publish(topic, message);
      console.log(`📤 Published to ${robotId}-${sectionName}: ${topic} -> ${message}`);
      
      return true;
    } catch (error) {
      console.error(`Publish failed for ${robotId}-${sectionName}:`, error);
      return false;
    }
  }, []);

  const publishButtonMessage = useCallback((robotId, sectionName, topic, buttonValue) => {
    try {
      console.log("🔄 publishButtonMessage CALLED:", { robotId, sectionName, topic, buttonValue });
      
      const actualButtonName = findActualButtonName(topic, buttonValue);
      const finalMessage = actualButtonName;
      
      console.log("📤 SENDING FINAL MESSAGE:", finalMessage);
      
      const published = publishMessage(robotId, sectionName, topic, finalMessage);
      
      const isScheduleButton = actualButtonName.toLowerCase().includes('schedule');
      const currentUserRole = userRoleRef.current;
      
      if (published && currentUserRole === 'user' && isScheduleButton) {
        toast.success(`Schedule command sent successfully to ${robotId}-${sectionName}`, {
          duration: 3000,
        });
      }
      
      if (published) {
        const robotSectionInfo = findRobotAndSectionByTopic(topic);
        const shouldShow = userRoleRef.current === 'user' ? 
          robotSectionInfo && robotSectionInfo.robot && 
          robotSectionInfo.robot.projectId : true;
        
        if (shouldShow) {
          const logMessage = {
            topic_main: findTopicMain(topic),
            message: `Button pressed: ${actualButtonName}`,
            type: "info",
            date: new Date().toISOString().slice(0, 10),
            time: new Date().toISOString().slice(11, 19),
            RobotId: robotId,
            sectionName: sectionName,
            direction: 'outgoing'
          };
          
          axios.post(`${API_BASE}/logs.php`, logMessage).catch(err => {
            console.error("❌ Failed to save button press log:", err);
          });
        }
      }
      
      return published;
      
    } catch (e) {
      console.error("publishButtonMessage error:", e);
      return false;
    }
  }, [publishMessage, findActualButtonName, findTopicMain, API_BASE]);

  const getConnectionStatus = (robotId, sectionName) => {
    const clientKey = `${robotId}-${sectionName}`;
    const client = clientsRef.current[clientKey];
    
    if (!client) return 'disconnected';
    return client.connected ? 'connected' : 'connecting';
  };

  useEffect(() => {
    if (!isInitialized) {
      fetchAndConnectRobots();
    }
  }, [fetchAndConnectRobots, isInitialized]);

  useEffect(() => {
    return () => {
      console.log("Cleaning up all MQTT connections...");
      Object.values(clientsRef.current).forEach(client => {
        if (client && client.end) {
          try {
            client.end();
          } catch (error) {
            console.error("Error ending client:", error);
          }
        }
      });
    };
  }, []);

  const value = {
    clients: clientsRef.current,
    activeConnections,
    notifications,
    reconnectAll,
    reconnectConnection,
    publishMessage,
    publishButtonMessage,
    getConnectionStatus,
    isInitialized,
    connectionCount: Object.keys(clientsRef.current).length,
    connectedCount: activeConnections.filter(conn => conn.connected).length
  };

  return (
    <MqttContext.Provider value={value}>
      {children}
    </MqttContext.Provider>
  );
}

export const useMqtt = () => {
  const context = useContext(MqttContext);
  if (!context) {
    throw new Error("useMqtt must be used within an MqttProvider");
  }
  return context;
};