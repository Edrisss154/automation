import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { getOasSettings, saveOasSettings } from '../../api/api';

const OasSettings = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        oas_numbering_format: '',
        oas_numbering_change: '0',
        oas_numbering_start: '',
        oas_numbering_reset: '0'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRole, setSelectedRole] = useState(localStorage.getItem('userRole') || '');
    const userRoles = JSON.parse(localStorage.getItem('roles')) || [];

    useEffect(() => {
        const fetchOasSettings = async () => {
            try {
                const data = await getOasSettings();
                console.log("Fetched Settings:", data);

                const settings = data.reduce((acc, setting) => {
                    acc[setting.key] = setting.value || '';
                    return acc;
                }, {});

                console.log("Processed Settings:", settings);

                setFormData({
                    oas_numbering_format: settings.oas_numbering_format || '',
                    oas_numbering_change: settings.oas_numbering_change === '1' ? '1' : '0',
                    oas_numbering_start: settings.oas_numbering_start || '',
                    oas_numbering_reset: settings.oas_numbering_reset === '1' ? '1' : '0'
                });
            } catch (error) {
                console.error('Error fetching Oas settings:', error);
            }
        };

        fetchOasSettings();
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

            console.log('Sending FormData:');
            for (let [key, value] of formDataToSend.entries()) {
                console.log(key, value);
            }

            const response = await saveOasSettings(formDataToSend);
            console.log('Response:', response);
            alert('تنظیمات اتوماسیون اداری با موفقیت ذخیره شد!');
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

    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
        localStorage.setItem('userRole', e.target.value);
    };

    return (
        <div className="max-w-[600px] mx-auto p-5 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 direction-rtl">
            {/* Header */}
            <div className="w-full mt-8 flex justify-center items-center mb-6">
                <div className="bg-gray-200 dark:bg-gray-700 py-4 px-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">تنظیمات اتوماسیون اداری</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">فرمت شماره نامه:</label>
                    <input 
                        type="text" 
                        name="oas_numbering_format" 
                        value={formData.oas_numbering_format}
                        onChange={handleChange} 
                        placeholder="٪Y/٪M/٪C"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                    />
                    <div className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-3 rounded-md text-sm text-gray-600 dark:text-gray-300">
                        <div>٪y = سال دورقمی</div>
                        <div>٪Y = سال چهاررقمی</div>
                        <div>٪C = شماره (ضروری)</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <label className="inline-flex items-center">
                            <input 
                                type="checkbox" 
                                name="oas_numbering_change"
                                checked={formData.oas_numbering_change === '1'} 
                                onChange={handleChange}
                                className="form-checkbox text-blue-600 dark:text-blue-400"
                            />
                            <span className="mr-2 text-gray-700 dark:text-gray-200">تغییر شروع شماره</span>
                        </label>
                        {formData.oas_numbering_change === '1' && (
                            <input 
                                type="number" 
                                name="oas_numbering_start"
                                value={formData.oas_numbering_start} 
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
                                name="oas_numbering_reset"
                                checked={formData.oas_numbering_reset === '1'} 
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

export default OasSettings;
