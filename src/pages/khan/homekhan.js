import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatButton from './ChatButton';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f4f4f4] dark:bg-gray-900 flex flex-col items-center justify-center">
            {/* اضافه کردن justify-center برای وسط قرار گرفتن عمودی */}
            <ChatButton />
        </div>
    );
};

export default Home;