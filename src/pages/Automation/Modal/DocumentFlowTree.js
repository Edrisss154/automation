import React, { useRef, useState, useMemo, useEffect } from 'react';
import moment from "jalali-moment";
import { FaEye, FaEyeSlash, FaArrowRight, FaStar, FaGem, FaBolt, FaLeaf, FaAnchor, FaBell, FaCloud, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { referLetter } from '../../../api/api';

const translateStatus = (status) => {
    switch (status) {
        case 'referred': return 'ارجاع شده';
        case 'seen': return 'دیده شده';
        case 'unseen': return 'دیده نشده';
        default: return status;
    }
};

const translateDocumentType = (type) => {
    switch (type) {
        case 'internal': return 'داخلی';
        case 'issued': return 'صادره';
        case 'incoming': return 'وارده';
        default: return type;
    }
};

const translateImportance = (importance) => {
    switch (importance) {
        case 'normal': return 'عادی';
        case 'secret': return 'محرمانه';
        case 'classified': return 'سری';
        default: return importance;
    }
};

const translateUrgency = (urgency) => {
    switch (urgency) {
        case 'normal': return 'عادی';
        case 'urgent': return 'فوری';
        case 'instant': return 'آنی';
        default: return urgency;
    }
};

const formatJalaliDateTime = (date) => {
    if (!date) return '14:03 12/20';
    return moment(date).locale('fa').format('jYYYY/jMM/jDD HH:mm');
};

const formatJalaliDateTime1 = (date) => {
    if (!date) return '14:03 12/20';
    return moment(date).locale('fa').format('jYYYY/jMM/jDD ');
};

const flattenFlow = (item, level = 0) => {
    let result = [];
    if (item) {
        result.push({ ...item, level });
        if (item.children && item.children.length > 0) {
            item.children.forEach(child => result.push(...flattenFlow(child, level + 1)));
        }
    }
    return result;
};

const getAllGroups = (flow) => {
    const groups = [];
    const seenGroups = new Set();

    flow.forEach((item, index) => {
        const isLastInGroup = index === flow.length - 1 ||
            (index < flow.length - 1 && flow[index + 1].level <= item.level);

        if (isLastInGroup) {
            let currentItem = item;
            const group = [currentItem];

            while (currentItem && currentItem.parent_id) {
                const parent = flow.find(prev => prev.id === currentItem.parent_id);
                if (parent && !seenGroups.has(parent.id)) {
                    group.unshift(parent);
                    currentItem = parent;
                } else {
                    break;
                }
            }

            groups.push(group);
            group.forEach(g => seenGroups.add(g.id));
        }
    });

    return groups;
};

// Add a function to get file icon based on file extension
const getFileIcon = (fileName) => {
    if (!fileName) return 'file';
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
        case 'pdf':
            return 'pdf';
        case 'doc':
        case 'docx':
            return 'word';
        case 'xls':
        case 'xlsx':
            return 'excel';
        case 'ppt':
        case 'pptx':
            return 'powerpoint';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return 'image';
        case 'zip':
        case 'rar':
            return 'archive';
        default:
            return 'file';
    }
};

// Add a function to render file icon
const renderFileIcon = (fileType) => {
    switch (fileType) {
        case 'pdf':
            return (
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
            );
        case 'word':
            return (
                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
            );
        case 'excel':
            return (
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
            );
        case 'powerpoint':
            return (
                <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
            );
        case 'image':
            return (
                <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
            );
        case 'archive':
            return (
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
            );
        default:
            return (
                <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
            );
    }
};

const DocumentFlowTree = ({ data, currentUserId, letterDetails }) => {
    const flattenedFlow = useMemo(() => {
        return flattenFlow({ children: letterDetails?.receivers || [] }, 0);
    }, [letterDetails?.receivers]);

    const allGroups = useMemo(() => {
        return getAllGroups(flattenedFlow);
    }, [flattenedFlow]);

    const boxRefs = useRef([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [commentContents, setCommentContents] = useState({});
    const [expandedFootnotes, setExpandedFootnotes] = useState({});
    const [collapsedGroups, setCollapsedGroups] = useState({});

    const branchIcons = [FaStar, FaGem, FaBolt, FaLeaf, FaAnchor, FaBell, FaCloud];
    const groupColors = ['bg-[#f0f8ff]', 'bg-[#f5f5dc]', 'bg-[#f0fff0]', 'bg-[#fff0f5]'];

    const handleImageClick = (imageSrc) => {
        setSelectedImage(imageSrc);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedImage(null);
    };

    const toggleFootnote = (key) => {
        setExpandedFootnotes(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const toggleGroup = (groupIndex) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [groupIndex]: !prev[groupIndex]
        }));
    };

    const truncateText = (text, wordLimit = 10) => {
        if (!text) return '';
        const words = text.split(' ');
        if (words.length <= wordLimit) return text;
        return words.slice(0, wordLimit).join(' ') + '...';
    };

    // Add a function to check if text is longer than one line
    const isTextLongerThanOneLine = (text) => {
        if (!text) return false;
        // Rough estimate: if text has more than 50 characters, it's likely more than one line
        return text.length > 50;
    };

    const handleAddComment = async (groupIndex, letterReceiverId) => {
        const commentContent = commentContents[groupIndex] || '';

        if (!commentContent.trim()) {
            alert('لطفاً متن توضیحات را وارد کنید!');
            return;
        }
        if (!letterReceiverId) {
            alert('گیرنده مشخص نیست!');
            return;
        }

        const formData = new FormData();
        formData.append('receivers_user_id[]', currentUserId);
        formData.append('receivers_reason_id[]', '1');
        formData.append('receivers_footnote[]', commentContent);
        formData.append('receivers_private_message[]', '');
        formData.append('role_id', localStorage.getItem('roleId') || '1');
        formData.append('receiver_id', letterReceiverId);

        try {
            await referLetter(letterDetails.id, formData);
            alert('توضیحات با موفقیت اضافه شد!');
            setCommentContents(prev => ({ ...prev, [groupIndex]: '' }));
            window.location.reload()
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('خطا در افزودن توضیحات!');
        }
    };

    return (
        <>
            <div className="w-full max-w-4xl mx-auto font-vazir dir-rtl md:p-0 p-2.5 relative">
                {letterDetails && (
                    <div className="w-full p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50 shadow-sm transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-900 mt-20 relative z-[1]">
                        <div className="p-2.5 bg-gray-50 rounded-md text-gray-700 max-h-[300px] overflow-y-auto dark:bg-gray-800 dark:text-gray-200 dir-rtl">
                            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 mb-4 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] grid-cols-1">
                                <div className="bg-gradient-to-br from-gray-100 to-white p-3 rounded-lg border border-gray-200 shadow-sm text-center text-gray-700 transition-transform hover:-translate-y-0.5 hover:from-gray-200 hover:to-white dark:from-gray-700 dark:to-gray-800 dark:border-gray-600 dark:text-gray-200 dark:shadow-gray-900">
                                    <strong className="text-blue-600 dark:text-blue-400">شماره:</strong> {letterDetails.number || '03/186/د'}
                                            </div>
                                <div className="bg-gradient-to-br from-gray-100 to-white p-3 rounded-lg border border-gray-200 shadow-sm text-center text-gray-700 transition-transform hover:-translate-y-0.5 hover:from-gray-200 hover:to-white dark:from-gray-700 dark:to-gray-800 dark:border-gray-600 dark:text-gray-200 dark:shadow-gray-900">
                                    <strong className="text-blue-600 dark:text-blue-400">نوع سند:</strong> {translateDocumentType(letterDetails.type) || 'داخلی'}
                                            </div>
                                <div className="bg-gradient-to-br from-gray-100 to-white p-3 rounded-lg border border-gray-200 shadow-sm text-center text-gray-700 transition-transform hover:-translate-y-0.5 hover:from-gray-200 hover:to-white dark:from-gray-700 dark:to-gray-800 dark:border-gray-600 dark:text-gray-200 dark:shadow-gray-900">
                                    <strong className="text-blue-600 dark:text-blue-400">تاریخ:</strong> {formatJalaliDateTime1(letterDetails.registered_at) || '2025-03-15'}
                                            </div>
                                <div className="bg-gradient-to-br from-gray-100 to-white p-3 rounded-lg border border-gray-200 shadow-sm text-center text-gray-700 transition-transform hover:-translate-y-0.5 hover:from-gray-200 hover:to-white dark:from-gray-700 dark:to-gray-800 dark:border-gray-600 dark:text-gray-200 dark:shadow-gray-900">
                                    <strong className="text-blue-600 dark:text-blue-400">سطح اهمیت:</strong> {translateImportance(letterDetails.importance) || 'عادی'}
                                            </div>
                                <div className="bg-gradient-to-br from-gray-100 to-white p-3 rounded-lg border border-gray-200 shadow-sm text-center text-gray-700 transition-transform hover:-translate-y-0.5 hover:from-gray-200 hover:to-white dark:from-gray-700 dark:to-gray-800 dark:border-gray-600 dark:text-gray-200 dark:shadow-gray-900">
                                    <strong className="text-blue-600 dark:text-blue-400">سطح فوریت:</strong> {translateUrgency(letterDetails.urgency) || 'عادی'}
                                            </div>
                                        </div>
                            <p className="leading-loose my-3 text-base text-gray-700 dark:text-gray-200">
                                <strong className="text-blue-600 dark:text-blue-400">محتوا:</strong> {letterDetails.content}
                            </p>
                              {/* Add fileable files section */}
                              {letterDetails.attachments && letterDetails.attachments.length > 0 && (
                                <div className="leading-loose my-3 text-base text-gray-700 dark:text-gray-200">
                                    <strong className="text-blue-600 dark:text-blue-400">فایل‌های پیوست:</strong>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {letterDetails.attachments.map((file, index) => (
                                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                                                {file.attachmentable?.url?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                                        <img
                                                            src={`https://automationapi.satia.co/storage/${file.attachmentable.url}`}
                                                            alt={file.attachmentable.original_name || 'تصویر'}
                                                            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => handleImageClick(`${file.attachmentable.url}`)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                                                        {renderFileIcon(getFileIcon(file.attachmentable?.original_name))}
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{file.attachmentable?.original_name || 'فایل'}</span>
                                                    <a
                                                        href={`${file.attachmentable?.url}`}
                                                        download
                                                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                                                    >
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        دانلود
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                            </div>
                                        )}
                            {letterDetails.cc_users && letterDetails.cc_users.length > 0 && (
                                <div className="leading-loose my-3 text-base text-gray-700 dark:text-gray-200">
                                    <strong className="text-blue-600 dark:text-blue-400">رونوشت:</strong>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {letterDetails.cc_users.map((ccUser, index) => (
                                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white overflow-hidden">
                                                    {ccUser.profile ? (
                                                        <img 
                                                            src={`https://automationapi.satia.co/storage/${ccUser.profile}`}
                                                            alt={`${ccUser.first_name} ${ccUser.last_name}`}
                                                            className="w-full h-full object-cover"
                                                            onClick={() => handleImageClick(`https://automationapi.satia.co/storage/${ccUser.profile}`)}
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-medium">
                                                            {ccUser.first_name?.[0]?.toUpperCase() || ''}{ccUser.last_name?.[0]?.toUpperCase() || ''}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{ccUser.first_name} {ccUser.last_name}</span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">{ccUser.email || 'بدون ایمیل'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {letterDetails.footnote && (
                                <div className="leading-loose my-3 text-gray-500 text-sm p-2 bg-gray-50 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                                    <strong className="text-blue-600 dark:text-blue-400">هامش:</strong> 
                                    <div className="whitespace-pre-wrap break-words">
                                        <span className="inline-block">
                                            {expandedFootnotes['letterDetails'] ? letterDetails.footnote : truncateText(letterDetails.footnote)}
                                        </span>
                                        {isTextLongerThanOneLine(letterDetails.footnote) && (
                                            <button
                                                onClick={() => toggleFootnote('letterDetails')}
                                                className="text-blue-600 dark:text-blue-400 text-sm mr-2 hover:underline"
                                            >
                                                {expandedFootnotes['letterDetails'] ? 'بستن' : 'ادامه مطلب'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                                        </div>
                                    )}

                {allGroups.map((group, groupIndex) => (
                    <React.Fragment key={groupIndex}>
                        <div className={`${groupColors[groupIndex % groupColors.length]} p-2.5 mb-8 rounded-lg dark:bg-gray-800 dark:bg-opacity-80 shadow-sm transition-all duration-200`}>
                            <div className="flex items-center justify-between mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md transition-all duration-200" onClick={() => toggleGroup(groupIndex)}>
                                <h5 className="text-gray-700 dark:text-gray-200 text-base font-medium">گروه {groupIndex + 1}</h5>
                                {collapsedGroups[groupIndex] ? (
                                    <FaChevronUp className="text-gray-600 dark:text-gray-400 w-5 h-5 transition-transform duration-200" />
                                ) : (
                                    <FaChevronDown className="text-gray-600 dark:text-gray-400 w-5 h-5 transition-transform duration-200" />
                                                    )}
                                                </div>
                            
                            {!collapsedGroups[groupIndex] && (
                                <div className="transition-all duration-300">
                                    {group.map((item, itemIndex) => {
                                        const marginTopClass = itemIndex === 0 ? 'mt-0' : 'mt-4';
                                        const footnoteKey = `${groupIndex}-${itemIndex}`;

                                        return (
                                            <React.Fragment key={item.id}>
                                                {item.from_user && item.to_user && (
                                                    <div className="relative min-h-[80px]">
                                                        <div
                                                            ref={(el) => (boxRefs.current[groupIndex * 100 + itemIndex] = el)}
                                                            className={`flex justify-between items-stretch w-full p-3 border border-gray-200 rounded-lg ${marginTopClass} mb-3 bg-gray-50 dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 dark:border-gray-700 dark:shadow-gray-900 relative z-[1] md:flex-row flex-col`}
                                                        >
                                                            <div className="flex-1 flex flex-col items-center justify-center p-2 border-x border-gray-200 bg-gray-50 md:border-r-0 border-none md:mb-0 mb-2 w-full relative dark:bg-gray-700 dark:border-gray-600">
                                                                <div className="mb-2">
                                                <img
                                                    src={`https://automationapi.satia.co/storage/${item.from_user.profile}`}
                                                    alt={item.from_user
                                                                            ? `${item.from_user.first_name || ''} ${item.from_user.last_name || ''}`.trim() || 'نامشخص'
                                                        : 'نامشخص'}
                                                    onClick={() => handleImageClick(`https://automationapi.satia.co/storage/${item.from_user.profile}`)}
                                                                        className="w-8 h-8 rounded-full bg-gray-300 cursor-pointer border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-all duration-200"
                                                />
                                            </div>
                                                                <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm mb-1">
                                                {item.from_user
                                                                        ? `${item.from_user.first_name || ''} ${item.from_user.last_name || ''}`.trim() || 'نامشخص'
                                                    : 'نامشخص'}
                                            </span>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">{formatJalaliDateTime(item.created_at)}</span>
                                        </div>

                                                            <div className="flex-[2] p-2 bg-gray-100 rounded-md text-gray-700 text-sm max-h-[200px] overflow-y-auto md:mb-0 mb-2 dark:bg-gray-800 dark:text-gray-200">
                                            {item.content && (
                                                                    <p className="leading-relaxed my-2">
                                                                        <strong className="text-blue-600 dark:text-blue-400">محتوا:</strong> {item.content}
                                                </p>
                                            )}
                                             {/* Display attached files */}
                                             {item.attachments && item.attachments.length > 0 && (
                                                                    <div className="leading-relaxed my-2">
                                                                        <strong className="text-blue-600 dark:text-blue-400">فایل‌های پیوست:</strong>
                                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                                            {item.attachments.map((file, fileIndex) => (
                                                                                <div key={fileIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                                                                                    {file.attachmentable?.url?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                                                                            <img
                                                                                                src={`https://automationapi.satia.co/storage/${file.attachmentable.url}`}
                                                                                                alt={file.attachmentable.original_name || 'تصویر'}
                                                                                                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                                                                onClick={() => handleImageClick(`${file.attachmentable.url}`)}
                                                                                            />
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                                                                                            {renderFileIcon(getFileIcon(file.attachmentable?.original_name))}
                                                                                        </div>
                                                                                    )}
                                                                                    <div className="flex flex-col">
                                                                                        <span className="font-medium text-sm">{file.attachmentable?.original_name || 'فایل'}</span>
                                                                                        <a
                                                                                            href={`https://automationapi.satia.co/storage/${file.attachmentable?.url}`}
                                                                                            download
                                                                                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                                                                                        >
                                                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                            </svg>
                                                                                            دانلود
                                                                                        </a>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                            )}
                                            {item.footnote && (
                                                <div className="leading-relaxed my-2 text-gray-500 text-sm p-2 bg-gray-50 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                                                    <strong className="text-blue-600 dark:text-blue-400">هامش:</strong> 
                                                    <div className="whitespace-pre-wrap break-words">
                                                        <span className="inline-block">
                                                            {expandedFootnotes[footnoteKey] ? item.footnote : truncateText(item.footnote)}
                                                        </span>
                                                        {isTextLongerThanOneLine(item.footnote) && (
                                                            <button
                                                                onClick={() => toggleFootnote(footnoteKey)}
                                                                className="text-blue-600 dark:text-blue-400 text-sm mr-2 hover:underline"
                                                            >
                                                                {expandedFootnotes[footnoteKey] ? 'بستن' : 'ادامه مطلب'}
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Display files for footnotes */}
                                                    {item.footnote_files && item.footnote_files.length > 0 && (
                                                        <div className="mt-2">
                                                            <strong className="text-blue-600 dark:text-blue-400">فایل‌های پیوست هامش:</strong>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {item.footnote_files.map((file, fileIndex) => (
                                                                    <div key={fileIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                                                                        {file.url?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                                                                                <img
                                                                                    src={`${file.url}`}
                                                                                    alt={file.original_name || 'تصویر'}
                                                                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                                                    onClick={() => handleImageClick(`${file.url}`)}
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                                                                                {renderFileIcon(getFileIcon(file.original_name))}
                                                                            </div>
                                                                        )}
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium text-xs">{file.original_name || 'فایل'}</span>
                                                                            <a
                                                                                href={`https://automationapi.satia.co/storage/${file.url}`}
                                                                                download
                                                                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                                                                            >
                                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                </svg>
                                                                                دانلود
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {item.private_message && item.to_user_id === parseInt(currentUserId) && (
                                                <div className="leading-relaxed my-2 text-blue-600 text-sm dark:text-blue-400">
                                                    <strong>یادداشت خصوصی:</strong> {item.private_message}
                                                    
                                                    {/* Display files for private messages */}
                                                    {item.private_message_files && item.private_message_files.length > 0 && (
                                                        <div className="mt-2">
                                                            <strong className="text-blue-600 dark:text-blue-400">فایل‌های پیوست یادداشت خصوصی:</strong>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {item.private_message_files.map((file, fileIndex) => (
                                                                    <div key={fileIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                                                                        {file.url?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                                                                                <img
                                                                                    src={`https://automationapi.satia.co/storage/${file.url}`}
                                                                                    alt={file.original_name || 'تصویر'}
                                                                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                                                    onClick={() => handleImageClick(`https://automationapi.satia.co/storage/${file.url}`)}
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                                                                                {renderFileIcon(getFileIcon(file.original_name))}
                                                                            </div>
                                                                        )}
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium text-xs">{file.original_name || 'فایل'}</span>
                                                                            <a
                                                                                href={`https://automationapi.satia.co/storage/${file.url}`}
                                                                                download
                                                                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                                                                            >
                                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                </svg>
                                                                                دانلود
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                                            </div>

                                                            <div className="flex-1 flex flex-col items-center justify-center p-2 border-x border-gray-200 bg-gray-50 md:border-l-0 border-none md:mb-0 mb-2 w-full relative dark:bg-gray-700 dark:border-gray-600">
                                                                <div className="mb-2">
                                                                    <img
                                                                        src={item.to_user.profile ? `https://automationapi.satia.co/storage/${item.to_user.profile}` : "/picture/icons/profile.jpg"}
                                                                        alt={item.to_user
                                                                            ? `${item.to_user.first_name || ''} ${item.to_user.last_name || ''}`.trim() || 'نامشخص'
                                                                            : 'نامشخص'}
                                                                        onClick={() => handleImageClick(item.to_user.profile ? `https://automationapi.satia.co/storage/${item.to_user.profile}` : "/picture/icons/profile.jpg")}
                                                                        className="w-8 h-8 rounded-full bg-gray-300 cursor-pointer border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-all duration-200"
                                                                    />
                                                                </div>
                                                                <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm mb-1 flex items-center">
                                                                    {item.to_user
                                                                        ? `${item.to_user.first_name || ''} ${item.to_user.last_name || ''}`.trim() || 'نامشخص'
                                                                        : 'نامشخص'}
                                                                    <span className="mr-2 inline-block align-middle">
                                                                        {item.status === 'seen' && <FaEye title="دیده شده" className="text-green-500 w-4 h-4 dark:text-green-400" />}
                                                                        {item.status === 'unseen' && <FaEyeSlash title="دیده نشده" className="text-red-500 w-4 h-4 dark:text-red-400" />}
                                                                        {item.status === 'referred' && <FaArrowRight title="ارجاع شده" className="text-blue-500 w-3.5 h-3.5 dark:text-blue-400" />}
                                                                </span>
                                                                </span>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">{formatJalaliDateTime(item.created_at)}</span>
                                                 {/* نمایش رونوشت‌ها زیر اطلاعات گیرنده */}
                                                                {item.cc_users && item.cc_users.length > 0 && (
                                                                            <div className="mt-2 flex flex-wrap justify-center gap-1">
                                                                                {item.cc_users.map((ccUser, index) => (
                                                                                    <div key={index} className="flex items-center">
                                                                                        <img
                                                                                            src={ccUser.profile ? `https://automationapi.satia.co/storage/${ccUser.profile}` : "/picture/icons/profile.jpg"}
                                                                                            alt={`${ccUser.first_name} ${ccUser.last_name || ''}`.trim()}
                                                                                            onClick={() => handleImageClick(ccUser.profile ? `https://automationapi.satia.co/storage/${ccUser.profile}` : "/picture/icons/profile.jpg")}
                                                                                            className="w-6 h-6 rounded-full bg-gray-300 cursor-pointer border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-all duration-200 mr-1"
                                                                                        />
                                                                                        <span className="text-xs text-gray-600 dark:text-gray-400">{`${ccUser.first_name} ${ccUser.last_name || ''}`.trim()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        </div>
                                        {item.letter_logs && item.letter_logs.length > 0 && (
                                                    item.letter_logs.map((log, logIndex) => (
                                                        <div
                                                            key={logIndex}
                                                            className="flex justify-start items-stretch w-full p-2 border border-gray-200 rounded-lg mb-3 mt-4 bg-gray-50 shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:shadow-gray-900 relative z-[1]"
                                                        >
                                                            <div className="w-[30%] flex flex-col items-center justify-center p-2">
                                                                <div className="mb-2">
                                                                    <img
                                                                        src={log.user && log.user.profile ? `https://automationapi.satia.co/storage/${log.user.profile}` : "/picture/icons/profile.jpg"}
                                                                        alt={log.user
                                                                            ? `${log.user.first_name || ''} ${log.user.last_name || ''}`.trim() || 'نامشخص'
                                                                            : 'نامشخص'}
                                                                        onClick={() => handleImageClick(log.user && log.user.profile ? `https://automationapi.satia.co/storage/${log.user.profile}` : "/picture/icons/profile.jpg")}
                                                                        className="w-8 h-8 rounded-full bg-gray-300 cursor-pointer border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-all duration-200"
                                                                    />
                                                                </div>
                                                                <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm mb-1">
                                                                    {log.user
                                                                        ? `${log.user.first_name || ''} ${log.user.last_name || ''}`.trim() || 'نامشخص'
                                                    : 'نامشخص'}
                                                </span>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">{formatJalaliDateTime(log.created_at)}</span>
                                                            </div>
                                                            <div className="w-[70%] leading-relaxed m-0 text-gray-700 text-sm dark:text-gray-200">
                                                                <strong className="text-blue-600 dark:text-blue-400">توضیحات:</strong> {log.footnote}
                                                                
                                                                {/* Display files in letter_logs */}
                                                                {log.files && log.files.length > 0 && (
                                                                    <div className="mt-2">
                                                                        <strong className="text-blue-600 dark:text-blue-400">فایل‌های پیوست:</strong>
                                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                                            {log.files.map((file, fileIndex) => (
                                                                                <div key={fileIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                                                                                    {file.url?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                                                                                            <img
                                                                                                src={`${file.url}`}
                                                                                                alt={file.original_name || 'تصویر'}
                                                                                                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                                                                onClick={() => handleImageClick(`${file.url}`)}
                                                />
                                            </div>
                                                                                    ) : (
                                                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                                                                                            {renderFileIcon(getFileIcon(file.original_name))}
                                                                                        </div>
                                                                                    )}
                                                                                    <div className="flex flex-col">
                                                                                        <span className="font-medium text-xs">{file.original_name || 'فایل'}</span>
                                                                                        <a
                                                                                            href={`/${file.url}`}
                                                                                            download
                                                                                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                                                                                        >
                                                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                                            </svg>
                                                                                            دانلود
                                                                                        </a>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                        </div>
                                    </div>
                                                    ))
                                                )}
                                </div>
                            )}


                        </React.Fragment>
                    );
                })}
                                </div>
                            )}
                        </div>

                        {groupIndex < allGroups.length - 1 && (
                            <hr className="border-none border-t-2 border-gray-300 dark:border-gray-600 my-6" />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 dark:bg-black/80" onClick={closeModal}>
                    <div className="relative bg-white dark:bg-gray-800 p-4 rounded-lg max-w-lg w-11/12 text-center shadow-md" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedImage} alt="Profile" className="max-w-full max-h-[60vh] rounded-lg" />
                        <button className="mt-3 px-3 py-1.5 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200 shadow-sm hover:shadow-md" onClick={closeModal}>بستن</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default DocumentFlowTree;