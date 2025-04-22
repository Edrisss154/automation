import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import SelectPersonTypeModal from './Modal/SelectPersonTypeModal';
import RealPersonModal from './Modal/RealPersonModal';
import LegalPersonModal from './Modal/LegalPersonModal';
import EditLegalPersonModal from './Modal/LegalPersonModaledit';
import EditRealPersonModal from './Modal/RealPersonModaledit';
import SignatureModal from './Modal/SignatureModal';
import { getContactById, deleteUser, getContact } from '../../api/api';

const UserSettings = () => {
    const [users, setUsers] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [selectPersonModalOpen, setSelectPersonModalOpen] = useState(false);
    const [realPersonModalOpen, setRealPersonModalOpen] = useState(false);
    const [legalPersonModalOpen, setLegalPersonModalOpen] = useState(false);
    const [editLegalPersonModalOpen, setEditLegalPersonModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ firstName: "", lastName: "", mobile: "", email: "", roles: [] });
    const [personType, setPersonType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [signatureModalOpen, setSignatureModalOpen] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [editRealPersonModalOpen, setEditRealPersonModalOpen] = useState(false);

    const translateType = (type) => {
        return type === 'natural' ? 'حقیقی' : type === 'legal' ? 'حقوقی' : type;
    };

    const renderStatus = (status) => {
        return status === 1 ? (
            <span className="text-green-600 dark:text-green-400">فعال</span>
        ) : (
            <span className="text-red-600 dark:text-red-400">غیرفعال</span>
        );
    };

    const filteredUsers = users.filter(user => {
        if (filterType === 'all') return true;
        return user.type === (filterType === 'natural' ? 'natural' : 'legal');
    });

    const fetchUsers = async (page = 1, query = '') => {
        setLoading(true);
        try {
            const response = await getContact(1, page, query);
            if (response && response.data && Array.isArray(response.data)) {
                setUsers(response.data);
                setTotalPages(response.last_page || 1);
            } else {
                console.error("Expected an array but got:", response.data);
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
            setError(error.message);
        }
        setLoading(false);
    };

    const handleSaveRealPerson = async (updatedUser) => {
        try {
            const updatedUsers = users.map(user =>
                user.id === updatedUser.id ? updatedUser : user
            );
            setUsers(updatedUsers);
            setEditRealPersonModalOpen(false);
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const handleSaveLegalPerson = (event) => {
        event.preventDefault();
        setUsers([...users, newUser]);
        setNewUser({ companyName: "", registrationNumber: "", email: "", mobile: "", address: "", description: "" });
        setLegalPersonModalOpen(false);
        setSelectedIndex(null);
    };

    const handleEdit = async () => {
        if (selectedIndex !== null) {
            const userId = users[selectedIndex].id;
            try {
                const userData = await getContactById(userId);
                setNewUser(userData);
                if (userData.type === 'natural') {
                    setEditRealPersonModalOpen(true);
                } else if (userData.type === 'legal') {
                    setEditLegalPersonModalOpen(true);
                }
            } catch (error) {
                console.error('Error fetching user by id:', error);
            }
        } else {
            alert("لطفاً یک سطر را انتخاب کنید.");
        }
    };

    useEffect(() => {
        fetchUsers(currentPage, searchQuery);
    }, [currentPage, searchQuery]);

    const debouncedFetchUsers = useCallback(debounce(fetchUsers, 300), []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
        debouncedFetchUsers(1, e.target.value);
        setSelectedIndex(null);
    };

    const handleDelete = async () => {
        if (selectedIndex !== null) {
            const userId = users[selectedIndex].id;
            try {
                await deleteUser(userId);
                const newUsers = [...users];
                newUsers.splice(selectedIndex, 1);
                setUsers(newUsers);
                setSelectedIndex(null);
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('خطا در حذف کاربر. لطفاً دوباره تلاش کنید.');
            }
        } else {
            alert("لطفاً یک سطر را انتخاب کنید.");
        }
    };

    const handleAddUser = () => {
        setNewUser({});
        setSelectPersonModalOpen(true);
    };

    const selectPersonType = (type) => {
        setPersonType(type);
        setSelectPersonModalOpen(false);
        if (type === 'حقیقی') {
            setRealPersonModalOpen(true);
        } else {
            setLegalPersonModalOpen(true);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setSelectedIndex(null);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto p-5 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 direction-rtl">
            {/* Header */}
            <div className="w-full mt-8 flex justify-center items-center mb-6">
                <div className="bg-gray-200 dark:bg-gray-700 py-4 px-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">مخاطبین مکاتبات</h2>
                </div>
            </div>

            {/* Top Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                {/* Add User Button */}
                <button 
                    onClick={handleAddUser}
                    className="flex items-center space-x-2 space-x-reverse bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                >
                    <span>افزودن کاربر</span>
                    <img src="/picture/icons/Group3247.svg" alt="Add User" className="w-6 h-6"/>
                </button>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="جستجوی کاربران..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full sm:w-64 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
                    />
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setFilterType('natural')}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                filterType === 'natural' 
                                ? 'bg-blue-600 dark:bg-blue-700 text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                            }`}
                        >
                            حقیقی
                        </button>
                        <button 
                            onClick={() => setFilterType('legal')}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                filterType === 'legal' 
                                ? 'bg-blue-600 dark:bg-blue-700 text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                            }`}
                        >
                            حقوقی
                        </button>
                        <button 
                            onClick={() => setFilterType('all')}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                filterType === 'all' 
                                ? 'bg-blue-600 dark:bg-blue-700 text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                            }`}
                        >
                            همه
                        </button>
                    </div>
                </div>
            </div>

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
                                    <th className="p-3 text-right">کد</th>
                                    <th className="p-3 text-right">نوع</th>
                                    <th className="p-3 text-right">شخص</th>
                                    <th className="p-3 text-right hidden sm:table-cell">گروه</th>
                                    <th className="p-3 text-right hidden md:table-cell">وضعیت</th>
                                    <th className="p-3 text-right hidden lg:table-cell">تاریخ ایجاد</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, index) => (
                                    <tr 
                                        key={index}
                                        onClick={() => setSelectedIndex(index)}
                                        onDoubleClick={handleEdit}
                                        className={`border-b border-gray-200 dark:border-gray-600 cursor-pointer
                                            ${selectedIndex === index ? 'bg-blue-50 dark:bg-blue-900' : 'hover:bg-gray-50 dark:hover:bg-gray-600'}
                                            ${selectedIndex === index ? 'text-blue-900 dark:text-blue-200' : 'text-black dark:text-gray-200'}`}
                                    >
                                        <td className="p-3">{user.id}</td>
                                        <td className="p-3">{translateType(user.type)}</td>
                                        <td className="p-3">{user.first_name} {user.last_name}</td>
                                        <td className="p-3 hidden sm:table-cell">{user.roles.map(role => role.name).join(', ')}</td>
                                        <td className="p-3 hidden md:table-cell">{renderStatus(user.is_active)}</td>
                                        <td className="p-3 hidden lg:table-cell">{user.created_at}</td>
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

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-4 space-x-reverse mt-6">
                        <button 
                            onClick={handleDelete}
                            className="px-6 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
                        >
                            حذف
                        </button>
                        <button 
                            onClick={handleEdit}
                            className="px-6 py-2 bg-yellow-600 dark:bg-yellow-700 text-white rounded-md hover:bg-yellow-700 dark:hover:bg-yellow-800 transition-colors"
                        >
                            ویرایش
                        </button>
                    </div>
                </>
            )}

            {/* Modals */}
            <SelectPersonTypeModal
                isOpen={selectPersonModalOpen}
                toggle={() => setSelectPersonModalOpen(!selectPersonModalOpen)}
                selectPersonType={selectPersonType}
            />
            <RealPersonModal
                isOpen={realPersonModalOpen}
                toggle={() => {
                    setRealPersonModalOpen(false);
                    setNewUser({});
                }}
                userData={newUser}
                handleChange={handleChange}
                handleSave={handleSaveRealPerson}
                isEditMode={selectedIndex !== null}
                userId={selectedIndex !== null ? users[selectedIndex].id : null}
                type="natural"
            />
            <LegalPersonModal
                isOpen={legalPersonModalOpen}
                toggle={() => {
                    setLegalPersonModalOpen(false);
                    setNewUser({});
                }}
                userData={newUser}
                handleChange={handleChange}
                handleSave={handleSaveLegalPerson}
                isEditMode={selectedIndex !== null}
                userId={selectedIndex !== null ? users[selectedIndex].id : null}
                type="legal"
            />
            <EditLegalPersonModal
                isOpen={editLegalPersonModalOpen}
                toggle={() => {
                    setEditLegalPersonModalOpen(false);
                    setNewUser({});
                }}
                userData={newUser}
                handleSave={handleSaveLegalPerson}
                userId={users[selectedIndex]?.id}
            />
            <EditRealPersonModal
                isOpen={editRealPersonModalOpen}
                toggle={() => {
                    setEditRealPersonModalOpen(false);
                    setNewUser({});
                }}
                userData={newUser}
                handleSave={handleSaveRealPerson}
                userId={selectedIndex !== null ? users[selectedIndex].id : null}
            />
            <SignatureModal
                isOpen={signatureModalOpen}
                toggle={() => setSignatureModalOpen(!signatureModalOpen)}
            />
        </div>
    );
};

export default UserSettings;
