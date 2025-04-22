import React, { useEffect, useState } from 'react';
import { kartablsearch, deleteLetter, getLetterDetails, updateLetter, updateLetterreferer } from '../../api/api';
import DatePicker from "react-datepicker2";
import moment from 'moment-jalaali';
import DeleteConfirmModal from './Modal/DeleteConfirmModal';
import ReferModal from './Modal/ReferModal';
import InviteModal from './Modal/InviteModal';
import SuccessModal from './Modal/SuccessModal';
import DocumentFlowModal from './Modal/DocumentFlowModal';
import { useNavigate } from 'react-router-dom';
import ViewMessageModal from './Modal/ViewMessageModal';
import {OverlayTrigger, Tooltip} from "react-bootstrap";

const Mymessage = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [searchNumber, setSearchNumber] = useState('');
    const [searchSubject, setSearchSubject] = useState('');
    const [searchSignatoryId, setSearchSignatoryId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const fetchLetters1 = async (page = 1) => {
        try {
            const searchParams = {
                number: searchNumber,
                subject: searchSubject,
                signatory: searchSignatoryId,
                start_date: startDate ? moment(startDate).format('YYYY-MM-DD') : null,
                end_date: endDate ? moment(endDate).format('YYYY-MM-DD') : null
            };

            const response = await kartablsearch(page, searchParams);
            setMessages(response.data);
            setLoading(false);
            setTotalPages(response.total_pages);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLetters1(currentPage);
    }, [currentPage, searchNumber, searchSubject, searchSignatoryId, startDate, endDate]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchLetters1(1);
    };

    const handleReset = () => {
        setSearchNumber('');
        setSearchSubject('');
        setSearchSignatoryId('');
        setStartDate(null);
        setEndDate(null);
        setCurrentPage(1);
        fetchLetters1(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4">
            {error && (
                <div className="fixed bottom-4 left-4 z-50 max-w-xs bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md shadow-lg animate-fade-in-up">
                    <div className="flex justify-between items-center">
                        <span className="text-sm">{error}</span>
                        <button 
                            onClick={() => setError(null)} 
                            className="text-red-700 hover:text-red-900 focus:outline-none ml-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className=" dark:bg-gray-800 rounded-lg shadow-md p-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">کارتابل سرچ</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex flex-col">
                                <label className="text-gray-700 dark:text-white mb-1 text-sm sm:text-base">شماره نامه:</label>
                                <input
                                    type="text"
                                    value={searchNumber}
                                    onChange={(e) => setSearchNumber(e.target.value)}
                                    className="w-full bg-gray-0 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md py-2 px-3 text-gray-700 dark:text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-gray-700 dark:text-white mb-1 text-sm sm:text-base">موضوع:</label>
                                <input
                                    type="text"
                                    value={searchSubject}
                                    onChange={(e) => setSearchSubject(e.target.value)}
                                    className="w-full bg-gray-0 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md py-2 px-3 text-gray-700 dark:text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-gray-700 dark:text-white mb-1 text-sm sm:text-base">امضا کننده:</label>
                                <input
                                    type="text"
                                    value={searchSignatoryId}
                                    onChange={(e) => setSearchSignatoryId(e.target.value)}
                                    className="w-full bg-gray-0 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md py-2 px-3 text-gray-700 dark:text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                    <div className="flex-1">
                                        <label className="text-gray-700 dark:text-white mb-1 text-sm sm:text-base">تاریخ ثبت از:</label>
                                        <div className="flex items-center">
                                            <img src="/picture/icons/Group 3274.svg" alt="انتخاب تاریخ" className="w-6 h-6 sm:w-8 sm:h-8 ml-2" />
                                            <DatePicker
                                                value={startDate}
                                                onChange={setStartDate}
                                                timePicker={false}
                                                isGregorian={false}
                                                className="w-full bg-gray-0 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md py-2 px-3 text-gray-700 dark:text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-gray-700 dark:text-white mb-1 text-sm sm:text-base">تاریخ ثبت تا:</label>
                                        <div className="flex items-center">
                                            <img src="/picture/icons/Group 3274.svg" alt="انتخاب تاریخ" className="w-6 h-6 sm:w-8 sm:h-8 ml-2" />
                                            <DatePicker
                                                value={endDate}
                                                onChange={setEndDate}
                                                timePicker={false}
                                                isGregorian={false}
                                                placeholder="YYYYMMDD"
                                                className="w-full bg-gray-0 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md py-2 px-3 text-gray-700 dark:text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors duration-200 text-sm sm:text-base"
                                >
                                    بازنشانی
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg shadow-md">
                        <table className="w-full border-collapse bg-white dark:bg-gray-800">
                            <thead>
                                <tr className="bg-[#174C72] text-white text-xs sm:text-sm">
                                    <th className="p-2 sm:p-3 text-right">شماره</th>
                                    <th className="p-2 sm:p-3 text-right">موضوع</th>
                                    <th className="p-2 sm:p-3 text-right">تاریخ ثبت</th>
                                    <th className="p-2 sm:p-3 text-right">امضا کننده</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.map((message, index) => (
                                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150 text-xs sm:text-sm">
                                        <td className="p-2 sm:p-3">{message.number}</td>
                                        <td className="p-2 sm:p-3 max-w-[120px] sm:max-w-[200px] truncate">
                                            <OverlayTrigger
                                                overlay={<Tooltip>{`${message.subject} `}</Tooltip>}
                                            >
                                                <div>
                                                    {message.subject}
                                                </div>
                                            </OverlayTrigger>
                                        </td>
                                        <td className="p-2 sm:p-3">{moment(message.registered_at).format('jYYYY/jMM/jDD')}</td>
                                        <td className="p-2 sm:p-3">{message.signatory.first_name} {message.signatory.last_name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 bg-[#174C72] text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-[#123856] transition-colors duration-200 w-full sm:w-auto"
                        >
                            صفحه اول
                        </button>
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 bg-[#174C72] text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-[#123856] transition-colors duration-200 w-full sm:w-auto"
                        >
                            صفحه قبل
                        </button>
                        <span className="text-gray-700 dark:text-white">صفحه {currentPage} از {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 bg-[#174C72] text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-[#123856] transition-colors duration-200 w-full sm:w-auto"
                        >
                            صفحه بعد
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 bg-[#174C72] text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-[#123856] transition-colors duration-200 w-full sm:w-auto"
                        >
                            صفحه آخر
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mymessage;