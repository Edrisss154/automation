import React, { useEffect, useState, useRef } from 'react';
import { getLettersreceived, deleteLetter, referLetter, kartablsearchmymessage, getUserById } from '../../api/api';
import DatePicker from "react-datepicker2";
import moment from 'moment-jalaali';
import DeleteConfirmModal from './Modal/DeleteConfirmModal';
import ReferModal from './Modal/ReferModal';
import InviteModal from './Modal/InviteModal';
import SuccessModal from './Modal/SuccessModal';
import DocumentFlowModal from './Modal/DocumentFlowModalinbox';
import DocumentFlowModal1 from './Modal/DocumentFlowModalsend';
import { useNavigate } from 'react-router-dom';
import ViewMessageModal from './Modal/ViewMessageModalinbox';
import useUserRoles from '../hooks/useUserRoles';
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const Mymessage = () => {
    const [letterType, setLetterType] = useState(null);
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorProgress, setErrorProgress] = useState(100);
    const errorTimerRef = useRef(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedMessagetype, setselectedMessagetype] = useState(null);
    const [searchId, setSearchId] = useState('');
    const [searchEditorValue, setSearchEditorValue] = useState('');
    const [searchFromUser, setSearchFromUser] = useState('');
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showReferModal, setShowReferModal] = useState(false);
    const [showDocumentFlowModal, setShowDocumentFlowModal] = useState(false);
    const [showDocumentFlowModal1, setShowDocumentFlowModal1] = useState(false);
    const navigate = useNavigate();
    const [searchNumber, setSearchNumber] = useState('');
    const [searchSubject, setSearchSubject] = useState('');
    const [searchSignatoryId, setSearchSignatoryId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [referData, setReferData] = useState([]);
    const [receiver, setReceiver] = useState('');
    const [direction, setDirection] = useState('');
    const [margin, setMargin] = useState('');
    const [privateNote, setPrivateNote] = useState('');
    const [isAdded, setIsAdded] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteName, setInviteName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMobile, setInviteMobile] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedMessageData, setSelectedMessageData] = useState(null);
    const { userRoles, selectedRole, setSelectedRole, signatoryId } = useUserRoles();

    // Function to set error with auto-dismiss and progress bar
    const showError = (message) => {
        // Clear any existing timeout
        if (errorTimerRef.current) {
            clearInterval(errorTimerRef.current);
        }
        
        // Set the error message
        setError(message);
        setErrorProgress(100);
        
        // Set up the progress bar animation
        const startTime = Date.now();
        const duration = 3000; // 3 seconds
        
        errorTimerRef.current = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const remainingProgress = 100 - (elapsedTime / duration) * 100;
            
            if (remainingProgress <= 0) {
                clearInterval(errorTimerRef.current);
                setError(null);
                setErrorProgress(0);
            } else {
                setErrorProgress(remainingProgress);
            }
        }, 10); // Update every 10ms for smooth animation
    };

    // Clean up interval on component unmount
    useEffect(() => {
        return () => {
            if (errorTimerRef.current) {
                clearInterval(errorTimerRef.current);
            }
        };
    }, []);

    const fetchLetters1 = async (page = 1) => {
        try {
            const searchParams = {
                number: searchNumber,
                subject: searchSubject,
                signatory: searchSignatoryId,
                start_date: startDate ? moment(startDate).format('YYYY-MM-DD') : null,
                end_date: endDate ? moment(endDate).format('YYYY-MM-DD') : null
            };
            const response = await kartablsearchmymessage(page, 'received', searchParams);
            setMessages(response.data);
            setLoading(false);
            setTotalPages(response.total_pages);
        } catch (err) {
            showError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLetters1(currentPage);
    }, [currentPage, searchNumber, searchSubject, searchSignatoryId, startDate, endDate]);

    const handleReset = () => {
        setSearchNumber('');
        setSearchSubject('');
        setSearchSignatoryId('');
        setStartDate(null);
        setEndDate(null);
        setCurrentPage(1);
        fetchLetters1(1);
    };

    const fetchLetters = async (page = 1) => {
        try {
            const response = await getLettersreceived(page);
            setMessages(response.data);
            setFilteredMessages(response.data);
            setLoading(false);
            setTotalPages(response.total_pages);
        } catch (err) {
            showError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        filterMessages();
    }, [searchId, searchEditorValue, searchFromUser, messages]);

    const filterMessages = () => {
        let filtered = messages.filter((message) => {
            const matchesId = searchId ? (message.number && message.number.toString().includes(searchId)) : true;
            const matchesEditorValue = searchEditorValue ? (message.content && message.content.includes(searchEditorValue)) : true;
            const matchesFromUser = searchFromUser ? (message.signatory.first_name && message.signatory.first_name.includes(searchFromUser)) : true;
            return matchesId && matchesEditorValue && matchesFromUser;
        });
        setFilteredMessages(filtered);
    };

    const handleAddRefer = () => {
        if (receiver && direction) {
            const newRefer = { receiver, direction, margin, privateNote, selectedRole };
            setReferData([...referData, newRefer]);
            setReceiver('');
            setDirection('');
            setMargin('');
            setPrivateNote('');
        } else {
            alert("لطفاً تمامی فیلدهای ضروری را پر کنید.");
        }
    };

    const handleSendInvite = () => {
        setInviteName('');
        setInviteEmail('');
        setInviteMobile('');
        setShowInviteModal(false);
        setShowSuccessModal(true);
    };

    const handleView = () => {
        if (selectedMessageId !== null) {
            const selectedMessage = messages.find(message => message.id === selectedMessageId || message.type === selectedMessagetype);
            setSelectedMessageData(selectedMessage);
            setShowViewModal(true);
        } else {
            showError("هیچ پیامی انتخاب نشده است.");
        }
    };

    const documentflow = () => {
        if (selectedMessageId !== null) {
            const selectedMessage = messages.find(message => message.id === selectedMessageId || message.type === selectedMessagetype);
            setSelectedMessageData(selectedMessage);
            setShowDocumentFlowModal(true);
        } else {
            showError("هیچ پیامی انتخاب نشده است.");
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleFirstPage = () => setCurrentPage(1);
    const handleLastPage = () => setCurrentPage(totalPages);

    useEffect(() => {
        fetchLetters(currentPage);
    }, [currentPage]);

    const convertToJalali = (gregorianDate) => moment(gregorianDate).format('jYYYY/jMM/jDD');

    const handleReferClick = () => {
        if (selectedMessageId !== null) {
            const selectedMessage = messages.find(message => message.id === selectedMessageId);
            if (selectedMessage) setLetterType(selectedMessage.type);
            else showError("پیام انتخاب شده وجود ندارد.");
        }
    };

    const handleRowClick = (messageId) => {
        setSelectedMessageId(messageId);
        handleReferClick();
    };

    const handleReferSubmit = async (referData) => {
        if (selectedMessageId === null) {
            showError("هیچ پیامی انتخاب نشده است.");
            return;
        }
        const formData = new FormData();
        if (referData.length > 0) {
            referData.forEach(data => {
                formData.append('receivers_user_id[]', data.receiver);
                formData.append('receivers_reason_id[]', data.direction);
                formData.append('receivers_footnote[]', data.margin);
                formData.append('receivers_private_message[]', data.privateNote);
                formData.append('role_id', selectedRole);
                formData.append('refer', 'true');
            });
        }
        try {
            await referLetter(selectedMessageId, formData);
            setSuccessMessage("نامه دریافتی ارجاع شد!");
            setShowSuccessModal(true);
            setTimeout(() => navigate('/automation'), 2000);
            setShowReferModal(false);
        } catch (err) {
            showError("مشکلی در ارسال داده‌ها وجود دارد");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4">
            {error && (
                <div className="fixed bottom-4 left-4 z-50 max-w-xs bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md shadow-lg animate-fade-in-up">
                    <div className="flex justify-between items-center">
                        <span className="text-sm">{error}</span>
                        <button 
                            onClick={() => {
                                if (errorTimerRef.current) {
                                    clearInterval(errorTimerRef.current);
                                }
                                setError(null);
                            }} 
                            className="text-red-700 hover:text-red-900 focus:outline-none ml-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 bg-red-500 transition-all duration-100 ease-linear" style={{ width: `${errorProgress}%` }}></div>
                </div>
            )}
            {loading ? (
                <div className="flex items-center justify-center min-h-[60vh] bg-gray-50 dark:bg-gray-900">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-16 h-16">
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">در حال بارگذاری...</p>
                    </div>
                </div>
            ) : (
                <div className="max-w-full mx-auto bg-gray-0  dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                    {/* عنوان */}
                    <div className="mb-6 bg-gray-100 dark:bg-gray-700 py-3 px-4 rounded-lg text-center">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">کارتابل دریافتی</h2>
                    </div>

                    {/* انتخاب نقش */}
                    <div className="flex flex-col sm:flex-row items-center justify-center mb-6 gap-3">
                        <div className="flex items-center gap-2">
                            <img src="/picture/icons/semat.svg" alt="User Icon" className="w-5 h-5 sm:w-6 sm:h-6" />
                            <label htmlFor="userRole" className="text-gray-700 dark:text-white  text-sm sm:text-base">سمت:</label>
                        </div>
                        <select
                            id="userRole"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full sm:w-auto bg-gray-0 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md py-2 px-3 text-gray-700 dark:text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {userRoles.map((role, index) => (
                                <option key={index} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* فرم جستجو */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-4">
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
                        </div>
                        <div className="space-y-4">
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
                                                placeholder="YYYYMMDD"
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

                    {/* جدول */}
                    <div className="overflow-x-auto rounded-lg shadow-md">
                        <table className="w-full border-collapse bg-white dark:bg-gray-800">
                            <thead>
                                <tr className="bg-[#174C72] text-white text-xs sm:text-sm">
                                    <th className="p-2 sm:p-3 text-right">اهمیت</th>
                                    <th className="p-2 sm:p-3 text-right">شماره</th>
                                    <th className="p-2 sm:p-3 text-right">موضوع</th>
                                    <th className="p-2 sm:p-3 text-right hidden sm:table-cell">تاریخ ثبت</th>
                
                                    <th className="p-2 sm:p-3 text-right hidden lg:table-cell">ایجاد کننده</th>
                                    <th className="p-2 sm:p-3 text-right hidden md:table-cell">پاسخ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMessages.map((message, index) => {
                                    let importanceClass = "";
                                    switch (message.importance) {
                                        case "normal": importanceClass = "bg-[#2EBA21]"; break;
                                        case "secret": importanceClass = "bg-[#F7A35C]"; break;
                                        case "classified": importanceClass = "bg-[#D52F1D]"; break;
                                        default: importanceClass = "";
                                    }
                                    const isUnseen = message.receiver && message.receiver.status !== "seen";

                                    return (
                                        <tr
                                            key={index}
                                            onClick={() => handleRowClick(message.id)}
                                            onDoubleClick={documentflow}
                                            className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-150 text-xs sm:text-sm
                                                ${selectedMessageId === message.id ? 'bg-gray-100 dark:bg-gray-500  dark:text-gray-50' : 'bg-white dark:bg-gray-800'}
                                                ${isUnseen ? 'font-bold' : 'font-normal'}`}
                                        >
                                            <td className="p-2 sm:p-3">
                                                <span className={`inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full ${importanceClass}`} />
                                            </td>
                                            <td className="p-2 sm:p-3">
                                                {isUnseen && <span role="img" aria-label="unseen" className="ml-1 sm:ml-2">👁️</span>}
                                                {message.number}
                                            </td>
                                            <td className="p-2 sm:p-3 max-w-[120px] sm:max-w-[200px] truncate">
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={<Tooltip>{message.subject}</Tooltip>}
                                                >
                                                    <div className="cursor-help">{message.subject}</div>
                                                </OverlayTrigger>
                                            </td>
                                            <td className="p-2 sm:p-3 hidden sm:table-cell">{convertToJalali(message.registered_at)}</td>
                                            <td className="p-2 sm:p-3 hidden lg:table-cell">
                                                {message.user ? `${message.user.first_name} ${message.user.last_name}` : 'نامشخص'}
                                            </td>
                                            <td className="p-2 sm:p-3 hidden md:table-cell">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRowClick(message.id);
                                                        setShowDocumentFlowModal(true);
                                                    }}
                                                    className="flex items-center justify-center px-3 py-1 bg-[#174C72] text-white rounded hover:bg-[#123856] transition-colors duration-200"
                                                >
                                                    <span className="text-xs">پاسخ</span>
                                                </button>
                                            </td>
                                           
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* دکمه‌های عملیات */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6">
                        <button
                            onClick={() => {
                                if (selectedMessageId !== null) {
                                    handleReferClick();
                                    setShowReferModal(true);
                                } else {
                                    showError("هیچ پیامی انتخاب نشده است.");
                                }
                            }}
                            className="flex flex-col items-center justify-center p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:-translate-y-1 transition-transform duration-200 w-full sm:w-24"
                        >
                            <img src="/picture/icons/erja.svg" alt="ارجاع" className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
                            <span className="text-xs sm:text-sm text-gray-700 dark:text-black">ارجاع</span>
                        </button>
                        <button
                            onClick={() => setShowDocumentFlowModal1(true)}
                            className="flex flex-col items-center justify-center p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:-translate-y-1 transition-transform duration-200 w-full sm:w-24"
                        >
                            <img src="/picture/icons/gardesh.svg" alt="گردش سند" className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
                            <span className="text-xs sm:text-sm text-gray-700 dark:text-black">گردش سند</span>
                        </button>
                        <button
                            onClick={handleView}
                            className="flex flex-col items-center justify-center p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:-translate-y-1 transition-transform duration-200 w-full sm:w-24"
                        >
                            <img src="/picture/icons/moshahede.svg" alt="مشاهده" className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
                            <span className="text-xs sm:text-sm text-gray-700 dark:text-black">مشاهده نامه</span>
                        </button>
                    </div>

                    {/* صفحه‌بندی */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-6 text-xs sm:text-sm">
                        <button
                            onClick={handleFirstPage}
                            disabled={currentPage === 1}
                            className="px-3 py-2 bg-[#174C72] text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-[#123856] transition-colors duration-200 w-full sm:w-auto"
                        >
                            صفحه اول
                        </button>
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="px-3 py-2 bg-[#174C72] text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-[#123856] transition-colors duration-200 w-full sm:w-auto"
                        >
                            صفحه قبل
                        </button>
                        <span className="text-gray-700 dark:text-white">
                            صفحه {currentPage} از {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 bg-[#174C72] text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-[#123856] transition-colors duration-200 w-full sm:w-auto"
                        >
                            صفحه بعد
                        </button>
                        <button
                            onClick={handleLastPage}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 bg-[#174C72] text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-[#123856] transition-colors duration-200 w-full sm:w-auto"
                        >
                            صفحه آخر
                        </button>
                    </div>

                    {/* مودال‌ها */}
                    <ReferModal
                        isOpen={showReferModal}
                        toggle={() => setShowReferModal(false)}
                        handleAddRefer={handleAddRefer}
                        receiver={receiver}
                        setReceiver={setReceiver}
                        direction={direction}
                        setDirection={setDirection}
                        margin={margin}
                        setMargin={setMargin}
                        privateNote={privateNote}
                        setPrivateNote={setPrivateNote}
                        referData={referData}
                        selectedRole={selectedRole}
                        isAdded={isAdded}
                        setShowInviteModal={setShowInviteModal}
                        setIsAdded={setIsAdded}
                        onSubmitRefer={handleReferSubmit}
                        selectedMessageId={selectedMessageId}
                        userRoles={userRoles}
                        letterType={letterType}
                    />
                    <InviteModal
                        isOpen={showInviteModal}
                        toggle={() => setShowInviteModal(false)}
                        handleSendInvite={handleSendInvite}
                        inviteName={inviteName}
                        setInviteName={setInviteName}
                        inviteEmail={inviteEmail}
                        setInviteEmail={setInviteEmail}
                        inviteMobile={inviteMobile}
                        setInviteMobile={setInviteMobile}
                    />
                    <SuccessModal
                        isOpen={showSuccessModal}
                        toggle={() => setShowSuccessModal(false)}
                        message={successMessage}
                    />
                    <DocumentFlowModal
                        isOpen={showDocumentFlowModal}
                        toggle={() => setShowDocumentFlowModal(false)}
                        documentId={selectedMessageId}
                        
                    />
                    <DocumentFlowModal1
                        isOpen={showDocumentFlowModal1}
                        toggle={() => setShowDocumentFlowModal1(false)}
                        documentId={selectedMessageId}
                    />
                    <ViewMessageModal
                        isOpen={showViewModal}
                        toggle={() => setShowViewModal(false)}
                        messageId={selectedMessageId}
                        userRoles={userRoles}
                        selectedRole={selectedRole}
                    />
                </div>
            )}
        </div>
    );
};

export default Mymessage;