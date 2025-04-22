import React from "react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
    const navigate = useNavigate();

    const settingsItems = [
        { title: "ایمیل سرور", description: "ایمیل سرور", icon: "/picture/icons/setting/Group 3334.svg", path: "/settings/Email" },
        { title: "دبیرخانه", description: "دبیرخانه", icon: "/picture/icons/dept.svg", path: "/settings/secretariat" },
        { title: "عمومی", description: "عمومی", icon: "/picture/icons/setting/Group 3333.svg", path: "/settings/general" },
        { title: "کاربران", description: "کاربران", icon: "/picture/icons/setting/Group 3343.svg", path: "/settings/Users" },
        { title: "سربرگ ها", description: "سربرگ ها", icon: "/picture/icons/setting/Group 3337.svg", path: "/settings/Headers" },
        { title: "اتوماسیون اداری", description: "اتوماسیون اداری", icon: "/picture/icons/automation.svg", path: "/settings/Officeautomation" },
        // { title: "ارتباط بین مجموعه", description: "ارتباط بین مجموعه", icon: "/picture/icons/setting/Group 3345.svg", path: "/inter-collection-communication" },
        { title: "مجوزها", description: "مجوزها", icon: "/picture/icons/setting/Group 3344.svg", path: "/settings/Permissions" },
        { title: "مخاطبین مکاتبات", description: "مخاطبین مکاتبات", icon: "/picture/icons/setting/Group 3340.svg", path: "/settings/Management" },
        { title: "CRM", description: "ارتباط با سازمان‌های دیگر", icon: "/picture/icons/setting/Group 3345.svg", path: "/settings/CRM" },
    ];

    return (
        <div className="min-h-screen bg-[#f4f4f4] dark:bg-gray-900 flex flex-col items-center">
            {/* Header Title */}
            <div className="w-full mt-8 flex justify-center items-center">
                <div className="bg-gray-200 dark:bg-gray-800 py-4 px-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">تنظیمات</h2>
                </div>
            </div>
            
            <div className="w-full p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl lg:max-w-[calc(100%-250px)] mx-auto">
                    {settingsItems.map((item, index) => (
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

export default Settings;
