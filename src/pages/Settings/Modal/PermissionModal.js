import React, { useState, useEffect } from 'react';
import { updateRolePermissions, getPermissions, getRoleDetails } from '../../../api/api';

const PermissionModal = ({ isOpen, toggle, permission }) => {
    const [activeMainTab, setActiveMainTab] = useState('1');
    const [activeSubTab, setActiveSubTab] = useState('1');
    const [permissionsData, setPermissionsData] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [roleDetails, setRoleDetails] = useState(null);

    const toggleMainTab = (tab) => activeMainTab !== tab && setActiveMainTab(tab);
    const toggleSubTab = (tab) => activeSubTab !== tab && setActiveSubTab(tab);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const permissions = await getPermissions();
                setPermissionsData(permissions);

                if (permission?.id) {
                    const roleData = await getRoleDetails(permission.id);
                    setRoleDetails(roleData);

                    if (roleData.permissions) {
                        setSelectedPermissions(roleData.permissions.map(p => p.id));
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [permission]);

    const transformedData = permissionsData.reduce((acc, item) => {
        if (!item.parent_id) {
            acc.mainTabs.push({
                ...item,
                subTabs: permissionsData.filter(st => st.parent_id === item.id)
            });
        }
        return acc;
    }, { mainTabs: [] });

    const togglePermission = (permissionId) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateRolePermissions(permission.id, selectedPermissions);
            toggle();
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setLoading(false);
        }
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
                    className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-auto"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-black">
                            مجوزهای {permission?.role}
                        </h3>
                        <button
                            onClick={toggle}
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-blacktransition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4">
                        {/* Main Tabs */}
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="flex space-x-4 space-x-reverse" aria-label="Tabs">
                                {transformedData.mainTabs.map(mainTab => (
                                    <button
                                        key={mainTab.id}
                                        onClick={() => toggleMainTab(mainTab.id.toString())}
                                        className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors
                                            ${activeMainTab === mainTab.id.toString() 
                                                ? 'bg-blue-600 dark:bg-blue-700 text-white' 
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-black'}`}
                                    >
                                        {mainTab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="mt-4">
                            {transformedData.mainTabs.map(mainTab => (
                                <div
                                    key={mainTab.id}
                                    className={`${activeMainTab === mainTab.id.toString() ? 'block' : 'hidden'}`}
                                >
                                    {mainTab.subTabs.length > 0 ? (
                                        <>
                                            {/* Sub Tabs */}
                                            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                                                <nav className="flex space-x-4 space-x-reverse" aria-label="Sub Tabs">
                                                    {mainTab.subTabs.map(subTab => (
                                                        <button
                                                            key={subTab.id}
                                                            onClick={() => toggleSubTab(subTab.id.toString())}
                                                            className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors
                                                                ${activeSubTab === subTab.id.toString() 
                                                                    ? 'bg-blue-600 dark:bg-blue-700 text-white' 
                                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-black'}`}
                                                        >
                                                            {subTab.name}
                                                        </button>
                                                    ))}
                                                </nav>
                                            </div>

                                            {/* Sub Tab Content */}
                                            {mainTab.subTabs.map(subTab => (
                                                <div
                                                    key={subTab.id}
                                                    className={`${activeSubTab === subTab.id.toString() ? 'block' : 'hidden'} p-4`}
                                                >
                                                    <div className="space-y-2">
                                                        {subTab.permissions?.map(p => (
                                                            <label
                                                                key={p.id}
                                                                className="flex items-center space-x-2 space-x-reverse p-2 
                                                                    hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md 
                                                                    transition-colors cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedPermissions.includes(p.id)}
                                                                    onChange={() => togglePermission(p.id)}
                                                                    className="w-4 h-4 text-blue-600 dark:text-blue-400 
                                                                        border-gray-300 dark:border-gray-600 rounded 
                                                                        focus:ring-blue-500 dark:focus:ring-blue-400"
                                                                />
                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                    {p.name_fa}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="p-4">
                                            <div className="space-y-2">
                                                {mainTab.permissions?.map(p => (
                                                    <label
                                                        key={p.id}
                                                        className="flex items-center space-x-2 space-x-reverse p-2 
                                                            hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md 
                                                            transition-colors cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPermissions.includes(p.id)}
                                                            onChange={() => togglePermission(p.id)}
                                                            className="w-4 h-4 text-blue-600 dark:text-blue-400 
                                                                border-gray-300 dark:border-gray-600 rounded 
                                                                focus:ring-blue-500 dark:focus:ring-blue-400"
                                                        />
                                                        <span className="text-gray-700 dark:text-black">
                                                            {p.name_fa}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
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
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 
                                rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors
                                disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PermissionModal;