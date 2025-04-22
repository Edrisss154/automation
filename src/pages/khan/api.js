import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';
const PYTHON_CHAT_DATA_SOURCE = process.env.REACT_APP_PYTHON_APP_API_URL || 'http://localhost:8000';

// Mock data for demonstration (remove in production)
const mockDataSources = {
  sources: [
    {
      id: 1,
      url: 'https://www.satia.co/',
      imported_by: 'کاربر ۱',
      import_date: '2025-04-20T10:00:00',
      refresh_status: 'Daily',
      chunks: [
        { id: 'chunk1', title: 'نمونه', text: 'این یک متن نمونه است...', metadata: { page: 1 } },
      ],
    },
  ],
};

const mockAskQuestion = (question) => ({
  answer: `پاسخ به سوال شما: ${question}`,
  sources: [
    { text: 'منبع نمونه', metadata: { url: 'https://www.satia.co/', source: 'وب‌سایت نمونه' } },
  ],
});

export const getDataSources = async () => {
  try {
    // Uncomment for actual API call
    /*
    console.log('Fetching data sources from:', `${PYTHON_CHAT_DATA_SOURCE}/data_sources/`);
    const response = await axios.get(`${PYTHON_CHAT_DATA_SOURCE}/data_sources/`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    console.log('Data sources response structure:', {
      isArray: Array.isArray(response.data),
      hasResultsArray: response.data && Array.isArray(response.data.results),
      hasDataArray: response.data && Array.isArray(response.data.data),
      hasSourcesArray: response.data && Array.isArray(response.data.sources),
      responseKeys: response.data ? Object.keys(response.data) : [],
      fullResponse: response.data,
    });
    return response.data;
    */
    // Mock response
    return mockDataSources;
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      },
    });
    if (error.response) {
      throw new Error(`خطا در دریافت منابع داده (کد خطا: ${error.response.status})`);
    } else if (error.request) {
      throw new Error('سرور پاسخ نمی‌دهد. لطفاً اتصال اینترنت و سرور را بررسی کنید.');
    } else {
      throw new Error('خطا در ارسال درخواست به سرور');
    }
  }
};

export const askQuestion = async (question) => {
  try {
    // Uncomment for actual API call
    /*
    const CHAT_API_URL = process.env.PYTHON_APP_API_URL || `${PYTHON_CHAT_DATA_SOURCE}/ask`;
    console.log('Sending question to:', CHAT_API_URL);
    const response = await axios.post(CHAT_API_URL, { question });
    console.log('Chat response:', response.data);
    return response.data;
    */
    // Mock response
    return mockAskQuestion(question);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      },
    });
    if (error.response) {
      throw new Error(`خطا در دریافت پاسخ (کد خطا: ${error.response.status})`);
    } else if (error.request) {
      throw new Error('سرور پاسخ نمی‌دهد. لطفاً اتصال اینترنت و سرور را بررسی کنید.');
    } else {
      throw new Error('خطا در ارسال درخواست به سرور');
    }
  }
};