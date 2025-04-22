import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';
import '../styles/animations.css';
import NetworkBackground3D from './NetworkBackground3D';

const Login = () => {
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const { login, redirectToSSO } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(mobile, password);
            navigate('/');
        } catch (error) {
            setError('نام کاربری یا رمز عبور نادرست است');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
        }
    };

    const handleSSOLogin = () => {
        redirectToSSO();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className="fixed top-4 left-4 z-50 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300"
                aria-label="Toggle theme"
            >
                {isDark ? (
                    <FaSun className="w-5 h-5 text-yellow-400" />
                ) : (
                    <FaMoon className="w-5 h-5 text-gray-700" />
                )}
            </button>

            {/* Interactive 3D Background */}
            <NetworkBackground3D />

            {/* Login Card */}
            <div className={`relative z-10 w-full max-w-md p-10 bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl backdrop-blur-md transform transition-all duration-300 hover:-translate-y-1 ${isShaking ? 'animate-shake' : ''}`}>
                <div className="text-center mb-10">
                    {/* Logo with enhanced styling */}
                    <div className="flex justify-center mb-6">
                        <div className="w-32 h-32 relative">
                            <img
                                src="/picture/icons/removebg.png"
                                alt="Logo"
                                className="w-full h-full object-contain rounded-2xl p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg transform transition-transform duration-300 hover:scale-105"
                            />
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent"></div>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                        نامه چی
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                        دبیرخانه هوشمند
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            شماره همراه خود را وارد نمایید
                        </label>
                        <input
                            type="text"
                            placeholder="09*********"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            رمز عبور
                        </label>
                        <input
                            type="password"
                            placeholder="رمز عبور"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        ورود با نام کاربری
                    </button>

                    <button
                        type="button"
                        onClick={handleSSOLogin}
                        className="w-full py-3 px-4 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-pink-500/25 transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        SSO ورود با
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;