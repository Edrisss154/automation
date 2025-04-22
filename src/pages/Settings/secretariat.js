import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { getSecretariatSettings, saveSecretariatSettings } from '../../api/api';

const SecretariatSettings = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        secretariat_name: '',
        secretariat_type: '',
        secretariat_numbering_format: '',
        secretariat_numbering_change: '0',
        secretariat_numbering_start: '',
        secretariat_numbering_reset: '0'
    });
    const userRoles = JSON.parse(localStorage.getItem('roles')) || [];
    const userFullName = localStorage.getItem('userFullName') || 'نام کاربر';
    const rolesWithUserName = [`نام کامل: ${userFullName}`, ...userRoles];
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRole, setSelectedRole] = useState(localStorage.getItem('userRole') || '');

    useEffect(() => {
        const fetchSecretariatSettings = async () => {
            try {
                const data = await getSecretariatSettings();
                console.log("Fetched Settings:", data);

                const settings = data.reduce((acc, setting) => {
                    acc[setting.key] = setting.value !== null ? setting.value : '';
                    return acc;
                }, {});

                console.log("Processed Settings:", settings);

                setFormData({
                    secretariat_name: settings.secretariat_name || '',
                    secretariat_type: settings.secretariat_type || '',
                    secretariat_numbering_format: settings.secretariat_numbering_format || '',
                    secretariat_numbering_change: settings.secretariat_numbering_change === '1' ? '1' : '0',
                    secretariat_numbering_start: settings.secretariat_numbering_start || '',
                    secretariat_numbering_reset: settings.secretariat_numbering_reset === '1' ? '1' : '0'
                });
            } catch (error) {
                console.error('Error fetching secretariat settings:', error);
            }
        };

        fetchSecretariatSettings();
    }, []);

    useEffect(() => {
        console.log("Form Data Updated:", formData);
    }, [formData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: type === 'checkbox' ? (checked ? '1' : '0') : value
        }));
    };

    const handleRadioChange = (e) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            secretariat_type: e.target.value
        }));
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
                    if (key === 'organization_logo' && !(value instanceof File)) {
                        return;
                    }
                    formDataToSend.append(key, value);
                }
            });

            console.log('Sending FormData:');
            for (let [key, value] of formDataToSend.entries()) {
                console.log(key, value);
            }

            const response = await saveSecretariatSettings(formDataToSend);
            console.log('Response:', response);
            alert('تنظیمات دبیرخانه با موفقیت ذخیره شد!');
        } catch (error) {
            console.error('Error:', error);
            if (error.response) {
                console.error('Server Error:', error.response.data);
            }
            alert('خطا در ذخیره تنظیمات دبیرخانه. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/settings');
    };

    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
        localStorage.setItem('userRole', e.target.value);
    };

    return (
        <div className="max-w-[600px] mx-auto p-5 border border-gray-300 rounded-lg bg-gray-50  dark:bg-gray-800 direction-rtl">
            {/* Header */}
            <div className="w-full mt-8 flex justify-center items-center mb-6">
                <div className="bg-gray-200 dark:bg-gray-700 py-4 px-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">تنظیمات دبیرخانه</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">نام دبیرخانه:</label>
                    <input 
                        type="text" 
                        name="secretariat_name" 
                        value={formData.secretariat_name} 
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">نوع دبیرخانه:</label>
                    <div className="flex space-x-4 space-x-reverse">
                        <label className="inline-flex items-center">
                            <input 
                                type="radio" 
                                name="secretariat_type" 
                                value="single"
                                checked={formData.secretariat_type === 'single'} 
                                onChange={handleRadioChange}
                                className="form-radio text-blue-600 dark:text-blue-400"
                            />
                            <span className="mr-2 text-gray-700 dark:text-gray-200">تک دفتری</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input 
                                type="radio" 
                                name="secretariat_type" 
                                value="double"
                                checked={formData.secretariat_type === 'double'} 
                                onChange={handleRadioChange}
                                className="form-radio text-blue-600 dark:text-blue-400"
                            />
                            <span className="mr-2 text-gray-700 dark:text-gray-200">دو دفتری</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">فرمت شماره گذاری وارده / صادره:</label>
                    <input 
                        type="text" 
                        name="secretariat_numbering_format" 
                        value={formData.secretariat_numbering_format}
                        onChange={handleChange} 
                        placeholder="٪Y/٪M/٪C"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                    />
                    <div className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-3 rounded-md text-sm text-gray-600 dark:text-gray-300">
                        <div>٪y = سال دورقمی</div>
                        <div>٪Y = سال چهاررقمی</div>
                        <div>٪C = شماره (ضروری)</div>
                        <div>٪T = نوع سند (وارده=و ، صادره=ص)</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <label className="inline-flex items-center">
                            <input 
                                type="checkbox" 
                                name="secretariat_numbering_change"
                                checked={formData.secretariat_numbering_change === '1'} 
                                onChange={handleChange}
                                className="form-checkbox text-blue-600 dark:text-blue-400"
                            />
                            <span className="mr-2 text-gray-700 dark:text-gray-200">تغییر شروع شماره</span>
                        </label>
                        {formData.secretariat_numbering_change === '1' && (
                            <input 
                                type="number" 
                                name="secretariat_numbering_start"
                                value={formData.secretariat_numbering_start} 
                                onChange={handleChange}
                                placeholder="شروع شماره"
                                className="w-32 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                            />
                        )}
                    </div>

                    <div className="flex items-center">
                        <label className="inline-flex items-center">
                            <input 
                                type="checkbox" 
                                name="secretariat_numbering_reset"
                                checked={formData.secretariat_numbering_reset === '1'} 
                                onChange={handleChange}
                                className="form-checkbox text-blue-600 dark:text-blue-400"
                            />
                            <span className="mr-2 text-gray-700 dark:text-gray-200">شماره وارده/صادره به صورت سالانه ریست شود</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-center space-x-4 space-x-reverse mt-6">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-800 disabled:opacity-50"
                    >
                        {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
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

export default SecretariatSettings;
