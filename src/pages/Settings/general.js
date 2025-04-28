import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { getGeneralSettings, saveGeneralSettings } from '../../api/api';

const GeneralSettings = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        organization_name: '',
        organization_type: '',
        organization_email: '',
        organization_address: '',
        organization_postal_code: '',
        organization_phone: '',
        organization_fax: '',
        organization_website: '',
        organization_logo: null
    });

    const [logoPreview, setLogoPreview] = useState(null);
    const [selectedRole, setSelectedRole] = useState(localStorage.getItem('userRole') || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const userRoles = JSON.parse(localStorage.getItem('roles')) || [];
    const userFullName = localStorage.getItem('userFullName') || 'نام کاربر';
    const rolesWithUserName = [`نام کامل: ${userFullName}`, ...userRoles];

    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
        localStorage.setItem('userRole', e.target.value);
    };

    useEffect(() => {
        const fetchGeneralSettings = async () => {
            try {
                const data = await getGeneralSettings();
                //console.log("Fetched Settings:", data);

                const settings = data.reduce((acc, setting) => {
                    acc[setting.key] = setting.value || '';
                    return acc;
                }, {});

                //console.log("Processed Settings:", settings);

                setFormData({
                    organization_name: settings.organization_name || '',
                    organization_type: settings.organization_type || '',
                    organization_email: settings.organization_email || '',
                    organization_address: settings.organization_address || '',
                    organization_postal_code: settings.organization_postal_code || '',
                    organization_phone: settings.organization_phone || '',
                    organization_fax: settings.organization_fax || '',
                    organization_website: settings.organization_website || '',
                    organization_logo: settings.organization_logo || null
                });

                if (settings.organization_logo) {
                    setLogoPreview(settings.organization_logo);
                }
            } catch (error) {
                console.error('Error fetching general settings:', error);
            }
        };

        fetchGeneralSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prevFormData => ({ ...prevFormData, organization_logo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFormData(prevFormData => ({ ...prevFormData, organization_logo: null }));
            setLogoPreview(null);
        }
    };

    const handleInput = (e) => {
        const { name, value } = e.target;
        if (/^\d*$/.test(value)) {
            setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
        }
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

            const response = await saveGeneralSettings(formDataToSend);
            //console.log('Response:', response);
            alert('تنظیمات با موفقیت ذخیره شد!');
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
        <div className="max-w-[600px] mx-auto p-5 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 direction-rtl">
            {/* Header */}
            <div className="w-full mt-8 flex justify-center items-center mb-6">
                <div className="bg-gray-200 dark:bg-gray-700 py-4 px-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">تنظیمات عمومی</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">نام مجموعه:</label>
                    <input 
                        type="text" 
                        name="organization_name" 
                        value={formData.organization_name} 
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">نوع مجموعه:</label>
                    <input 
                        type="text" 
                        name="organization_type" 
                        value={formData.organization_type} 
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                    />
                </div>

                <div className="flex items-center space-x-4 space-x-reverse">
                    <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">لوگو:</span>
                    <input 
                        type="file" 
                        id="logo" 
                        name="organization_logo" 
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label htmlFor="logo" className="cursor-pointer">
                        <img 
                            src="/picture/icons/setting/Group 3347.svg" 
                            alt="Upload Logo" 
                            className="w-[50px] h-[50px] border border-gray-300 dark:border-gray-600 rounded-md object-cover"
                        />
                    </label>
                </div>

                <div className="space-y-2">
                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">آدرس ایمیل:</label>
                    <input 
                        type="email" 
                        name="organization_email" 
                        value={formData.organization_email} 
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">آدرس مجموعه:</label>
                    <input 
                        type="text" 
                        name="organization_address" 
                        value={formData.organization_address} 
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">کد پستی:</label>
                    <input 
                        type="text" 
                        name="organization_postal_code" 
                        value={formData.organization_postal_code} 
                        onChange={handleInput}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">شماره تماس:</label>
                    <input 
                        type="text" 
                        name="organization_phone" 
                        value={formData.organization_phone} 
                        onChange={handleInput}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">شماره فکس:</label>
                    <input 
                        type="text" 
                        name="organization_fax" 
                        value={formData.organization_fax} 
                        onChange={handleInput}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium">آدرس وب سایت:</label>
                    <input 
                        type="text" 
                        name="organization_website" 
                        value={formData.organization_website} 
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                    />
                </div>

                <div className="flex justify-center space-x-4 space-x-reverse mt-6">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
                    </button>
                    <button 
                        type="button" 
                        onClick={handleCancel} 
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50"
                    >
                        انصراف
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GeneralSettings;