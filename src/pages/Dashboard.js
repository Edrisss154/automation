import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getLettersreceived, getLettersCC, getLetterssend,getUnreadLettersCount } from '../api/api'; // استفاده از توابع جدیدimport { useNavigate } from 'react-router-dom';
import moment from 'moment-jalaali';
import useUserRoles from './hooks/useUserRoles';
import { useNavigate } from 'react-router-dom';
const Dashboard = () => {
  const [stats, setStats] = useState({
    sent: 0,
    received: 0,
    cc: 0,
    unseen: 0,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorProgress, setErrorProgress] = useState(100);
  const errorTimerRef = useRef(null);
  const { userRoles, selectedRole, setSelectedRole } = useUserRoles();
  const navigate = useNavigate();
  const perPage = 5;

  const showError = (message) => {
    if (errorTimerRef.current) {
      clearInterval(errorTimerRef.current);
    }
    setError(message);
    setErrorProgress(100);
    const startTime = Date.now();
    const duration = 3000;
    errorTimerRef.current = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingProgress = 100 - (elapsedTime / duration) * 100;
      if (remainingProgress <= 0) {
        clearInterval(errorTimerRef.current);
        setError(null);
        setErrorProgress(0);
      } else {
        setErrorProgress(remainingProgress);
      }
    }, 10);
  };

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) {
        clearInterval(errorTimerRef.current);
      }
    };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const page = 1;

      const [sentResponse, receivedResponse, ccResponse,] = await Promise.all([
        getLetterssend(1),
        getLettersreceived(1),
        getLettersCC(1),
      ]);
      
      const sentCount = sentResponse.total_count;
      const receivedCount = receivedResponse.total_count;
      const ccCount = ccResponse.total_count;
      const unreadCount = await getUnreadLettersCount();
            

      // Combine recent messages
      const sentLetters = (sentResponse.data || []).map((letter) => ({ ...letter, kartablType: 'sent' }));
      const receivedLetters = (receivedResponse.data || []).map((letter) => ({ ...letter, kartablType: 'received' }));
      const ccLetters = (ccResponse.data || []).map((letter) => ({ ...letter, kartablType: 'cc' }));

      const combinedLetters = [...sentLetters, ...receivedLetters, ...ccLetters]
        .sort((a, b) => new Date(b.registered_at) - new Date(a.registered_at))
        .slice(0, 5);

      setStats({
        sent: sentCount,
        received: receivedCount,
        cc: ccCount,
        unseen: unreadCount, // برای unseen نیاز به API جداگانه داریم، فعلاً صفره
      });

      setRecentMessages(combinedLetters);
      setLoading(false);
    } catch (err) {
      showError('خطا در بارگذاری داده‌های داشبورد');
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedRole, fetchDashboardData]);

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    localStorage.setItem('userRole', e.target.value);
  };

  const convertToJalali = (gregorianDate) => {
    return moment(gregorianDate).format('jYYYY/jMM/jDD');
  };

  const handleNavigate = (type) => {
    switch (type) {
      case 'sent':
        navigate('/Automation/kartabl-send');
        break;
      case 'received':
        navigate('/Automation/Inbox');
        break;
      case 'cc':
        navigate('/Automation/CC');
        break;
      default:
        break;
    }
  };

  const recentMessagesMemo = useMemo(() => recentMessages, [recentMessages]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-2 sm:p-4">
      {error && (
        <div className="fixed bottom-4 left-4 z-50 max-w-xs bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md shadow-lg animate-fade-in-up">
          <div className="flex justify-between items-center">
            <span className="text-sm">{error}</span>
            <button
              onClick={() => {
                if (errorTimerRef.current) {
                  clearInterval(errorTimerRef.current);
                }
                setError(null);
              }}
              className="text-red-700 hover:text-red-900 focus:outline-none ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div
            className="absolute bottom-0 left-0 h-1 bg-red-500 transition-all duration-100 ease-linear"
            style={{ width: `${errorProgress}%` }}
          ></div>
        </div>
      )}

      <div className="max-w-full mx-auto  dark:bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6">
        {/* Title */}
        <div className="w-full mt-8 flex justify-center items-center mb-6">
          <div className="bg-gray-200 dark:bg-gray-800 py-4 px-8 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">داشبورد </h2>
          </div>
        </div>

        {/* Role Selection */}
        <div className="flex flex-col sm:flex-row items-center justify-center mb-6 gap-3">
          <div className="flex items-center gap-2">
            <img src="/picture/icons/semat.svg" alt="User Icon" className="w-5 h-5 sm:w-6 sm:h-6" />
            <label htmlFor="userRole" className="text-gray-700 dark:text-white text-sm sm:text-base">
              سمت:
            </label>
          </div>
          <select
            id="userRole"
            value={selectedRole}
            onChange={handleRoleChange}
            className="w-full sm:w-auto dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-md py-2 px-3 text-gray-700 dark:text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {userRoles.map((role, index) => (
              <option key={index} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <div
            className=" dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between cursor-pointer hover:bg-[#e9e9e9] dark:hover:bg-gray-700 transition-colors duration-200"
            onClick={() => handleNavigate('sent')}
          >
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">پیام‌های ارسالی</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-300">{stats.sent}</p>
            </div>
            <img src="/picture/icons/automation.svg" alt="Sent" className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div
            className=" dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between cursor-pointer hover:bg-[#e9e9e9] dark:hover:bg-gray-700 transition-colors duration-200"
            onClick={() => handleNavigate('received')}
          >
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">پیام‌های دریافتی</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-300">{stats.received}</p>
            </div>
            <img src="/picture/icons/automation.svg" alt="Received" className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div
            className=" dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between cursor-pointer hover:bg-[#e9e9e9] dark:hover:bg-gray-700 transition-colors duration-200"
            onClick={() => handleNavigate('cc')}
          >
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">رونوشت‌ها</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-300">{stats.cc}</p>
            </div>
            <img src="/picture/icons/automation.svg" alt="CC" className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          
        </div>

        {/* Recent Messages */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
              پیام‌های اخیر {stats.unseen > 0 && <span className="text-red-500 text-sm">({stats.unseen} ندیده)</span>}
            </h3>
            <button
              onClick={fetchDashboardData}
              className="px-3 py-1 bg-[#174C72] text-white rounded hover:bg-[#123856] transition-colors duration-200 text-xs sm:text-sm"
            >
              رفرش
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#174C72] text-white text-xs sm:text-sm">
                  <th className="p-2 sm:p-3 text-right">نوع</th>
                  <th className="p-2 sm:p-3 text-right">موضوع</th>
                  <th className="p-2 sm:p-3 text-right hidden sm:table-cell">تاریخ</th>
                  <th className="p-2 sm:p-3 text-right">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {recentMessagesMemo.map((message, index) => {
                  const isUnseen = message.kartablType === 'received' && message.receiver && message.receiver.status !== 'seen';
                  return (
                    <tr
                      key={`${message.id}-${index}`}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-[#e9e9e9] dark:hover:bg-gray-700 text-xs sm:text-sm cursor-pointer transition-colors duration-200"
                      onClick={() => handleNavigate(message.kartablType)}
                    >
                      <td className="p-2 sm:p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {message.kartablType === 'sent' ? 'ارسالی' : message.kartablType === 'received' ? 'دریافتی' : 'رونوشت'}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3 max-w-[100px] sm:max-w-[200px] truncate">{message.subject}</td>
                      <td className="p-2 sm:p-3 hidden sm:table-cell">{convertToJalali(message.registered_at)}</td>
                      <td className="p-2 sm:p-3">
                        {isUnseen ? (
                          <span className="text-red-500 font-bold">ندیده</span>
                        ) : (
                          <span className="text-green-500">دیده‌شده</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {recentMessagesMemo.length === 0 && !loading && (
              <p className="text-center text-gray-600 dark:text-gray-300 py-4 text-sm">
                پیامی برای نمایش وجود ندارد
              </p>
            )}
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="flex flex-col items-center space-y-2">
              <div className="relative w-12 h-12">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">در حال بارگذاری...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;