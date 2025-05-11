import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    const menuItems = [
        { title: "دبیرخانه", description: "دبیرخانه", icon: "/picture/icons/dept.svg", path: "/" },
        { title: "اتوماسیون", description: "اتوماسیون", icon: "/picture/icons/automation.svg", path: "/automation" },
        { title: "داشبورد", description: "داشبورد", icon: "/picture/icons/dashboard.svg", path: "/dashboard" },
        { title: "راهنما", description: "راهنما", icon: "/picture/icons/help.svg", path: "/HelpPage" },
        { title: "فکس و ایمیل", description: "فکس و ایمیل", icon: "/picture/icons/email.svg", path: "/" },
        { title: "تنظیمات", description: "تنظیمات", icon: "/picture/icons/settings.svg", path: "/settings" },
    ];

    return (
        <div className="min-h-screen bg-[#f4f4f4] dark:bg-gray-900 flex flex-col items-center">
            {/* Menu Grid */}
            <div className="w-full pt-16 px-5 pb-5">
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;