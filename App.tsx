import React, { useState, createContext, useContext, useMemo, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginScreen from './components/screens/LoginScreen';
import RoleSelectionScreen from './components/screens/RoleSelectionScreen';
import FarmerDashboard from './components/screens/FarmerDashboard';
import LabDashboard from './components/screens/LabDashboard';
import FactoryDashboard from './components/screens/FactoryDashboard';
import CustomerDashboard from './components/screens/CustomerDashboard';
import VerificationScreen from './components/screens/VerificationScreen';
import RegistrationScreen from './components/screens/RegistrationScreen';
import AdminDashboard from './components/screens/AdminDashboard';
import BioWasteRoutingScreen from './components/screens/BioWasteRoutingScreen';
import BioWasteTrackingScreen from './components/screens/BioWasteTrackingScreen';
import ProductJourneyScreen from './components/screens/ProductJourneyScreen';
import QrCodeScreen from './components/screens/QrCodeScreen';
import UserProfileScreen from './components/screens/UserProfileScreen';
import ForgotPasswordScreen from './components/screens/ForgotPasswordScreen';
import HarvestMapScreen from './components/screens/HarvestMapScreen';
import MPINScreen from './components/screens/MPINScreen'; // Import MPIN screen
import HerbDatabaseScreen from './components/screens/HerbDatabaseScreen';
import { User, VerificationResult, BioWasteSubmission, BatchDetails, ChatMessage } from './types';
import { Language, translations } from './translations';
import Chatbot from './components/common/Chatbot';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Context
interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updatedUserData: Partial<User>) => void;
  mpinHash: string | null;
  setMpin: (mpin: string) => void;
  isUnlocked: boolean;
  unlockApp: () => void;
  forgotMpin: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// App State Context
interface AppStateContextType {
  verificationResult: VerificationResult | null;
  setVerificationResult: (result: VerificationResult | null) => void;
  bioWasteSubmission: BioWasteSubmission | null;
  setBioWasteSubmission: (submission: BioWasteSubmission | null) => void;
  productId: string | null;
  setProductId: (id: string | null) => void;
  batchDetails: BatchDetails | null;
  setBatchDetails: (details: BatchDetails | null) => void;
}
const AppStateContext = createContext<AppStateContextType | undefined>(undefined);
export const useAppState = () => {
    const context = useContext(AppStateContext);
    if (!context) throw new Error('useAppState must be used within an AppStateProvider');
    return context;
};

// Theme Context
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('saferoot_theme') as Theme;
      if (storedTheme) return storedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('saferoot_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};


// Language Context
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('saferoot_language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('saferoot_language', language);
  }, [language]);

  const t = (key: string, options?: { [key: string]: string | number }) => {
    let translation = translations[language][key] || translations['en'][key] || key;
    if (options) {
      Object.keys(options).forEach(placeholder => {
        translation = translation.replace(`{{${placeholder}}}`, String(options[placeholder]));
      });
    }
    return translation;
  };

  const value = useMemo(() => ({ language, setLanguage, t }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within a LanguageProvider');
  return context;
};


const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mpinHash, setMpinHash] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  useEffect(() => {
      try {
        const storedUser = localStorage.getItem('saferoot_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            const storedMpin = localStorage.getItem(`saferoot_mpin_${parsedUser.id}`);
            setMpinHash(storedMpin);
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('saferoot_user');
      }
  }, []);

  const login = (userData: User) => {
    localStorage.setItem('saferoot_user', JSON.stringify(userData));
    setUser(userData);
    const storedMpin = localStorage.getItem(`saferoot_mpin_${userData.id}`);
    setMpinHash(storedMpin);
    setIsUnlocked(false); // Always require MPIN after login
  };
  
  const logout = () => {
    localStorage.removeItem('saferoot_user');
    setUser(null);
    setMpinHash(null);
    setIsUnlocked(false);
  };

  const updateUser = (updatedUserData: Partial<User>) => {
    if (user) {
        const newUser = { ...user, ...updatedUserData };
        setUser(newUser);
        localStorage.setItem('saferoot_user', JSON.stringify(newUser));
    }
  };

  const setMpin = (mpin: string) => {
    if (user) {
        // This is a mock hash. In a real app, use a proper hashing algorithm.
        const hash = `hashed_${mpin}_${user.id}`;
        localStorage.setItem(`saferoot_mpin_${user.id}`, hash);
        setMpinHash(hash);
        setIsUnlocked(true); // Unlock the app immediately after setting the MPIN
    }
  };

  const unlockApp = () => {
      setIsUnlocked(true);
  };

  const forgotMpin = () => {
      if (user) {
          localStorage.removeItem(`saferoot_mpin_${user.id}`);
      }
      logout(); // Force re-login with password
  };

  const value = useMemo(() => ({ 
      user, 
      login, 
      logout,
      updateUser,
      mpinHash,
      setMpin,
      isUnlocked,
      unlockApp,
      forgotMpin
  }), [user, mpinHash, isUnlocked]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
    const [bioWasteSubmission, setBioWasteSubmission] = useState<BioWasteSubmission | null>(null);
    const [productId, setProductId] = useState<string | null>(null);
    const [batchDetails, setBatchDetails] = useState<BatchDetails | null>(null);

    const value = useMemo(() => ({ 
        verificationResult, 
        setVerificationResult,
        bioWasteSubmission,
        setBioWasteSubmission,
        productId,
        setProductId,
        batchDetails,
        setBatchDetails,
    }), [verificationResult, bioWasteSubmission, productId, batchDetails]);

    return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

// Chatbot Context
interface ChatbotContextType {
    isChatbotOpen: boolean;
    toggleChatbot: () => void;
    pageContext: string;
    setPageContext: (context: string) => void;
    messages: ChatMessage[];
    addMessage: (message: ChatMessage) => void;
}
const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const useChatbot = () => {
    const context = useContext(ChatbotContext);
    if (!context) throw new Error('useChatbot must be used within a ChatbotProvider');
    return context;
};

const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [pageContext, setPageContext] = useState('RoleSelectionScreen');
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const addMessage = (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
    };

    const toggleChatbot = () => {
        setIsChatbotOpen(prev => {
            const newOpenState = !prev;
            if (newOpenState && messages.length === 0) { // Add initial greeting only on first open
                addMessage({ sender: 'ai', text: 'Hello! I am RootBot, your AI assistant. How can I help you today?' });
            }
            return newOpenState;
        });
    };

    const value = useMemo(() => ({
        isChatbotOpen,
        toggleChatbot,
        pageContext,
        setPageContext,
        messages,
        addMessage,
    }), [isChatbotOpen, pageContext, messages]);

    return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>;
};

const ProtectedRoute: React.FC = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <DashboardLayout />; // DashboardLayout will render the Outlet and the Chatbot FAB
};

function AppContent() {
  const { user, isUnlocked } = useAuth();

  // If the user is logged in but the app is locked, show the MPIN screen.
  if (user && !isUnlocked) {
    return (
        <div className="text-gray-800 dark:text-white min-h-screen flex items-center justify-center font-sans">
            <MPINScreen />
        </div>
    );
  }
  
  return (
    <div className="text-gray-800 dark:text-white min-h-screen flex items-center justify-center font-sans">
        <Router>
            <Routes>
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/register" element={<RegistrationScreen />} />
                <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
                <Route path="/" element={<Navigate to={user ? "/select-role" : "/login"} />} />
                
                <Route element={<ProtectedRoute />}>
                    <Route path="/select-role" element={<RoleSelectionScreen />} />
                    <Route path="/profile" element={<UserProfileScreen />} />
                    <Route path="/dashboard/farmer" element={<FarmerDashboard />} />
                    <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    <Route path="/dashboard/lab" element={<LabDashboard />} />
                    <Route path="/dashboard/factory" element={<FactoryDashboard />} />
                    <Route path="/dashboard/customer" element={<CustomerDashboard />} />
                    <Route path="/verification" element={<VerificationScreen />} />
                    <Route path="/biowaste/route" element={<BioWasteRoutingScreen />} />
                    <Route path="/biowaste/tracking" element={<BioWasteTrackingScreen />} />
                    <Route path="/journey/customer" element={<ProductJourneyScreen />} />
                    <Route path="/qrcode" element={<QrCodeScreen />} />
                    <Route path="/harvest-map" element={<HarvestMapScreen />} />
                    <Route path="/herb-database" element={<HerbDatabaseScreen />} />
                </Route>
            </Routes>
        </Router>
        <Chatbot />
    </div>
  );
}

const App: React.FC = () => (
    <AuthProvider>
      <AppStateProvider>
        <ThemeProvider>
          <LanguageProvider>
            <ChatbotProvider>
              <AppContent />
            </ChatbotProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AppStateProvider>
    </AuthProvider>
);

export default App;