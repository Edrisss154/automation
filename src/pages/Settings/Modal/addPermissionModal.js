import React, { useState, useEffect } from 'react';

const AddRoleModal = ({ isOpen, toggle, onSave, role }) => {
    const [name, setName] = useState('');
    const [permissions, setPermissions] = useState([]);

    useEffect(() => {
        if (role) {
            setName(role.name || '');
            setPermissions(role.permissions || []);
        } else {
            setName('');
            setPermissions([]);
        }
    }, [role]);

    const handleSave = () => {
        onSave({ name, permissions });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
                onClick={toggle}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                    className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {role ? 'ویرایش سمت' : 'افزودن سمت'}
                        </h3>
                        <button
                            onClick={toggle}
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4">
                        <div className="mb-4">
                            <label 
                                htmlFor="name" 
                                className="block text-sm font-bold mb-2 text-gray-700 dark:text-black"
                            >
                                نام سمت
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-black">
                                مجوزها
                            </label>
                            <div className="space-y-2">
                                {permissions.map(permission => (
                                    <div
                                        key={permission.id}
                                        className="flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-700 
                                            rounded-md text-gray-700 dark:text-gray-300"
                                    >
                                        {permission.name_fa}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={toggle}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                                bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 
                                transition-colors"
                        >
                            انصراف
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 
                                rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                        >
                            ذخیره
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddRoleModal;
