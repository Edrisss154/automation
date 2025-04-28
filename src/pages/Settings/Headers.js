import React, { useState, useEffect } from 'react';
import { Button, Table } from 'reactstrap';
import { getLetterTemplates, getLetterTemplateById, updateLetterTemplate, deleteLetterTemplate } from '../../api/api';
import AddHeaderModal from './Modal/AddHeaderModal';
import EditHeaderModal from './Modal/EditHeaderModal';

const HeaderSettings = () => {
    const [headers, setHeaders] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentHeader, setCurrentHeader] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedRole, setSelectedRole] = useState(localStorage.getItem('userRole') || '');
    const userRoles = JSON.parse(localStorage.getItem('roles')) || [];
    const userFullName = localStorage.getItem('userFullName') || 'نام کاربر';
    const rolesWithUserName = [`نام کامل: ${userFullName}`, ...userRoles];
    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
        localStorage.setItem('userRole', e.target.value);
    };
    const fetchHeaders = async (page = 1) => {
        setLoading(true);
        try {
            const response = await getLetterTemplates(page);

            if (response && response.data && Array.isArray(response.data)) {
                setHeaders(response.data);
                setTotalPages(response.last_page || 1);
            } else {
                console.error("Expected an array but got:", response.data);
                setHeaders([]);
            }
        } catch (error) {
            console.error('Error fetching headers:', error);
            setHeaders([]);
            setError(error.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchHeaders(currentPage);
    }, [currentPage]);

    const handleDelete = async () => {
        if (selectedIndex !== null) {
            const headerId = headers[selectedIndex].id;
            try {
                await deleteLetterTemplate(headerId);
                const newHeaders = [...headers];
                newHeaders.splice(selectedIndex, 1);
                setHeaders(newHeaders);
                setSelectedIndex(null);
            } catch (error) {
                console.error('Error deleting header:', error);
            }
        } else {
            alert("لطفاً یک سطر را انتخاب کنید.");
        }
    };

    const handleEdit = async () => {
        if (selectedIndex !== null) {
            const headerId = headers[selectedIndex].id;
            try {
                const headerData = await getLetterTemplateById(headerId);
                setCurrentHeader(headerData);
                setEditModalOpen(true);
            } catch (error) {
                console.error('Error fetching header data:', error);
            }
        } else {
            alert("لطفاً یک سطر را انتخاب کنید.");
        }
    };

    const handleRowClick = (index) => {
        setSelectedIndex(index);
    };

    const handleAddHeader = (newHeader) => {
        setHeaders([...headers, newHeader]);
    };

    const handleUpdateHeader = (updatedHeader) => {
        const updatedHeaders = headers.map((header) =>
            header.id === updatedHeader.id ? updatedHeader : header
        );
        setHeaders(updatedHeaders);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="max-w-[800px] mx-auto p-5 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 direction-rtl">
            {/* Header */}
            <div className="w-full mt-8 flex justify-center items-center mb-6">
                <div className="bg-gray-200 dark:bg-gray-700 py-4 px-8 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">تنظیمات سربرگ‌ها</h2>
                </div>
            </div>

            {/* Add Header Button */}
            <div className="flex justify-start mb-6">
                <button 
                    onClick={() => setModalOpen(true)}
                    className="flex items-center space-x-2 space-x-reverse bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                >
                    <span>اضافه کردن سربرگ</span>
                    <img src="/picture/icons/Group3247.svg" alt="Add Header" className="w-6 h-6"/>
                </button>
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
                                    <th className="p-3 text-right">عنوان</th>
                                    <th className="p-3 text-right">نوع قالب</th>
                                    <th className="p-3 text-right">زمان ایجاد</th>
                                </tr>
                            </thead>
                            <tbody>
                                {headers.map((header, index) => (
                                    <tr 
                                        key={header.id} 
                                        onClick={() => handleRowClick(index)} 
                                        onDoubleClick={handleEdit}
                                        className={`border-b border-gray-200 dark:border-gray-600 cursor-pointer
                                            ${selectedIndex === index ? 'bg-blue-50 dark:bg-blue-900' : 'hover:bg-gray-50 dark:hover:bg-gray-600'}
                                            ${selectedIndex === index ? 'text-blue-900 dark:text-blue-200' : 'text-black dark:text-gray-200'}`}
                                    >
                                        <td className="p-3">{header.title}</td>
                                        <td className="p-3">{header.type}</td>
                                        <td className="p-3">{header.j_created_at}</td>
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

            {/* Modals */}
            <AddHeaderModal isOpen={modalOpen} toggle={() => setModalOpen(false)} addHeader={handleAddHeader}/>
            {currentHeader && (
                <EditHeaderModal
                    isOpen={editModalOpen}
                    toggle={() => setEditModalOpen(false)}
                    headerData={currentHeader}
                    updateHeader={handleUpdateHeader}
                />
            )}
        </div>
    );
};

export default HeaderSettings;
