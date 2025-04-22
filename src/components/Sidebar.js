import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useWindowSize from "../pages/hooks/useWindowSize";
import { useTheme } from "../context/ThemeContext";

const Sidebar = ({ isMenuOpen, toggleMenu }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { width } = useWindowSize();

    const [openSubMenu, setOpenSubMenu] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(width >= 1024);
    const { isDark, toggleTheme } = useTheme();

    useEffect(() => {
        setIsSidebarOpen(width >= 1024 || isMenuOpen);
    }, [width, isMenuOpen]);

    const handleNavigation = (path) => {
        if (width < 1024) {
            toggleMenu();
        }
        navigate(path);
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const handleSubMenuToggle = (menu) => {
        setOpenSubMenu(openSubMenu === menu ? null : menu);
    };

    const menuItemClasses = `flex items-center p-2.5 mb-2.5 rounded-lg cursor-pointer 
                           transition-all duration-200 ease-in-out 
                           hover:bg-[#f4f4f4] dark:bg-gray-900 dark:hover:bg-gray-800 
                           hover:translate-x-[5px]`;

    return (
        <>
            {/* Backdrop for mobile */}
            {isSidebarOpen && width < 1024 && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-[90]"
                    onClick={toggleMenu}
                ></div>
            )}
            
            <div
                className={`fixed top-[60px] w-[80%] md:w-[300px] lg:w-[250px] h-[calc(100vh-60px)]
                           bg-gray-50 dark:bg-black shadow-[0_2px_10px_rgba(0,0,0,0.1)] z-[100] 
                           flex flex-col pt-2 px-4 transition-all duration-300 ease-in-out 
                           ${isSidebarOpen ? "right-0" : "right-[-100%]"}
                           overflow-y-auto rtl`}
            >
                 <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-[#e9e9e9] dark:hover:bg-gray-700 transition-colors"
                    >
                        {isDark ? '🌞' : '🌙'}
                    </button>
                <ul className="list-none p-0 m-0 dark:bg-black">
                    {/* Home Menu */}
                   
                    <li
                        className={menuItemClasses}
                        onClick={() => handleNavigation("/")}
                    >
                        <img src="/picture/icons/home.png" alt="صفحه اصلی" className="w-6 h-6 ml-2.5" />
                        <span className="text-sm text-[#333] dark:text-white">صفحه اصلی</span>
                    </li>

                {/* Automation Menu */}
                <li
                    className={menuItemClasses}
                    onClick={() => handleSubMenuToggle("automation")}
                >
                    <img src="/picture/icons/automation.svg" alt="اتوماسیون" className="w-6 h-6 ml-2.5" />
                    <span className="text-sm text-[#333] dark:text-white">اتوماسیون</span>
                </li>
                {openSubMenu === "automation" && (
                    <ul className="list-none m-0 p-0 dark:bg-black">
                        <li
                            onClick={() => handleNavigation("/Automation/newmessage")}
                            className="flex items-center p-2.5 cursor-pointer transition-colors duration-300 
                                     hover:bg-[#e9e9e9] dark:bg-black dark:hover:bg-gray-800"
                        >
                            <div className="w-6 h-6 ml-2.5"></div>
                            <span className="text-sm text-[#555] dark:text-gray-300">ایجاد نامه جدید</span>
                        </li>
                        <li
                            onClick={() => handleNavigation("/Automation/mymessage")}
                            className="flex items-center p-2.5 cursor-pointer transition-colors duration-300 
                                     hover:bg-[#e9e9e9] dark:bg-black dark:hover:bg-gray-800"
                        >
                            <div className="w-6 h-6 ml-2.5"></div>
                            <span className="text-sm text-[#555] dark:text-gray-300">نامه های من</span>
                        </li>
                        <li
                            onClick={() => handleNavigation("/Automation/Inbox")}
                            className="flex items-center p-2.5 cursor-pointer transition-colors duration-300 
                                     hover:bg-[#e9e9e9] dark:bg-black dark:hover:bg-gray-800"
                        >
                            <div className="w-6 h-6 ml-2.5"></div>
                            <span className="text-sm text-[#555] dark:text-gray-300">کارتابل دریافتی</span>
                        </li>
                        <li
                            onClick={() => handleNavigation("/Automation/kartabl-send")}
                            className="flex items-center p-2.5 cursor-pointer transition-colors duration-300 
                                     hover:bg-[#e9e9e9] dark:bg-black dark:hover:bg-gray-800"
                        >
                            <div className="w-6 h-6 ml-2.5"></div>
                            <span className="text-sm text-[#555] dark:text-gray-300">کارتابل ارسالی</span>
                        </li>
                        <li
                            onClick={() => handleNavigation("/Automation/kartablsearch")}
                            className="flex items-center p-2.5 cursor-pointer transition-colors duration-300 
                                     hover:bg-[#e9e9e9] dark:bg-black dark:hover:bg-gray-800"
                        >
                            <div className="w-6 h-6 ml-2.5"></div>
                            <span className="text-sm text-[#555] dark:text-gray-300">جستجو در کارتابل</span>
                        </li>
                        <li
                            onClick={() => handleNavigation("/Automation/CC")}
                            className="flex items-center p-2.5 cursor-pointer transition-colors duration-300 
                                     hover:bg-[#e9e9e9] dark:bg-black dark:hover:bg-gray-800"
                        >
                            <div className="w-6 h-6 ml-2.5"></div>
                            <span className="text-sm text-[#555] dark:text-gray-300">رونوشت</span>
                        </li>
                    </ul>
                )}

                    {/* Settings Menu */}
                    <li
                        className={menuItemClasses}
                        onClick={() => handleSubMenuToggle("settings")}
                    >
                        <img src="/picture/icons/settings.svg" alt="تنظیمات" className="w-6 h-6 ml-2.5" />
                        <span className="text-sm text-[#333] dark:text-white">تنظیمات</span>
                    </li>
                    {openSubMenu === "settings" && (
                        <ul className="list-none m-0 p-0 dark:bg-black">
                            <li
                                onClick={() => handleNavigation("/settings/general")}
                                className="flex items-center p-2.5 cursor-pointer transition-colors duration-300 
                                         hover:bg-[#e9e9e9] dark:bg-black dark:hover:bg-gray-800"
                            >
                                <div className="w-6 h-6 ml-2.5"></div>
                                <span className="text-sm text-[#555] dark:text-gray-300">عمومی</span>
                            </li>
                            <li
                                onClick={() => handleNavigation("/settings/secretariat")}
                                className="flex items-center p-2.5 cursor-pointer transition-colors duration-300 
                                         hover:bg-[#e9e9e9] dark:bg-black dark:hover:bg-gray-800"
                            >
                                <div className="w-6 h-6 ml-2.5"></div>
                                <span className="text-sm text-[#555] dark:text-gray-300">دبیرخانه</span>
                            </li>
                            <li
                                onClick={() => handleNavigation("/settings/Email")}
                                className="flex items-center p-2.5 cursor-pointer transition-colors duration-300 
                                         hover:bg-[#e9e9e9] dark:bg-black dark:hover:bg-gray-800"
                            >
                                <div className="w-6 h-6 ml-2.5"></div>
                                <span className="text-sm text-[#555] dark:text-gray-300">ایمیل سرور</span>
                            </li>
                            <li
                                onClick={() => handleNavigation("/settings/Officeautomation")}
                                className="flex items-center p-2.5 cursor-pointer transition-colors duration-300 
                                         hover:bg-[#e9e9e9] dark:bg-black dark:hover:bg-gray-800"
                            >
                                <div className="w-6 h-6 ml-2.5"></div>
                                <span className="text-sm text-[#555] dark:text-gray-300">اتوماسیون اداری</span>
                            </li>
                            <li
                                onClick={() => handleNavigation("/settings/Headers")}
                                className="flex items-center p-2.5 cursor-pointer transition-colors duration-300 
                                         hover:bg-[#e9e9e9] dark:bg-black dark:hover:bg-gray-800"
                            >
                                <div className="w-6 h-6 ml-2.5"></div>
                                <span className="text-sm text-[#555] dark:text-gray-300">سربرگ ها</span>
                            </li>
                            <li
                                onClick={() => handleNavigation("/settings/Users")}
                                className="flex items-center p-2.5 cursor-pointer transition-colors duration-300 
                                         hover:bg-[#e9e9e9] dark:bg-black dark:hover:bg-gray-800"
                            >
                                <div className="w-6 h-6 ml-2.5"></div>
                                <span className="text-sm text-[#555] dark:text-gray-300">کاربران</span>
                            </li>
                            <li
                                onClick={() => handleNavigation("/settings/Management")}
                                className="flex items-center p-2.5 cursor-pointer transition-colors duration-300 
                                         hover:bg-[#e9e9e9] dark:bg-black dark:hover:bg-gray-800"
                            >
                                <div className="w-6 h-6 ml-2.5"></div>
                                <span className="text-sm text-[#555] dark:text-gray-300">مخاطبین مکاتبات</span>
                            </li>
                            <li
                                onClick={() => handleNavigation("/settings/Permissions")}
                                className="flex items-center p-2.5 cursor-pointer transition-colors duration-300 
                                         hover:bg-[#e9e9e9] dark:bg-black dark:hover:bg-gray-800"
                            >
                                <div className="w-6 h-6 ml-2.5"></div>
                                <span className="text-sm text-[#555] dark:text-gray-300">مجوزها</span>
                            </li>
                            <li
                                onClick={() => handleNavigation("/inter-collection-communication")}
                                className="flex items-center p-2.5 cursor-pointer transition-colors duration-300 
                                         hover:bg-[#e9e9e9] dark:bg-black dark:hover:bg-gray-800"
                            >
                                <div className="w-6 h-6 ml-2.5"></div>
                                <span className="text-sm text-[#555] dark:text-gray-300">ارتباط بین مجموعه</span>
                            </li>
                        </ul>
                    )}

                    {/* Other Menu Items */}
                    <li
                        className={menuItemClasses}
                        onClick={() => handleNavigation("/Hooby")}
                    >
                        <img src="/picture/icons/email.svg" alt="فکس و ایمیل" className="w-6 h-6 ml-2.5" />
                        <span className="text-sm text-[#333] dark:text-white">فکس و ایمیل</span>
                    </li>
                    <li
                        className={menuItemClasses}
                        onClick={() => handleNavigation("/help")}
                    >
                        <img src="/picture/icons/help.svg" alt="راهنما" className="w-6 h-6 ml-2.5" />
                        <span className="text-sm text-[#333] dark:text-white">راهنما</span>
                    </li>
                    <li
                        className={menuItemClasses}
                        onClick={handleLogout}
                    >
                        <img src="/picture/icons/Group3258.svg" alt="خروج" className="w-6 h-6 ml-2.5" />
                        <span className="text-sm text-[#333] dark:text-white">خروج</span>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default Sidebar;