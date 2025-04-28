import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { getEmailServerSettings, saveEmailServerSettings } from '../../api/api';

const EmailServerSettings = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        incoming_server: '',
        incoming_port: '',
        outgoing_server: '',
        outgoing_port: '',
        email: '',
        email_password: '',
        reading_spam: '0'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState(localStorage.getItem('userRole') || '');
    const userRoles = JSON.parse(localStorage.getItem('roles')) || [];
    const userFullName = localStorage.getItem('userFullName') || 'نام کاربر';
    const rolesWithUserName = [`نام کامل: ${userFullName}`, ...userRoles];
    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
        localStorage.setItem('userRole', e.target.value);
    };
    useEffect(() => {
        const fetchEmailServerSettings = async () => {
            try {
                const data = await getEmailServerSettings();
                //console.log("Fetched Settings:", data);

                const settings = data.reduce((acc, setting) => {
                    acc[setting.key] = setting.value || '';
                    return acc;
                }, {});

                //console.log("Processed Settings:", settings);

                setFormData({
                    incoming_server: settings.incoming_server || '',
                    incoming_port: settings.incoming_port || '',
                    outgoing_server: settings.outgoing_server || '',
                    outgoing_port: settings.outgoing_port || '',
                    email: settings.email || '',
                    email_password: settings.email_password || '',
                    reading_spam: settings.reading_spam === '1' ? '1' : '0'
                });
            } catch (error) {
                console.error('Error fetching email server settings:', error);
            }
        };

        fetchEmailServerSettings();
    }, []);

    useEffect(() => {
        //("Form Data Updated:", formData);
    }, [formData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: type === 'checkbox' ? (checked ? '1' : '0') : value
        }));
    };

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();

            Object.keys(formData).forEach(key => {
                const value = formData[key];
                if (value !== null && value !== undefined && value !== '') {
                    formDataToSend.append(key, value);
                }
            });

            //console.log('Sending FormData:');
            for (let [key, value] of formDataToSend.entries()) {
                //console.log(key, value);
            }

            const response = await saveEmailServerSettings(formDataToSend);
            //console.log('Response:', response);
            alert('تنظیمات ایمیل سرور با موفقیت ذخیره شد!');
        } catch (error) {
            console.error('Error:', error);
            alert('خطا در ذخیره تنظیمات. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/settings');
    };

    return (
        <div className="max-w-[800px] mx-auto p-5 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 direction-rtl">
            {/* Header */}
            <div className="w-full mt-8 flex justify-center items-center mb-6">
                <div className="bg-gray-200 dark:bg-gray-700 py-4 px-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">تنظیمات ایمیل سرور</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Incoming Server Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">سرور ورودی:</label>
                        <input 
                            type="url" 
                            name="incoming_server" 
                            value={formData.incoming_server} 
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">درگاه ورودی:</label>
                        <input 
                            type="number" 
                            name="incoming_port" 
                            value={formData.incoming_port} 
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                        />
                    </div>
                </div>

                {/* Outgoing Server Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">سرور خروجی:</label>
                        <input 
                            type="url" 
                            name="outgoing_server" 
                            value={formData.outgoing_server} 
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">درگاه خروجی:</label>
                        <input 
                            type="number" 
                            name="outgoing_port" 
                            value={formData.outgoing_port} 
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                        />
                    </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">آدرس ایمیل:</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                    />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">رمز عبور:</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="email_password"
                            value={formData.email_password}
                            onChange={handleChange}
                            className="w-full p-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                        />
                        <button 
                            type="button"
                            onClick={handleTogglePassword}
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                            {showPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                    </div>
                </div>

                {/* Spam Checkbox */}
                <div className="flex items-center">
                    <label className="inline-flex items-center">
                        <input 
                            type="checkbox" 
                            name="reading_spam" 
                            checked={formData.reading_spam === '1'}
                            onChange={handleChange}
                            className="form-checkbox text-blue-600 dark:text-blue-400"
                        />
                        <span className="mr-2 text-gray-700 dark:text-gray-200">خواندن پوشه spam</span>
                    </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-center space-x-4 space-x-reverse mt-6">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-800 disabled:opacity-50"
                    >
                        {isSubmitting ? 'در حال ذخیره...' : 'ثبت'}
                    </button>
                    <button 
                        type="button" 
                        onClick={handleCancel} 
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-800 disabled:opacity-50"
                    >
                        انصراف
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmailServerSettings;
