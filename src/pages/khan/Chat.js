import React, { useState, useEffect, useRef } from 'react';
import { getDataSources, askQuestion } from './api';

const Chat = ({ onClose, chatHistory, setChatHistory }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [expandedSourceId, setExpandedSourceId] = useState(null);
  const [expandedTexts, setExpandedTexts] = useState({});
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'data-sources') {
      fetchDataSources();
    }
  }, [activeTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchDataSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDataSources();
      if (Array.isArray(data)) {
        setSources(data);
      } else if (data && Array.isArray(data.results)) {
        setSources(data.results);
      } else if (data && Array.isArray(data.data)) {
        setSources(data.data);
      } else if (data && Array.isArray(data.sources)) {
        setSources(data.sources);
      } else {
        console.error('Unexpected data format:', data);
        setSources([]);
        setError('ساختار داده‌های دریافتی نامعتبر است');
      }
    } catch (err) {
      console.error('Error in fetchDataSources HAMID:', err);
      setError(err.message || 'خطا در دریافت منابع داده');
    } finally {
      setLoading(false);
    }
  };

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

  const toggleChunks = (sourceId) => {
    setExpandedSourceId(expandedSourceId === sourceId ? null : sourceId);
  };

  const toggleTextExpansion = (chunkId) => {
    setExpandedTexts((prev) => ({
      ...prev,
      [chunkId]: !prev[chunkId],
    }));
  };

  const translateRefreshStatus = (status) => {
    const translations = {
      Never: 'هرگز',
      Daily: 'روزانه',
      Weekly: 'هفتگی',
      Monthly: 'ماهانه',
    };
    return translations[status] || status || 'هرگز';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
        <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">
          چت با خان
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          aria-label="بستن چت"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {['chat', 'data-sources', 'add-data'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 dark:bg-gray-900'
                : 'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
            }`}
          >
            {tab === 'chat'
              ? 'چت'
              : tab === 'data-sources'
              ? 'منابع داده'
              : 'داده جدید'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-600 p-6">
                  سوال خود را بپرسید تا گفتگو شروع شود
                </div>
              ) : (
                chatHistory.map((item, index) => (
                  <div key={index} className="transition-all duration-200">
                    {item.type === 'question' ? (
                      <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-xl shadow-sm text-right">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(item.timestamp)}
                          </span>
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            شما
                          </span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(item.timestamp)}
                          </span>
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                            خان
                          </span>
                        </div>
                        <div className="mb-4">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                        {item.sources && item.sources.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                              منابع:
                            </h3>
                            <ul className="list-disc pr-5 space-y-2">
                              {item.sources.map((source, sourceIndex) => (
                                <li key={sourceIndex} className="text-sm">
                                  <p className="text-gray-700 dark:text-gray-300">
                                    {source.text}
                                  </p>
                                  <a
                                    href={source.metadata.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                  >
                                    منبع: {source.metadata.source}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-600 dark:border-blue-400 mr-3"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    در حال دریافت پاسخ...
                  </p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="سوال خود را بپرسید..."
                className="flex-1 p-3 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                disabled={chatLoading}
              />
              <button
                type="submit"
                disabled={chatLoading || !question.trim()}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center transition-colors"
              >
                {chatLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                    <span>در حال ارسال...</span>
                  </>
                ) : (
                  'ارسال'
                )}
              </button>

            </form>
            {error && (
              <div className="text-red-600 dark:text-red-400 mt-2 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                {error}
              </div>
            )}
          </div>
        )}
        {activeTab === 'data-sources' && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 dark:border-blue-400"></div>
              </div>
            ) : error ? (
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="text-red-600 dark:text-red-400 mb-3 font-medium">
                  {error}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  لطفاً موارد زیر را بررسی کنید:
                  <ul className="list-disc list-inside mt-2 text-right">
                    <li>اتصال به اینترنت</li>
                    <li>وضعیت سرور</li>
                    <li>آدرس API در فایل .env</li>
                  </ul>
                </div>
                <button
                  onClick={fetchDataSources}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  تلاش مجدد
                </button>
              </div>
            ) : sources && Array.isArray(sources) && sources.length > 0 ? (
              <div className="grid gap-4">
                {sources.map((source, index) => (
                  <div
                    key={source.id || index}
                    className="p-4 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all border border-gray-200 dark:border-gray-700"
                    onClick={() => toggleChunks(source.id || index)}
                  >
                    <div className="flex flex-col">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {source.url}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          وارد شده توسط: {source.imported_by || 'نامشخص'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          تاریخ وارد کردن:{' '}
                          {source.import_date
                            ? new Date(source.import_date).toLocaleString('fa-IR')
                            : 'نامشخص'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          دوره بروزرسانی:{' '}
                          {translateRefreshStatus(source.refresh_status)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        تعداد قطعات متن: {source.chunks ? source.chunks.length : 0}
                      </p>
                      <span className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        {expandedSourceId === (source.id || index)
                          ? 'بستن'
                          : 'مشاهده جزئیات'}
                      </span>
                    </div>
                    {expandedSourceId === (source.id || index) &&
                      source.chunks &&
                      source.chunks.length > 0 && (
                        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            قطعات متن:
                          </h4>
                          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                            {source.chunks.map((chunk, chunkIndex) => {
                              const chunkKey =
                                chunk.id || `chunk-${source.id || index}-${chunkIndex}`;
                              const isTextExpanded = expandedTexts[chunkKey];
                              return (
                                <div
                                  key={chunkKey}
                                  className="p-3 mb-3 text-xs dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
                                >
                                  <div className="flex justify-between mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                                      شناسه: {chunk.id || `بخش ${chunkIndex + 1}`}
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                                      صفحه: {chunk.metadata?.page || 'نامشخص'}
                                    </p>
                                  </div>
                                  {chunk.title && (
                                    <div className="mb-2">
                                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        عنوان:
                                      </p>
                                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                                        {chunk.title}
                                      </p>
                                    </div>
                                  )}
                                  {chunk.text && (
                                    <div className="mb-2">
                                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        متن:
                                      </p>
                                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {chunk.text.length > 200 && !isTextExpanded
                                          ? `${chunk.text.substring(0, 200)}...`
                                          : chunk.text}
                                      </p>
                                      {chunk.text.length > 200 && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleTextExpansion(chunkKey);
                                          }}
                                          className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                        >
                                          {isTextExpanded ? 'نمایش کمتر' : 'نمایش بیشتر'}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                  {chunk.content && !chunk.text && (
                                    <div className="mb-2">
                                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        محتوا:
                                      </p>
                                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {chunk.content.length > 200 && !isTextExpanded
                                          ? `${chunk.content.substring(0, 200)}...`
                                          : chunk.content}
                                      </p>
                                      {chunk.content.length > 200 && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleTextExpansion(chunkKey);
                                          }}
                                          className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                        >
                                          {isTextExpanded ? 'نمایش کمتر' : 'نمایش بیشتر'}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 p-6">
                هیچ منبع داده‌ای یافت نشد
              </div>
            )}
          </div>
        )}
        {activeTab === 'add-data' && (
          <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">
              افزودن منبع داده جدید
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-700 mb-1"
                >
                  آدرس وب‌سایت
                </label>
                <input
                  type="url"
                  id="url"
                  className="w-full px-3 py-2 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <button
                  onClick={async () => {
                    const urlInput = document.getElementById('url');
                    const url = urlInput.value;
                    if (!url) {
                      alert('لطفا آدرس وب‌سایت را وارد کنید');
                      return;
                    }
                    try {
                      new URL(url);
                    } catch (e) {
                      alert('لطفا یک آدرس معتبر وارد کنید');
                      return;
                    }
                    try {
                      const response = await fetch('http://127.0.0.1:8000/crawl_url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url }),
                      });
                      if (!response.ok) {
                        throw new Error('خطا در ارسال درخواست');
                      }
                      const data = await response.json();
                      if (data.status === 'success') {
                        const container = document.createElement('div');
                        container.className = 'mt-4 space-y-4';
                        data.chunks.forEach((chunk, index) => {
                          const chunkDiv = document.createElement('div');
                          chunkDiv.className =
                            'space-y-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm relative border border-gray-200 dark:border-gray-700';
                          chunkDiv.id = `chunk-${index}`;
                          const titleInput = document.createElement('input');
                          titleInput.type = 'text';
                          titleInput.value = chunk.title;
                          titleInput.className =
                            'w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
                          const textArea = document.createElement('textarea');
                          textArea.value = chunk.text;
                          textArea.rows = 4;
                          textArea.className =
                            'w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
                          const removeButton = document.createElement('button');
                          removeButton.innerHTML = '×';
                          removeButton.className =
                            'absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xl font-bold focus:outline-none';
                          removeButton.onclick = () => {
                            if (window.confirm('آیا از حذف این قطعه متن مطمئن هستید؟')) {
                              chunkDiv.remove();
                            }
                          };
                          chunkDiv.appendChild(removeButton);
                          chunkDiv.appendChild(titleInput);
                          chunkDiv.appendChild(textArea);
                          container.appendChild(chunkDiv);
                        });
                        const existingContainer = document.querySelector('.chunks-container');
                        if (existingContainer) {
                          existingContainer.remove();
                        }
                        const submitButton = document.createElement('button');
                        submitButton.innerHTML = 'ذخیره در پایگاه دانش';
                        submitButton.className =
                          'w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors';
                        let isLoading = false;
                        submitButton.onclick = async () => {
                          if (isLoading) return;
                          isLoading = true;
                          submitButton.innerHTML = 'در حال ذخیره سازی...';
                          submitButton.disabled = true;
                          const chunks = Array.from(
                            document.querySelectorAll('.chunks-container > div')
                          ).map((div) => ({
                            title: div.querySelector('input').value,
                            text: div.querySelector('textarea').value,
                            section: '',
                          }));
                          try {
                            const response = await fetch(
                              'http://127.0.0.1:8000/store_knowledge',
                              {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  source_url: url,
                                  chunks: chunks,
                                }),
                              }
                            );
                            if (response.ok) {
                              alert('اطلاعات با موفقیت ذخیره شد');
                              setActiveTab('data-sources');
                            } else {
                              throw new Error('خطا در ذخیره اطلاعات');
                            }
                          } catch (error) {
                            alert('خطا در ارسال درخواست: ' + error.message);
                          } finally {
                            isLoading = false;
                            submitButton.innerHTML = 'ذخیره در پایگاه دانش';
                            submitButton.disabled = false;
                          }
                        };
                        container.appendChild(submitButton);
                        container.classList.add('chunks-container');
                        urlInput.parentElement.parentElement.appendChild(container);
                      } else {
                        throw new Error('خطا در دریافت اطلاعات');
                      }
                    } catch (error) {
                      alert('خطا در ارسال درخواست: ' + error.message);
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  شروع خزش
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;