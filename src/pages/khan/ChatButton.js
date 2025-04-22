import React, { useState, useEffect } from 'react';
import Chat from './Chat';
import { FaHandPaper, FaRobot } from 'react-icons/fa';

// آرایه پیام‌ها با متن و آیکون‌ها
const messages = [
  {
    text: 'سلام، من خان هستم!',
    icons: (
      <div className="flex items-center gap-1">
        <FaHandPaper className="h-5 w-5 animate-bounce text-emerald-400 dark:text-neon-green" />
        <FaRobot className="h-5 w-5 text-emerald-400 dark:text-neon-green" />
      </div>
    ),
  },
  {
    text: 'خوشحال می‌شویم پاسخگوی سوالات شما باشیم.',
    icons: <FaRobot className="h-5 w-5 text-emerald-400 dark:text-neon-green" />,
  },
  {
    text: 'دستیار هوش مصنوعی ساتیا ',
    icons: <FaRobot className="h-5 w-5 text-emerald-400 dark:text-neon-green" />,
  },
  // می‌توانید پیام‌های بیشتری اضافه کنید
  // {
  //   text: 'سوال داری؟ از من بپرس!',
  //   icons: <FaRobot className="h-5 w-5 text-emerald-400 dark:text-neon-green" />,
  // },
];

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    // نمایش پیام اول به محض بارگذاری
    setShowMessage(true);

    // تنظیم تایمر برای چرخش پیام‌ها
    const interval = setInterval(() => {
      setShowMessage(false); // مخفی کردن پیام فعلی

      // بعد از 1 ثانیه پیام بعدی را نمایش بده
      setTimeout(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setShowMessage(true);
      }, 1000); // تأخیر 1 ثانیه برای محو شدن پیام
    }, 6000); // هر پیام 5 ثانیه نمایش داده می‌شود + 1 ثانیه تأخیر

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed">
      {/* پیام‌ها */}
      {showMessage && !isOpen && (
        <div className="animate-fade-in-up mb-4 flex items-center gap-2 rounded-xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md dark:bg-gray-800">
          {messages[currentMessageIndex].icons}
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            {messages[currentMessageIndex].text}
          </span>
          {/* حباب مثلثی */}
          <div className="absolute -bottom-2 right-4 h-3 w-3 rotate-45 transform bg-white/90 dark:bg-gray-800"></div>
        </div>
      )}

      {/* دکمه چت - مخفی هنگام باز بودن چت‌باکس */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white/100 dark:bg-gradient-to-br dark:from-dark-blue dark:to-dark-purple backdrop-blur-xl border border-white/20 p-4 rounded-full shadow-xl shadow-neon-blue/80 hover:bg-neon-blue/90 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:ring-offset-2 transform transition-transform duration-200 animate__animated animate__bounceIn animate__pulse animate__infinite hover:animate__tada"
          aria-label="باز کردن چت با ربات هوش مصنوعی"
        >
          {/* آیکون ربات */}
          <svg
            className="w-8 h-8 text-green-500 dark:text-neon-green hover:scale-110 transition-transform"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            {/* حباب چت */}
            <path d="M12 2a10 10 0 00-10 10c0 1.8.5 3.5 1.4 5l-1.4 4 4-1.4A10 10 0 0012 22a10 10 0 000-20z" />
            {/* نقاط پیام */}
            <circle cx="9" cy="12" r="1" fill="#fff" />
            <circle cx="12" cy="12" r="1" fill="#fff" />
            <circle cx="15" cy="12" r="1" fill="#fff" />
          </svg>
        </button>
      )}

      {/* مودال چت */}
      {isOpen && (
        <div className="fixed w-96 max-w-[90vw] h-[45rem] bg-white/80 dark:bg-gradient-to-br dark:from-dark-blue dark:to-dark-purple backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl sm:bottom-20 animate__animated animate__zoomIn animate__faster">
          <Chat
            onClose={() => setIsOpen(false)}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
          />
        </div>
      )}
    </div>
  );
};

export default ChatButton;