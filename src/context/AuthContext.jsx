import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); 
  const [accessToken, setAccessToken] = useState(null);
  const [projectName, setProjectName] = useState(null);
  const [userName, setUserName] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get("accessToken");
      const role = Cookies.get("userRole");
      const project = Cookies.get("projectName");
      const name = Cookies.get("userName");
      
      if (token && role) {
        setIsAuthenticated(true);
        setUserRole(role);
        setAccessToken(token);
        setProjectName(project || null);
        setUserName(name || null);
      } else if (role && !token) {
        clearAllCookies();
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const clearAllCookies = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("userRole");
    Cookies.remove("projectName");
    Cookies.remove("userName");
  };

  const login = (role = 'user', projectNameValue = '', userNameValue = '') => {
    setIsAuthenticated(true);
    setUserRole(role);
    setProjectName(projectNameValue);
    setUserName(userNameValue);

    const cookieOptions = { expires: 7 }; 
    
    Cookies.set("userRole", role, cookieOptions);
    Cookies.set("projectName", projectNameValue, cookieOptions);
    Cookies.set("userName", userNameValue, cookieOptions);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setAccessToken(null);
    setProjectName(null);
    setUserName(null);
    
    clearAllCookies();
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      accessToken, 
      projectName,
      userName,
      isLoading,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}