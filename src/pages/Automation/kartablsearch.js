import React, { useEffect, useState, useRef } from 'react';
import { kartablsearchmymessage, getLetterDetails } from '../../api/api';
import DatePicker from "react-datepicker2";
import moment from 'moment-jalaali';
import DocumentFlowModal from './Modal/DocumentFlowModalsend';
import ViewMessageModal from './Modal/ViewMessageModalsend';
import { useNavigate } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import useUserRoles from '../hooks/useUserRoles';
import InfiniteScroll from 'react-infinite-scroll-component';
import '../../styles/Automation/my-message.scss';
import ProfileModal from './Modal/ProfileModal';

const SearchKartabl = () => {
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errorProgress, setErrorProgress] = useState(100);
    const errorTimerRef = useRef(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [searchNumber, setSearchNumber] = useState('');
    const [searchSubject, setSearchSubject] = useState('');
    const [searchSignatoryId, setSearchSignatoryId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [showDocumentFlowModal, setShowDocumentFlowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedMessageData, setSelectedMessageData] = useState(null);
    const { userRoles, selectedRole, setSelectedRole } = useUserRoles();
    const navigate = useNavigate();
    const currentUserId = localStorage.getItem('userId');
    const perPage = 10;
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [showProfileModal, setShowProfileModal] = useState(false);

    const showError = (message) => {
        if (errorTimerRef.current) {
            clearInterval(errorTimerRef.current);
        }
        
        setError(message);
        setErrorProgress(100);
        
        const startTime = Date.now();
        const duration = 3000;
        
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
        }, 10);
    };

    useEffect(() => {
        return () => {
            if (errorTimerRef.current) {
                clearInterval(errorTimerRef.current);
            }
        };
    }, []);

    const fetchLetters = async (page = 1, append = false) => {
        try {
            setLoading(true);
            const searchParams = {
                number: searchNumber,
                subject: searchSubject,
                signatory: searchSignatoryId,
                start_date: startDate ? moment(startDate).format('YYYY-MM-DD') : null,
                end_date: endDate ? moment(endDate).format('YYYY-MM-DD') : null,
                per_page: perPage
            };
            console.log('Search Params:', searchParams); // Debug log

            // Fetch sent, received, and CC letters
            const [sentResponse, receivedResponse, ccResponse] = await Promise.all([
                kartablsearchmymessage(page, 'sent', searchParams),
                kartablsearchmymessage(page, 'received', searchParams),
                kartablsearchmymessage(page, 'cc', searchParams)
            ]);

            console.log('CC Response:', ccResponse); // Debug log for CC

            // Combine and mark letters with their kartabl type
            const sentLetters = sentResponse.data.map(letter => ({ ...letter, kartablType: 'sent' }));
            const receivedLetters = receivedResponse.data.map(letter => ({ ...letter, kartablType: 'received' }));
            const ccLetters = ccResponse.data.map(letter => ({ ...letter, kartablType: 'cc' }));
            const combinedLetters = [...sentLetters, ...receivedLetters, ...ccLetters];

            // Client-side filtering as a fallback
            const filteredByDate = combinedLetters.filter(letter => {
                const letterDate = moment(letter.registered_at, 'YYYY/MM/DD').toDate();
                const start = startDate ? moment(startDate).startOf('day').toDate() : null;
                const end = endDate ? moment(endDate).endOf('day').toDate() : null;
                return (!start || letterDate >= start) && (!end || letterDate <= end);
            });

            // Append or replace messages
            setMessages(prev => append ? [...prev, ...filteredByDate] : filteredByDate);
            setFilteredMessages(prev => append ? [...prev, ...filteredByDate] : filteredByDate);

            // Calculate total pages and check if more data is available
            const maxTotalPages = Math.max(
                sentResponse.total_pages || 1,
                receivedResponse.total_pages || 1,
                ccResponse.total_pages || 1
            );
            setTotalPages(maxTotalPages);
            setHasMore(page < maxTotalPages && filteredByDate.length >= perPage);

            setLoading(false);
        } catch (err) {
            console.error('Error fetching letters:', err);
            showError(`خطا در بارگذاری نامه‌ها: ${err.message}`);
            setLoading(false);
            setHasMore(false);
        }
    };

    useEffect(() => {
        // Reset and fetch first page when search parameters or role change
        setMessages([]);
        setFilteredMessages([]);
        setCurrentPage(1);
        fetchLetters(1, false);
    }, [searchNumber, searchSubject, searchSignatoryId, startDate, endDate, selectedRole]);

    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchLetters(nextPage, true);
        }
    };

    const handleReset = () => {
        setSearchNumber('');
        setSearchSubject('');
        setSearchSignatoryId('');
        setStartDate(null);
        setEndDate(null);
        setCurrentPage(1);
        setMessages([]);
        setFilteredMessages([]);
        fetchLetters(1, false);
    };

    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
        localStorage.setItem('userRole', e.target.value);
        setCurrentPage(1);
        setMessages([]);
        setFilteredMessages([]);
        fetchLetters(1, false);
    };

    const handleView = async () => {
        if (selectedMessageId !== null) {
            try {
                const response = await getLetterDetails(selectedMessageId);
                setSelectedMessageData(response.data);
                setShowViewModal(true);
            } catch (err) {
                showError("خطا در بارگذاری جزئیات نامه");
            }
        } else {
            showError("هیچ نامه‌ای انتخاب نشده است.");
        }
    };

    const handleDoubleClick = () => {
        if (selectedMessageId !== null) {
            const selectedMessage = messages.find(message => message.id === selectedMessageId);
            setSelectedMessageData(selectedMessage);
            setShowDocumentFlowModal(true);
        } else {
            showError("هیچ نامه‌ای انتخاب نشده است.");
        }
    };

    const convertToJalali = (gregorianDate) => {
        return moment(gregorianDate).format('jYYYY/jMM/jDD');
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
            <div className="max-w-full mx-auto bg-gray-0 dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                {/* Title */}
                <div className="w-full mt-8 flex justify-center items-center mb-6">
                    <div className="bg-gray-200 dark:bg-gray-700 py-4 px-8 rounded-lg">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">کارتابل جستجو</h2>
                    </div>
                </div>

                {/* Role Selection */}
                <div className="flex flex-col sm:flex-row items-center justify-center mb-6 gap-3">
                    <div className="flex items-center gap-2">
                        <img src="/picture/icons/semat.svg" alt="User Icon" className="w-5 h-5 sm:w-6 sm:h-6" />
                        <label htmlFor="userRole" className="text-gray-700 dark:text-white text-sm sm:text-base">سمت:</label>
                    </div>
                    <select
                        id="userRole"
                        value={selectedRole}
                        onChange={handleRoleChange}
                        className="w-full sm:w-auto bg-gray-0 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md py-2 px-3 text-gray-700 dark:text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {userRoles.map((role, index) => (
                            <option key={index} value={role.id}>{role.name}</option>
                            ))}
                    </select>
                </div>

                {/* Search Form */}
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
                                            onChange={(date) => {
                                                setStartDate(date);
                                                if (!endDate || moment(date).isAfter(endDate)) {
                                                    setEndDate(date);
                                                }
                                            }}
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
                                            onChange={(date) => {
                                                setEndDate(date);
                                                if (!startDate || moment(date).isBefore(startDate)) {
                                                    setStartDate(date);
                                                }
                                            }}
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

                {/* Infinite Scroll Container */}
                <InfiniteScroll
                    dataLength={filteredMessages.length}
                    next={loadMore}
                    hasMore={hasMore}
                    loader={
                        loading && (
                            <div className="flex items-center justify-center py-4">
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="relative w-12 h-12">
                                        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
                                        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full animate-pulse"></div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">در حال بارگذاری...</p>
                                </div>
                            </div>
                        )
                    }
                    endMessage={
                        !loading && filteredMessages.length > 0 && !hasMore && (
                            <p className="text-center text-gray-600 dark:text-gray-300 py-4 text-sm">
                                تمام نامه‌ها بارگذاری شدند
                            </p>
                        )
                    }
                >
                    {/* Mobile Card View */}
                    <div className="block sm:hidden">
                        {filteredMessages.map((message, index) => {
                            let importanceClass = "";
                            switch (message.importance) {
                                case "normal": importanceClass = "bg-[#2EBA21]"; break;
                                case "secret": importanceClass = "bg-[#F7A35C]"; break;
                                case "classified": importanceClass = "bg-[#D52F1D]"; break;
                                default: importanceClass = "";
                            }
                            const isUnseen = message.kartablType === 'received' && message.receiver && message.receiver.status !== "seen";

                            return (
                                <div
                                    key={`${message.id}-${index}`}
                                    onClick={() => setSelectedMessageId(message.id)}
                                    onDoubleClick={handleDoubleClick}
                                    className={`p-4 mb-2 rounded-lg shadow-md dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer transition-colors duration-150
                                        ${selectedMessageId === message.id ? 'bg-gray-100 dark:bg-gray-500 dark:text-gray-50' : 'bg-white dark:bg-gray-800'}
                                        ${isUnseen ? 'font-bold' : 'font-normal'}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-block w-3 h-3 rounded-full ${importanceClass}`} />
                                            <span className="text-sm">
                                                {isUnseen && <span role="img" aria-label="unseen" className="ml-2">👁️</span>}
                                                شماره: {message.number}
                                            </span>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                            {message.kartablType === 'sent' ? 'ارسالی' : message.kartablType === 'received' ? 'دریافتی' : 'رونوشت'}
                                        </span>
                                    </div>
                                    <div className="text-sm mb-2 truncate">
                                        موضوع: {message.subject}
                                    </div>
                                    <div className="text-sm mb-2">
                                        تاریخ ثبت: {convertToJalali(message.registered_at)}
                                    </div>
                                    <div className="text-sm">
                                        امضا کننده: {message.signatory?.first_name} {message.signatory?.last_name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
   
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto rounded-lg shadow-md">
                        <table className="w-full border-collapse bg-white dark:bg-gray-800">
                            <thead>
                                <tr className="bg-[#174C72] text-white text-xs sm:text-sm">
                                    <th className="p-2 sm:p-3 text-right">اهمیت</th>
                                    <th className="p-2 sm:p-3 text-right hidden lg:table-cell">ایجاد کننده</th>
                                    <th className="p-2 sm:p-3 text-right">شماره</th>
                                    <th className="p-2 sm:p-3 text-right">موضوع</th>
                                    <th className="p-2 sm:p-3 text-right">تاریخ ثبت</th>
                                    <th className="p-2 sm:p-3 text-right">نوع کارتابل</th>
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
                                    const isUnseen = message.kartablType === 'received' && message.receiver && message.receiver.status !== "seen";

                                    return (
                                        <tr
                                            key={`${message.id}-${index}`}
                                            onClick={() => setSelectedMessageId(message.id)}
                                            onDoubleClick={handleDoubleClick}
                                            className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-150 text-xs sm:text-sm
                                                ${selectedMessageId === message.id ? 'bg-gray-100 dark:bg-gray-500 dark:text-gray-50' : 'bg-white dark:bg-gray-800'}
                                                ${isUnseen ? 'font-bold' : 'font-normal'}`}
                                        >
                                            <td className="p-2 sm:p-3">
                                                <span className={`inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full ${importanceClass}`} />
                                            </td>
                                            <td className="p-2 sm:p-3 hidden lg:table-cell">
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={message.user && message.user.profile ? `https://automationapi.satia.co/storage/${message.user.profile}` : '/picture/icons/profile.jpg'}
                                                        alt={message.user ? `${message.user.first_name} ${message.user.last_name}` : 'نامشخص'}
                                                        className="w-6 h-6 rounded-full bg-gray-300 border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setProfileImageUrl(message.user && message.user.profile ? `https://automationapi.satia.co/storage/${message.user.profile}` : '/picture/icons/profile.jpg');
                                                            setShowProfileModal(true);
                                                        }}
                                                    />
                                                    <span>
                                                        {message.user ? `${message.user.first_name} ${message.user.last_name}` : 'نامشخص'}
                                                    </span>
                                                </div>
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
                                            <td className="p-2 sm:p-3">{convertToJalali(message.registered_at)}</td>
                                            
                                            <td className="p-2 sm:p-3">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                                    {message.kartablType === 'sent' ? 'ارسالی' : message.kartablType === 'received' ? 'دریافتی' : 'رونوشت'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </InfiniteScroll>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6">
                    <button
                        onClick={handleView}
                        className="flex flex-col items-center justify-center p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:-translate-y-1 transition-transform duration-200 w-full sm:w-24"
                    >
                        <img src="/picture/icons/moshahede.svg" alt="مشاهده" className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-black">مشاهده</span>
                    </button>
                    <button
                        onClick={handleDoubleClick}
                        className="flex flex-col items-center justify-center p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:-translate-y-1 transition-transform duration-200 w-full sm:w-24"
                    >
                        <img src="/picture/icons/gardesh.svg" alt="گردش سند" className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
                        <span className="text-xs sm:text-sm text-gray-700 dark:text-black">گردش سند</span>
                    </button>
                </div>

                {/* Modals */}
                <DocumentFlowModal
                    isOpen={showDocumentFlowModal}
                    toggle={() => setShowDocumentFlowModal(false)}
                    documentId={selectedMessageId}
                />
                <ViewMessageModal
                    isOpen={showViewModal}
                    toggle={() => setShowViewModal(false)}
                    messageId={selectedMessageId}
                    userRoles={userRoles}
                    selectedRole={selectedRole}
                />
                  <ProfileModal
                        isOpen={showProfileModal}
                        toggle={() => setShowProfileModal(false)}
                        imageUrl={profileImageUrl}
                    />
            </div>
        </div>
    );
};

export default SearchKartabl;