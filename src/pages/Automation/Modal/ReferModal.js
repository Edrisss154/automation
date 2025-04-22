import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import SuccessModal from "./SuccessModal";

// اضافه کردن کامپوننت CustomOption برای نمایش عکس پروفایل
const CustomOption = ({ label, profile }) => (
    <div className="flex items-center">
        <img
            src={profile ? `${profile}` : "/picture/icons/profile.jpg"}
            alt={label}
            className="w-6 h-6 rounded-full ml-2"
        />
        <span className="text-gray-900">{label}</span>
    </div>
);

const ReferModal = ({ isOpen, toggle, letterType, carbonCopy, handleAddRefer, receiver, setReceiver, direction, setDirection, margin, setMargin, privateNote, setPrivateNote, referData, selectedRole, isAdded, setShowInviteModal, setIsAdded, onSubmitRefer, selectedMessageId, userRoles }) => {
    const [users, setUsers] = useState([]);
    const [directions, setDirections] = useState([]);
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const currentUserId = localStorage.getItem('userId');

    const resetData = () => {
        setReceiver('');
        setDirection('');
        setMargin('');
        setPrivateNote('');
        setIsAdded(false);
        setUsers([]);
        setDirections([]);
    };

    useEffect(() => {
        if (isOpen) {
            resetData();
            
            const isContact = letterType === "internal" ? 0 : null;

            axios.get('https://automationapi.satia.co/api/users', {
                params: {
                    token: localStorage.getItem('token'),
                    is_contact: isContact
                }
            })
                .then(response => {
                    if (response.data && Array.isArray(response.data.data)) {
                        const filteredUsers = response.data.data.filter(user => user.id !== parseInt(currentUserId));
                        setUsers(filteredUsers);
                    } else {
                        setUsers([]);
                        console.error("Unexpected response format:", response.data);
                    }
                })
                .catch(error => {
                    console.error("Error fetching users:", error);
                });

            axios.get('https://automationapi.satia.co/api/letter-reasons', {
                params: {
                    token: localStorage.getItem('token'),
                }
            })
                .then(response => {
                    if (response.data && Array.isArray(response.data)) {
                        setDirections(response.data);
                    } else {
                        setDirections([]);
                        console.error("Unexpected response format:", response.data);
                    }
                })
                .catch(error => {
                    console.error("Error fetching directions:", error);
                });
        }
    }, [isOpen, letterType, currentUserId]);

    const handleSubmit = async () => {
        if (referData.length === 0) {
            alert("لطفاً حداقل یک ارجاع اضافه کنید.");
            return;
        }
        if (typeof onSubmitRefer === 'function') {
            await onSubmitRefer(referData, selectedMessageId, carbonCopy);
            setSuccessMessage("نامه با موفقیت ثبت شد!");
            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(true);
                navigate('/automation');
            }, 2000);
        } else {
            console.error("onSubmitRefer is not a function");
        }
        toggle();
    };

    // تغییر userOptions برای اضافه کردن عکس پروفایل
    const userOptions = users.map(user => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name || ''}`.trim(),
        profile: user.profile
    }));

    const directionOptions = directions.map(dir => ({
        value: dir.id,
        label: dir.title
    }));

    const customSelectStyles = {
        control: (provided) => ({
            ...provided,
            backgroundColor: 'white',
            borderColor: '#E5E7EB',
            '&:hover': {
                borderColor: '#2563EB'
            },
            boxShadow: 'none',
            '&:focus-within': {
                borderColor: '#2563EB',
                boxShadow: '0 0 0 1px #2563EB'
            }
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            color: '#111827'
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#EFF6FF' : 'white',
            color: state.isSelected ? 'white' : '#111827',
            '&:hover': {
                backgroundColor: state.isSelected ? '#2563EB' : '#EFF6FF',
                color: state.isSelected ? 'white' : '#111827'
            }
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#111827'
        }),
        input: (provided) => ({
            ...provided,
            color: '#111827'
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#6B7280'
        }),
        menuList: (provided) => ({
            ...provided,
            color: '#111827'
        })
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-right align-middle transition-all transform bg-white rounded-lg shadow-xl">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 bg-[rgba(23,76,114,1)] text-white">
                                <h3 className="text-lg font-semibold">ارجاع پیام</h3>
                                <button onClick={() => {
                                    resetData();
                                    toggle();
                                }} className="text-white hover:text-gray-200 transition-colors">
                                    &times;
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-4">
                                <div className="bg-white rounded-lg">
                                    <div className="text-center mb-6">
                                        <h1 className="text-2xl font-bold text-gray-800">سامانه نامه جی</h1>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label htmlFor="receiver" className="block text-sm font-medium text-gray-700">
                                                    گیرنده:
                                                </label>
                                                <Select
                                                    id="receiver"
                                                    name="receiver"
                                                    options={userOptions}
                                                    value={userOptions.find(option => option.value === receiver)}
                                                    onChange={(selectedOption) => setReceiver(selectedOption ? selectedOption.value : '')}
                                                    placeholder="انتخاب گیرنده"
                                                    isSearchable
                                                    noOptionsMessage={() => "نتیجه‌ای یافت نشد"}
                                                    formatOptionLabel={({ label, profile }) => (
                                                        <CustomOption label={label} profile={profile} />
                                                    )}
                                                    styles={customSelectStyles}
                                                    className="text-right"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="direction" className="block text-sm font-medium text-gray-700">
                                                    جهت:
                                                </label>
                                                <Select
                                                    id="direction"
                                                    name="direction"
                                                    options={directionOptions}
                                                    value={directionOptions.find(option => option.value === direction)}
                                                    onChange={(selectedOption) => setDirection(selectedOption ? selectedOption.value : '')}
                                                    placeholder="انتخاب جهت"
                                                    isSearchable
                                                    noOptionsMessage={() => "نتیجه‌ای یافت نشد"}
                                                    styles={customSelectStyles}
                                                    className="text-right"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="margin" className="block text-sm font-medium text-gray-700">
                                                    هامش:
                                                </label>
                                                <input
                                                    type="text"
                                                    id="margin"
                                                    name="margin"
                                                    value={margin}
                                                    onChange={(e) => setMargin(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="private-note" className="block text-sm font-medium text-gray-700">
                                                    یادداشت خصوصی:
                                                </label>
                                                <input
                                                    type="text"
                                                    id="private-note"
                                                    name="private-note"
                                                    value={privateNote}
                                                    onChange={(e) => setPrivateNote(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300  text-gray-700rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-center">
                                            <button
                                                type="button"
                                                onClick={handleAddRefer}
                                                disabled={isAdded}
                                                className="px-4 py-2 bg-[rgba(23,76,114,1)] text-white rounded-md hover:bg-[rgba(18,60,90,1)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                اضافه کردن
                                            </button>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-[rgba(23,76,114,1)]">
                                                    <tr>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">نام و نام خانوادگی</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">سمت</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">جهت</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">هامش</th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">یادداشت خصوصی</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {referData.map((data, index) => {
                                                        const user = users.find(user => user.id === parseInt(data.receiver));
                                                        const direction = directions.find(dir => dir.id === parseInt(data.direction));
                                                        const role = userRoles.find(role => role.id === parseInt(data.selectedRole));
                                                        return (
                                                            <tr key={index} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user ? `${user.first_name} ${user.last_name || ''}`.trim() : ''}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{role ? role.name : 'نامشخص'}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{direction ? direction.title : ''}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.margin}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.privateNote}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex justify-center space-x-4 space-x-reverse">
                                            <button
                                                type="button"
                                                onClick={handleSubmit}
                                                className="px-4 py-2 bg-[rgba(23,76,114,1)] text-white rounded-md hover:bg-[rgba(18,60,90,1)] transition-colors"
                                            >
                                                ارجاع
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    toggle();
                                                    resetData();
                                                    setIsAdded(false);
                                                }}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                                            >
                                                انصراف
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <SuccessModal
                isOpen={showSuccessModal}
                toggle={() => setShowSuccessModal(false)}
                message={successMessage}
            />
        </>
    );
};

export default ReferModal;