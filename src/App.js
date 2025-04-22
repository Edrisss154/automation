import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Navigate, Routes, Route } from "react-router-dom";
import AppRoutes from "./routes/Routes";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Login from './components/Login';

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <Router>
                    <div className="flex flex-col min-h-screen h-full bg-gray-50 dark:bg-gray-900 w-screen overflow-x-hidden">
                        <Content />
                    </div>
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
}

const Content = () => {
    const { isLoggedIn, loading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen h-full bg-gray-50 dark:bg-gray-900 w-screen">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md flex items-center gap-3 animate-pulse">
                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="font-bold">در حال ورود با SSO...</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {!isLoggedIn ? (
                <>
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </>
            ) : (
                <>
                    <Route path="/login" element={<Navigate to="/" />} />
                    <Route path="*" element={<AppContent isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} setIsMenuOpen={setIsMenuOpen} />} />
                </>
            )}
        </Routes>
    );
};

const AppContent = ({ isMenuOpen, toggleMenu, setIsMenuOpen }) => {
    return (
        <>
            <Header toggleMenu={toggleMenu} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <div className="flex flex-col min-h-screen h-full bg-gray-50 dark:bg-gray-900 w-screen">
                <div className="flex flex-1 h-full pt-16">
                    <Sidebar isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
                    <main className={`flex-1 p-4 transition-all duration-300 ease-in-out bg-gray-50 dark:bg-gray-900
                                   ${isMenuOpen ? "md:mr-[300px] lg:mr-[250px]" : "mr-0"}`}>
                        <AppRoutes />
                    </main>
                </div>
            </div>
        </>
    );
};

export default App;