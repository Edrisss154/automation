import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { updateContact, getRoles } from '../../../api/api';

const EditUserModal = ({ isOpen, toggle, userData, handleSave }) => {
    const [formData, setFormData] = useState({
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        mobile: userData.mobile || '',
        email: userData.email || '',
        address: userData.address || '',
        role_ids: userData.roles ? userData.roles.map(role => ({ value: role.id, label: role.name })) : []
    });
    const [signature, setSignature] = useState(null);
    const [signatureUrl, setSignatureUrl] = useState('');
    const [profile, setProfile] = useState(null);
    const [profileUrl, setProfileUrl] = useState('');
    const [roleOptions, setRoleOptions] = useState([]);

    useEffect(() => {
        setFormData({
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            mobile: userData.mobile || '',
            email: userData.email || '',
            address: userData.address || '',
            role_ids: userData.roles ? userData.roles.map(role => ({ value: role.id, label: role.name })) : []
        });
        setSignatureUrl(userData.signature || '');
        setProfileUrl(userData.profile ? `https://automationapi.satia.co/storage/${userData.profile}` : '');

        const fetchRoles = async () => {
            try {
                const roles = await getRoles();
                setRoleOptions(roles.data.map(role => ({ value: role.id, label: role.name })));
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };

        fetchRoles();
    }, [userData]);

    const handleChangeLocal = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRoleChange = (selectedOptions) => {
        setFormData({ ...formData, role_ids: selectedOptions });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'signature') {
            setSignature(files[0]);
        } else if (name === 'profile') {
            setProfile(files[0]);
        }
    };

    const handleSaveClick = async () => {
        const formPayload = new FormData();

        formPayload.append('mobile', formData.mobile);
        formPayload.append('first_name', formData.firstName);
        formPayload.append('last_name', formData.lastName);
        formPayload.append('address', formData.address);
        formPayload.append('email', formData.email);
        formPayload.append('type', 'natural');
        formPayload.append('is_active', '1');

        formData.role_ids.forEach(role => {
            formPayload.append('role_ids[]', role.value);
        });

        if (signature) {
            formPayload.append('signature', signature);
        }
        if (profile) {
            formPayload.append('profile', profile);
        }

        try {
            const response = await updateContact(userData.id, formPayload);
            console.log("Response from server:", response.data);
            handleSave();
            toggle();
        } catch (err) {
            console.error("Error from server:", err.response?.data || err.message);
            alert("خطا در ویرایش کاربر. لطفاً دوباره تلاش کنید.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={toggle}></div>

                {/* Modal */}
                <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            ویرایش کاربر
                        </h3>
                        <button
                            onClick={toggle}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <span className="sr-only">بستن</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6 bg-white dark:bg-gray-900">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="mobile" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                    شماره موبایل
                                </label>
                                <input
                                    type="text"
                                    name="mobile"
                                    id="mobile"
                                    value={formData.mobile}
                                    onChange={handleChangeLocal}
                                    className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="role_ids" className="block text-sm font-bold text-black dark:text-black mb-2">
                                    عنوان سمت
                                </label>
                                <Select
                                    name="role_ids"
                                    id="role_ids"
                                    value={formData.role_ids}
                                    onChange={handleRoleChange}
                                    options={roleOptions}
                                    isMulti
                                    className="mt-1"
                                    classNamePrefix="select"
                                    theme={(theme) => ({
                                        ...theme,
                                        colors: {
                                            ...theme.colors,
                                            primary: '#3B82F6',
                                            primary25: '#DBEAFE',
                                            neutral0: 'white',
                                            neutral80: '#111827',
                                            neutral10: '#F3F4F6',
                                            neutral20: '#E5E7EB',
                                            neutral30: '#D1D5DB',
                                            neutral40: '#9CA3AF',
                                            neutral50: '#6B7280',
                                            neutral60: '#4B5563',
                                            neutral70: '#374151',
                                        },
                                    })}
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            padding: '4px',
                                            borderRadius: '0.5rem',
                                            minHeight: '45px',
                                            backgroundColor: 'white',
                                            borderColor: document.documentElement.classList.contains('dark') ? '#4B5563' : '#E5E7EB',
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            backgroundColor: 'white',
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isSelected 
                                                ? document.documentElement.classList.contains('dark') ? '#1F2937' : '#3B82F6'
                                                : state.isFocused
                                                ? '#F3F4F6'
                                                : 'white',
                                            color: state.isSelected
                                                ? 'white'
                                                : '#111827',
                                            ':active': {
                                                backgroundColor: state.isSelected
                                                    ? document.documentElement.classList.contains('dark') ? '#1F2937' : '#3B82F6'
                                                    : '#F3F4F6'
                                            }
                                        }),
                                        multiValue: (base) => ({
                                            ...base,
                                            backgroundColor: document.documentElement.classList.contains('dark') ? '#1F2937' : '#F3F4F6',
                                            borderRadius: '0.375rem',
                                        }),
                                        multiValueLabel: (base) => ({
                                            ...base,
                                            color: document.documentElement.classList.contains('dark') ? '#F9FAFB' : '#111827',
                                            padding: '2px 6px',
                                        }),
                                        multiValueRemove: (base) => ({
                                            ...base,
                                            color: document.documentElement.classList.contains('dark') ? '#F9FAFB' : '#4B5563',
                                            ':hover': {
                                                backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB',
                                                color: document.documentElement.classList.contains('dark') ? '#F9FAFB' : '#111827',
                                            },
                                            borderRadius: '0 0.375rem 0.375rem 0',
                                        }),
                                    }}
                                />
                            </div>

                            <div>
                                <label htmlFor="firstName" className="block text-sm font-bold text-black dark:text-black mb-2">
                                    نام
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={handleChangeLocal}
                                    className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                    نام خانوادگی
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={handleChangeLocal}
                                    className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="address" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                    آدرس
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    id="address"
                                    value={formData.address}
                                    onChange={handleChangeLocal}
                                    className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                    ایمیل
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChangeLocal}
                                    className="block w-full px-4 py-3 text-gray-900 dark:text-black border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="signature" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                    افزودن امضاء الکترونیک
                                </label>
                                <input
                                    type="file"
                                    name="signature"
                                    id="signature"
                                    onChange={handleFileChange}
                                    className="block w-full px-4 py-3 text-gray-700 dark:text-black
                                        file:ml-4 file:py-2.5 file:px-4
                                        file:rounded-lg file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        dark:file:bg-blue-900/50 dark:file:text-blue-200
                                        hover:file:bg-blue-100 dark:hover:file:bg-blue-900
                                        focus:outline-none"
                                />
                                {signatureUrl && (
                                    <div className="flex justify-center mt-4">
                                        <img src={signatureUrl} alt="Signature" className="max-w-[200px] h-auto rounded-lg shadow-sm" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="profile" className="block text-sm font-bold text-gray-900 dark:text-black mb-2">
                                    عکس پروفایل
                                </label>
                                <input
                                    type="file"
                                    name="profile"
                                    id="profile"
                                    accept="image/jpeg,image/png"
                                    onChange={handleFileChange}
                                    className="block w-full px-4 py-3 text-gray-700 dark:text-black
                                        file:ml-4 file:py-2.5 file:px-4
                                        file:rounded-lg file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        dark:file:bg-blue-900/50 dark:file:text-blue-200
                                        hover:file:bg-blue-100 dark:hover:file:bg-blue-900
                                        focus:outline-none"
                                />
                                {profileUrl && (
                                    <div className="flex justify-center mt-4">
                                        <img src={profileUrl} alt="Profile" className="max-w-[200px] h-auto rounded-lg shadow-sm" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        <button
                            type="button"
                            onClick={toggle}
                            className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-black bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            لغو
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveClick}
                            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            ذخیره
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;