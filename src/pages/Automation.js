import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUnreadLettersCount } from "../api/api";

const Automation = () => {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        getUnreadLettersCount()
            .then(data => {
                setUnreadCount(data);
            })
            .catch(err => {
                console.error("خطا در دریافت تعداد نامه‌های خوانده نشده:", err);
            });
    }, []);

    const menuItems = [
        { title: "کارتابل دریافتی", description: "کارتابل دریافتی", icon: "/picture/icons/Group 3216.svg", path: "/Automation/Inbox", count: unreadCount },
        { title: "نامه های من", description: "نامه های من", icon: "/picture/icons/Group11.svg", path: "/Automation/mymessage" },
        { title: "ایجاد نامه جدید", description: "ایجاد نامه جدید", icon: "/picture/icons/Group 3211.svg", path: "/Automation/newmessage" },
        { title: "رونوشت", description: "رونوشت", icon: "/picture/icons/Group 3218.svg", path: "/Automation/CC" },
        { title: "جستجو در کارتابل", description: "جستجو در کارتابل", icon: "/picture/icons/Group 2404.svg", path: "/Automation/kartablsearch" },
        { title: "کارتابل ارسالی", description: "کارتابل ارسالی", icon: "/picture/icons/Group 3217.svg", path: "/Automation/kartabl-send" },
    ];

    return (
        <div className="min-h-screen bg-[#f4f4f4] dark:bg-gray-900 flex flex-col items-center">
            {/* Header Title */}
            <div className="w-full mt-8 flex justify-center items-center mb-6">
                <div className="bg-gray-200 dark:bg-gray-800 py-4 px-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">اتوماسیون</h2>
                </div>
            </div>
            
            <div className="w-full p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl lg:max-w-[calc(100%-250px)] mx-auto">
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(item.path)}
                            className="relative flex flex-col items-center justify-center h-[90px] sm:h-[108px] md:h-[90px] rounded-[10px] 
                                     bg-gradient-to-b from-white from-60% to-[#005082] to-40%  
                                     dark:from-gray-800 dark:to-[#005082] 
                                     shadow-[0_4px_6px_#005082] hover:-translate-y-[5px] 
                                     transition-all duration-300 cursor-pointer overflow-hidden group"
                        >
                            <div className="flex flex-col items-center justify-center w-full h-full">
                                <img
                                    src={item.icon}
                                    alt={item.title}
                                    className="w-8 h-8 sm:w-10 sm:h-10 mb-[8px] sm:mb-[10px] transition-transform group-hover:scale-110"
                                />
                                <span className="text-white dark:text-white text-[14px] sm:text-[16px] md:text-[19px] font-semibold 
                                             transition-colors [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">
                                    {item.title}
                                </span>
                            </div>
                            {item.count !== undefined && (
                                <div className="absolute top-2 right-2 bg-[#FF5023] text-white rounded-full w-6 h-6 
                                             flex items-center justify-center text-xs font-bold shadow-md">
                                    {item.count}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Automation;
