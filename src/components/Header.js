import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import useWindowSize from "../pages/hooks/useWindowSize";
import { useTheme } from "../context/ThemeContext";
import { getUserById } from "../api/api";

const Header = ({ toggleMenu, isMenuOpen, setIsMenuOpen }) => {
    const { isDark, toggleTheme } = useTheme();
    const { width } = useWindowSize();
    const [showModal, setShowModal] = useState(false);
    const [userData, setUserData] = useState({});

    const userId = localStorage.getItem('userId');
    const apiUrl = process.env.REACT_APP_API_URL || 'https://automationapi.satia.co';

    // Fetch user data on component mount
    useEffect(() => {
        if (userId) {
            getUserById(userId).then(data => {
                setUserData(data);
            }).catch(error => {
                console.error("Error fetching user data:", error);
            });
        }
    }, [userId]);

    useEffect(() => {
        if (width >= 1024 && !isMenuOpen) {
            setIsMenuOpen(true);
        }
    }, [width, isMenuOpen, setIsMenuOpen]);

    const handleModal = () => setShowModal(!showModal);

    return (
        <header className="bg-[#174C72] text-white flex items-center justify-center p-2 w-full fixed top-0 z-[200]">
            <div className="flex justify-between items-center w-full max-w-full px-4 md:px-1 sm:flex-row sm:justify-between">
                <div className="flex items-center gap-2">
                    {width < 1024 && (
                        <button className="bg-transparent border-none cursor-pointer" onClick={toggleMenu}>
                            <img
                                src="/picture/icons/menu.svg"
                                alt={isMenuOpen ? "منو باز" : "منو بسته"}
                                className="w-6 h-6 md:w-7.5 md:h-7.5 sm:w-7 sm:h-7"
                            />
                        </button>
                    )}
                </div>

                <h1 className="text-lg md:text-base sm:text-sm m-0 text-right flex-grow font-light text-white tracking-tight">
                    سامانه نامه چی
                </h1>

                <div className="profile" onClick={handleModal}>
                    
                    <img
                        src={userData.profile ? `${apiUrl}/storage/${userData.profile}` : "/picture/icons/profile.jpg"}
                        alt="پروفایل"
                        className="w-10 h-10 rounded-full sm:w-9 sm:h-9"
                    />
                </div>
            </div>

            {/* Modal */}
            <div className={`modal fade ${showModal ? 'show d-block' : ''}`} role="dialog" tabIndex="-1">
                <div className="modal-dialog" role="document">
                    <div className="modal-content text-black">
                        <div className="modal-header">
                            <h5 className="modal-title">اطلاعات پروفایل</h5>
                            <button className="btn-close" onClick={handleModal}></button>
                        </div>
                        <div className="modal-body">
                            {userData.profile && (
                                <div className="flex justify-center">
                                    <img
                                        src={`${apiUrl}/storage/${userData.profile}`}
                                        alt="عکس پروفایل"
                                        className="max-w-[200px] h-auto mb-2.5"
                                    />
                                </div>
                            )}
                            <p>نام: {userData.first_name}</p>
                            <p>نام خانوادگی: {userData.last_name}</p>
                            <p>شماره همراه: {userData.mobile}</p>
                            <p>ایمیل: {userData.email}</p>
                            <p>آدرس: {userData.address}</p>
                            {userData.signature && (
                                <div className="flex justify-center">
                                    <img
                                        src={userData.signature}
                                        alt="امضای پروفایل"
                                        className="max-w-[200px] h-auto mt-2.5"
                                    />
                                </div>
                            )}
                            <h6>سمت‌ها:</h6>
                            <div className="flex flex-wrap gap-2.5 ml-[3.5%]">
                                {userData.roles && userData.roles.map((role, index) => (
                                    <div
                                        className="bg-gray-100 border border-gray-200 rounded p-2.5 text-center min-w-[100px] max-w-[100px] flex-grow"
                                        key={index}
                                    >
                                        <h6>{role.name}</h6>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleModal}>بستن</button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;