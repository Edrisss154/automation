import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaSignOutAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const CRM = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [token, setToken] = useState('');
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('interorganizational_token');
        const storedUser = localStorage.getItem('interorganizational_user');

        if (storedToken) {
            setToken(storedToken);
            setIsConnected(true);
            if (storedUser) {
                try {
                    setUserInfo(JSON.parse(storedUser));
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }
            setSuccess('اتصال با موفقیت برقرار شد');
        } else {
            setError('اتصال به CRM ناموفق بود. لطفاً دوباره وارد شوید.');
        }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('interorganizational_token');
        localStorage.removeItem('interorganizational_user');
        setToken('');
        setUserInfo(null);
        setIsConnected(false);
        setSuccess('از سیستم خارج شدید');
    };

    return (
        <div className="min-h-screen bg-[#f4f4f4] dark:bg-gray-900 flex flex-col items-center p-4">
            <div className="w-full mt-8 flex justify-center items-center">
                <div className="bg-gray-200 dark:bg-gray-800 py-4 px-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">ارتباط بین سازمانی</h2>
                </div>
            </div>

            <div className="w-full max-w-md mt-8">
                <div className="dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-center mb-6">
                        <FaBuilding className="text-4xl text-blue-600 dark:text-blue-400 mr-2" />
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">اتصال به سیستم CRM</h3>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center p-4">
                            <svg
                                className="animate-spin h-5 w-5 text-blue-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            <span className="ml-2 text-gray-600 dark:text-gray-300">در حال بررسی اتصال...</span>
                        </div>
                    ) : isConnected ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <FaCheckCircle className="text-green-500 dark:text-green-400 mr-2" />
                                <span className="text-green-700 dark:text-green-300">متصل به سیستم CRM</span>
                            </div>

                            {userInfo && (
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">اطلاعات کاربر:</p>
                                    <div className="space-y-1">
                                        <p className="text-sm"><span className="font-medium">نام:</span> {userInfo.name}</p>
                                        <p className="text-sm"><span className="font-medium">نام کاربری:</span> {userInfo.username}</p>
                                        <p className="text-sm"><span className="font-medium">شماره سریال:</span> {userInfo.serial}</p>
                                    </div>
                                </div>
                            )}

                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">توکن:</p>
                                <p className="text-xs font-mono bg-gray-100 dark:bg-gray-600 p-2 rounded overflow-x-auto">
                                    {token.substring(0, 20)}...{token.substring(token.length - 10)}
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/inter-collection-communication/newmessage')}
                                className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 mb-3"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 ml-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                ثبت وظیفه
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200"
                            >
                                <FaSignOutAlt className="mr-2" />
                                خروج از سیستم
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {error && (
                                <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
                                    <FaTimesCircle className="mr-2" />
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md">
                                    <FaCheckCircle className="mr-2" />
                                    {success}
                                </div>
                            )}
                            <p className="text-center text-gray-600 dark:text-gray-400">لطفاً با پشتیبانی تماس بگیرید.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CRM;