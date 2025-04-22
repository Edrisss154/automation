import React, { useState, useEffect } from 'react';
import PermissionModal from './Modal/PermissionModal';
import AddRoleModal from './Modal/addPermissionModal';
import { getRoles, getPermissions, getRoleDetails, addRole, updateRole, deleteRole, updateRolePermissions } from '../../api/api';

const PermissionSettings = () => {
    const [permissions, setPermissions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [permissionModalOpen, setPermissionModalOpen] = useState(false);
    const [addRoleModalOpen, setAddRoleModalOpen] = useState(false);
    const [newPermission, setNewPermission] = useState({ name: "", createdAt: "" });
    const [selectedPermission, setSelectedPermission] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [permissionGroups, setPermissionGroups] = useState([]);
    const [deleteError, setDeleteError] = useState(null);

    const fetchPermissions = async (page = 1) => {
        setLoading(true);
        try {
            const response = await getRoles(20, '');
            console.log("Fetched Roles:", response);

            if (response && response.data && Array.isArray(response.data)) {
                setPermissions(response.data);
                setTotalPages(response.last_page || 1);
            } else {
                console.error("Expected an array but got:", response.data);
                setPermissions([]);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            setPermissions([]);
            setError(error.message);
        }
        setLoading(false);
    };

    const fetchPermissionGroups = async () => {
        try {
            const response = await getPermissions();
            console.log("Fetched Permission Groups:", response);
            setPermissionGroups(response.data);
        } catch (error) {
            console.error('Error fetching permission groups:', error);
        }
    };

    useEffect(() => {
        fetchPermissions(currentPage);
        fetchPermissionGroups();
    }, [currentPage]);

    const handleDelete = async (index) => {
        const roleId = permissions[index].id;
        try {
            const response = await deleteRole(roleId);
            if (!response.success) {
                setDeleteError(response.message);
            } else {
                setDeleteError(null);
                fetchPermissions(currentPage);
            }
        } catch (error) {
            setDeleteError('خطایی رخ داده است.(کاربرانی با این سمت در سامانه وجود دارند.)');
            console.error('Error deleting role:', error);
        }
    };

    const handleEdit = async (index) => {
        const roleId = permissions[index].id;
        try {
            const roleDetails = await getRoleDetails(roleId);
            setSelectedPermission({
                ...roleDetails,
                permissions: roleDetails.permissions || []
            });
            setAddRoleModalOpen(true);
        } catch (error) {
            console.error('Error fetching role details:', error);
        }
    };

    const handleAddNewRole = () => {
        setSelectedPermission(null);
        setAddRoleModalOpen(true);
    };

    const handlePermissions = (index) => {
        setSelectedPermission(permissions[index]);
        setPermissionModalOpen(true);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleSavePermissions = async (roleId, permissions) => {
        try {
            await updateRolePermissions(roleId, permissions);
            fetchPermissions(currentPage);
        } catch (error) {
            console.error('Error updating role permissions:', error);
        }
    };

    const handleSavePermission = async (role) => {
        if (selectedPermission) {
            await updateRole(selectedPermission.id, role.name);
        } else {
            await addRole(role.name);
        }
        fetchPermissions(currentPage);
        setAddRoleModalOpen(false);
    };

    return (
        <div className="max-w-[1200px] mx-auto p-5 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 direction-rtl">
            {/* Header */}
            <div className="w-full mt-8 flex justify-center items-center mb-6">
                <div className="bg-gray-200 dark:bg-gray-700 py-4 px-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">تنظیمات مجوزها</h2>
                </div>
            </div>

            {/* Add Role Button */}
            <div className="flex justify-start mb-6">
                <button 
                    onClick={handleAddNewRole}
                    className="flex items-center space-x-2 space-x-reverse bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                >
                    <span>افزودن سمت</span>
                    <img src="/picture/icons/Group3247.svg" alt="Add Permission" className="w-6 h-6"/>
                </button>
            </div>

            {/* Error Alert */}
            {deleteError && (
                <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
                    {deleteError}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <p className="text-gray-600 dark:text-gray-300">در حال بارگذاری...</p>
                </div>
            ) : error ? (
                <div className="flex justify-center items-center py-8">
                    <p className="text-red-600 dark:text-red-400">خطا در بارگذاری اطلاعات: {error}</p>
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
                            <thead>
                                <tr className="bg-blue-900 dark:bg-blue-800 text-white">
                                    <th className="p-3 text-right">نام سمت</th>
                                    <th className="p-3 text-right">مجوز ها</th>
                                    <th className="p-3 text-right">ویرایش</th>
                                    <th className="p-3 text-right">حذف</th>
                                </tr>
                            </thead>
                            <tbody>
                                {permissions.map((permission, index) => (
                                    <tr 
                                        key={index}
                                        className={`border-b border-gray-200 dark:border-gray-600
                                            ${selectedIndex === index ? 'bg-blue-50 dark:bg-blue-900' : 'hover:bg-gray-50 dark:hover:bg-gray-600'}
                                            ${selectedIndex === index ? 'text-blue-900 dark:text-blue-200' : 'text-black dark:text-gray-200'}`}
                                    >
                                        <td className="p-3">{permission.name}</td>
                                        <td className="p-3">
                                            <button 
                                                onClick={() => handlePermissions(index)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                                            >
                                                <img src="/picture/icons/setting/Group%203344.svg" alt="Permissions Icon" className="w-6 h-6"/>
                                            </button>
                                        </td>
                                        <td className="p-3">
                                            <button 
                                                onClick={() => handleEdit(index)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                                            >
                                                <img src="/picture/icons/setting/Group 3449.svg" alt="Edit Icon" className="w-6 h-6"/>
                                            </button>
                                        </td>
                                        <td className="p-3">
                                            <button 
                                                onClick={() => handleDelete(index)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                                            >
                                                <img src="/picture/icons/setting/Group 3448.svg" alt="Delete Icon" className="w-6 h-6"/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center space-x-4 space-x-reverse mt-6">
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                            &laquo; صفحه قبل
                        </button>
                        <span className="text-gray-700 dark:text-gray-200">
                            {currentPage} از {totalPages}
                        </span>
                        <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                            صفحه بعد &raquo;
                        </button>
                    </div>
                </>
            )}

            {/* Modals */}
            <PermissionModal
                isOpen={permissionModalOpen}
                toggle={() => setPermissionModalOpen(!permissionModalOpen)}
                permission={selectedPermission}
                permissionGroups={permissionGroups}
                onSave={handleSavePermissions}
            />

            <AddRoleModal
                isOpen={addRoleModalOpen}
                toggle={() => setAddRoleModalOpen(!addRoleModalOpen)}
                role={selectedPermission}
                onSave={handleSavePermission}
            />
        </div>
    );
};

export default PermissionSettings;
