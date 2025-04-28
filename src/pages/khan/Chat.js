import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { askQuestion } from './api';

const modalVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: 50, transition: { duration: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const Chat = ({ onClose, chatHistory, setChatHistory }) => {
  const [question, setQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = typeof window !== 'undefined' ? localStorage.getItem('darkMode') : null;
    return savedMode ? JSON.parse(savedMode) : true;
  });
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const currentQuestion = question;
    setQuestion('');
    setChatLoading(true);
    setError(null);

    setChatHistory((prev) => [
      ...prev,
      { type: 'question', text: currentQuestion, timestamp: new Date() },
    ]);

    try {
      const response = await askQuestion(currentQuestion);
      setChatHistory((prev) => [
        ...prev,
        {
          type: 'answer',
          answer: response.answer,
          sources: response.sources,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setError('خطا در دریافت پاسخ');
      console.error('Error asking question:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setChatHistory((prev) => [
        ...prev,
        {
          type: 'question',
          text: `فایل: ${file.name}`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const shouldShowDate = (currentItem, prevItem) => {
    if (!prevItem) return true;
    const currentDate = new Date(currentItem.timestamp).toDateString();
    const prevDate = new Date(prevItem.timestamp).toDateString();
    return currentDate !== prevDate;
  };

  return (
      <AnimatePresence>
        <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed inset-0 w-full h-full ${
                isDarkMode ? 'bg-[#020618] border-gray-700' : 'bg-[#E7F3EF] border-gray-200'
            } border rounded-none shadow-lg overflow-hidden flex flex-col z-50`}
        >
          {/* هدر */}
          <div
              className={`flex items-center p-3 sm:p-4 ${
                  isDarkMode ? 'bg-[#27272a] text-white' : 'bg-[#FFF] text-black'
              }`}
          >
            <button
                onClick={onClose}
                className="hover:text-gray-200 transition-colors mr-2"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h2 className="text-base sm:text-lg font-semibold">چت با خان</h2>
            <button
                onClick={toggleTheme}
                className="ml-auto p-2 text-black hover:text-gray-200 transition-colors"
            >
              {isDarkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
              ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
              )}
            </button>
          </div>

          {/* بخش چت */}
          <div
              className={`flex flex-col h-full ${
                  isDarkMode ? 'bg-[#020618]' : 'bg-[#E7F3EF]'
              }`}
              style={
                chatHistory.length === 0
                    ? {
                      backgroundImage: 'url(/Untitled1.png)',
                      backgroundSize: '256px 130px',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                    }
                    : {}
              }
          >
            <div className="flex-1 overflow-y-auto space-y-2 p-3 sm:p-4 md:p-5">
              {chatHistory.length === 0 ? (
                  <div className={`text-center p-4 sm:p-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    سوال خود را بپرسید تا گفتگو شروع شود
                  </div>
              ) : (
                  chatHistory.map((item, index) => (
                      <div key={index}>
                        {shouldShowDate(item, chatHistory[index - 1]) && (
                            <div
                                className={`text-center text-xs my-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                      <span className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-[#37474F]' : 'bg-[#DDE8E4]'}`}>
                        {formatDate(item.timestamp)}
                      </span>
                            </div>
                        )}
                        <motion.div
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            className="transition-all duration-200"
                        >
                          {item.type === 'question' ? (
                              <div className="flex justify-start">
                                <div
                                    className={`max-w-[80%] sm:max-w-[70%] p-2 sm:p-3 rounded-md shadow-sm ${
                                        isDarkMode ? 'bg-[#024a70]' : 'bg-[#DCF8C6]'
                                    }`}
                                >
                                  <p className={`leading-relaxed text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {item.text}
                                  </p>
                                  <span
                                      className={`text-xs block text-left mt-1 ${
                                          isDarkMode ? 'text-white/70' : 'text-gray-600'
                                      }`}
                                  >
                            {formatTimestamp(item.timestamp)}
                          </span>
                                </div>
                              </div>
                          ) : (
                              <div className="flex justify-end">
                                <div
                                    className={`max-w-[80%] sm:max-w-[70%] p-2 sm:p-3 rounded-md shadow-sm ${
                                        isDarkMode ? 'bg-[#E0E0E0]' : 'bg-[#FFFFFF]'
                                    }`}
                                >
                                  <div className="flex justify-between items-center mb-1">
                            <span
                                className={`text-xs font-semibold ${
                                    isDarkMode ? 'text-[#37474F]' : 'text-[#4DA8DA]'
                                }`}
                            >
                              خان
                            </span>
                                    <span className="text-xs text-gray-600">
                              {formatTimestamp(item.timestamp)}
                            </span>
                                  </div>
                                  <p className="text-gray-800 leading-relaxed text-sm sm:text-base">{item.answer}</p>
                                  {item.sources && item.sources.length > 0 && (
                                      <div className="mt-2">
                                        <h3 className="text-xs font-semibold text-gray-600 mb-1">منابع:</h3>
                                        <ul className="list-disc pl-4 space-y-1">
                                          {item.sources.map((source, sourceIndex) => (
                                              <li key={sourceIndex} className="text-xs">
                                                <p className="text-gray-600">{source.text}</p>
                                                <a
                                                    href={source.metadata.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline"
                                                >
                                                  منبع: {source.metadata.source}
                                                </a>
                                              </li>
                                          ))}
                                        </ul>
                                      </div>
                                  )}
                                </div>
                              </div>
                          )}
                        </motion.div>
                      </div>
                  ))
              )}
              {chatLoading && (
                  <div className="flex justify-end">
                    <div
                        className={`p-2 sm:p-3 rounded-md shadow-sm ${isDarkMode ? 'bg-[#27272a]' : 'bg-[#FFFFFF]'}`}
                    >
                      <div className="flex items-center">
                        <div className="animate-pulse flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <p className={`ml-2 text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>
                          در حال تایپ...
                        </p>
                      </div>
                    </div>
                  </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* فرم ورودی */}
            <div
                className={`w-4/5 mx-auto flex items-center p-2 sm:p-3 border-t ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
            >
              <button
                  type="submit"
                  disabled={chatLoading || !question.trim()}
                  onClick={handleSubmit}
                  className="p-2 text-[#4DA8DA] disabled:opacity-50"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
              <button
                  onClick={handleAttachClick}
                  className={`p-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 00-5.656-5.656l-6.586 6.586a6 6 0 008.485 8.485l6.586-6.586a2 2 0 00-2.828-2.828z"
                  />
                </svg>
              </button>
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
              />
              <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="پیام..."
                  className={`w-11/12 flex-1 p-2 sm:p-3 rounded-full focus:outline-none text-sm sm:text-base ${
                      isDarkMode
                          ? 'bg-[#27272a] text-white placeholder-gray-400'
                          : 'bg-[#FFFFFF] text-gray-800 placeholder-gray-400 border border-gray-300 focus:border-[#4DA8DA]'
                  }`}
                  disabled={chatLoading}
              />
            </div>

            {selectedFile && (
                <div
                    className={`text-sm p-2 mx-3 mb-2 rounded-lg ${
                        isDarkMode ? 'text-gray-300 bg-[#37474F]' : 'text-gray-600 bg-[#F5F5F5]'
                    }`}
                >
                  فایل انتخاب‌شده: {selectedFile.name}
                  <button
                      onClick={() => setSelectedFile(null)}
                      className={`ml-2 ${isDarkMode ? 'text-red-400 hover:text-red-600' : 'text-red-500 hover:text-red-700'}`}
                  >
                    حذف
                  </button>
                </div>
            )}

            {error && (
                <div
                    className={`text-sm p-2 rounded-lg mx-3 mb-3 ${
                        isDarkMode ? 'text-red-400 bg-red-900/20' : 'text-red-500 bg-red-100'
                    }`}
                >
                  {error}
                </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
  );
};

export default Chat;