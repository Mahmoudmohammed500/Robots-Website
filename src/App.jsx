import './App.css';
import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { MqttProvider } from "./context/MqttContext";
import { BrowserRouter } from "react-router-dom";

export default function App() {
  return (
    <AuthProvider>
      <MqttProvider
        host="43f3644dc69f4e39bdc98298800bf5e1.s1.eu.hivemq.cloud"
        port={8884}
        clientId="clientId-1Kyy79c7WB"
        username="testrobotsuser"
        password="Testrobotsuser@1234"
      >
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-center" richColors />
        </BrowserRouter>
      </MqttProvider>
    </AuthProvider>
  );
}
