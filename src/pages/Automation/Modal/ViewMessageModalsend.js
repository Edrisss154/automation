import React, { useState, useEffect } from 'react';
import '../../../styles/Automation/ViewMessageModal.scss';
import {Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Collapse} from 'reactstrap';
import ReferModal from './ReferModal';
import InviteModal from './InviteModal';
import SuccessModal from './SuccessModal';
import HamishModal from './HamishModal';
import AttachmentModal from './AttachModal';
import axios from 'axios';
import {getLetterDetails, updateLetter, getServerURL, referLetter} from '../../../api/api';
import moment from 'jalali-moment';
import { useNavigate } from "react-router-dom";
import useUserRoles from "../../hooks/useUserRoles";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import { handlePrint, handleDownloadPDF, handlePrintAndDownload } from './printUtils';
import DocumentFlowModal from "./DocumentFlowModal";

const ViewMessageModal = ({ isOpen, toggle, messageId }) => {
    const currentUserId = localStorage.getItem('userId');
    const [successMessage, setSuccessMessage] = useState('');

    const [message, setMessage] = useState(null);
    const [signature, setSignature] = useState('');
    const [content, setContent] = useState('');
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { userRoles, selectedRole, setSelectedRole, signatoryId } = useUserRoles();
    const [isPrintLoading, setPrintLoading] = useState(false);
    const [showDocumentFlowModal, setShowDocumentFlowModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(0);
    useEffect(() => {
        if (messageId) {
            setSelectedMessageId(messageId);
            const token = localStorage.getItem('token');

            axios.get(`https://automationapi.satia.co/api/letters/${messageId}?token=${token}`)
                .then(response => {
                    console.log("Response from API:", response.data);
                    setMessage(response.data);
                    setSignature(response.data.signature);
                    setContent(response.data.content);
                })
                .catch(error => {
                    console.error("Error fetching message details:", error);
                });
        }
    }, [messageId]);

    const translateImportance = (importance) => {
        switch (importance) {
            case 'normal':
                return 'عادی';
            case 'secret':
                return 'محرمانه';
            case 'classified':
                return 'سری';
            default:
                return importance;
        }
    };

    const translateUrgency = (urgency) => {
        switch (urgency) {
            case 'normal':
                return 'عادی';
            case 'urgent':
                return 'فوری';
            case 'instant':
                return 'انی';
            default:
                return urgency;
        }
    };
    const translateDocumentType = (type) => {
        switch (type) {
            case 'internal':
                return 'داخلی';
            case 'issued':
                return 'صادره';
            case 'incoming':
                return 'وارده';
            default:
                return type;
        }
    };

    const [showReferModal, setShowReferModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showHamishModal, setShowHamishModal] = useState(false);
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);

    const [referData, setReferData] = useState([]);
    const [receiver, setReceiver] = useState('');
    const [direction, setDirection] = useState('');
    const [margin, setMargin] = useState('');
    const [privateNote, setPrivateNote] = useState('');
    const [isAdded, setIsAdded] = useState(false);

    const [attachments, setAttachments] = useState([]);

    const handleAddRefer = () => {
        if (!isAdded && receiver && direction) {
            const newRefer = {
                receiver,
                direction,
                margin,
                privateNote
            };
            setReferData([newRefer]);
            setIsAdded(true);

            setReceiver('');
            setDirection('');
            setMargin('');
            setPrivateNote('');
        } else {
            alert("لطفاً تمامی فیلدهای ضروری را پر کنید.");
        }
    };

    const handleAttachSubmit = async (attachments, selectedMessageId) => {
        if (!selectedMessageId) {
            setSuccessMessage('هیچ پیامی انتخاب نشده است.');
            setShowSuccessModal(true);
            return;
        }

        try {
            const letterDetails = await getLetterDetails(selectedMessageId);
            console.log("Letter details before update:", letterDetails);

            const formData = new FormData();
            formData.append('type', letterDetails.type || 'internal');
            formData.append('subject', letterDetails.subject || '');
            formData.append('content', letterDetails.content || '');
            formData.append('importance', letterDetails.importance || 'normal');
            formData.append('urgency', letterDetails.urgency || 'normal');
            formData.append('signatory_id', letterDetails.signatory_id || '');
            formData.append('registered_at', letterDetails.registered_at || moment().format('YYYY-MM-DD'));
            formData.append('_method', 'put');
            formData.append('role_id', selectedRole || '1'); // مشابه EditMessage

            attachments.forEach((attachment, index) => {
                formData.append(`attachments[]`, 'file');
                formData.append(`files[]`, attachment.file);
            });

            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            const response = await updateLetter(selectedMessageId, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log("Response from server:", response);

            setSuccessMessage('فایل‌ها با موفقیت به نامه اضافه شدند!');
            setShowSuccessModal(true);
            setShowAttachmentModal(false);

            const updatedLetter = await getLetterDetails(selectedMessageId);
            setMessage(updatedLetter);

            setTimeout(() => {
                setShowSuccessModal(false);
                // navigate('/automation');
            }, 2000);
        } catch (err) {
            console.error("Error from server:", err.response?.data || err.message);
            setSuccessMessage('مشکلی در آپلود فایل‌ها رخ داده است: ' + (err.message || 'خطای ناشناخته'));
            setShowSuccessModal(true);
        }
    };
    const persianDate = message ? moment(message.registered_at, 'YYYY-MM-DD').locale('fa').format('YYYY/MM/DD') : '';
    const handleEdit = () => {
        if (selectedMessageId !== null) {
            navigate(`/automation/editmessage/${selectedMessageId}`);
        } else {
            setError("هیچ پیامی انتخاب نشده است.");
        }
    };
    const [isPrivateNoteOpen, setPrivateNoteOpen] = useState(false);

    const togglePrivateNote = () => setPrivateNoteOpen(!isPrivateNoteOpen);
    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleString('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const openImageModal = (index) => {
        setSelectedAttachmentIndex(index);
        setShowImageModal(true);
    };

    const closeImageModal = () => {
        setShowImageModal(false);
    };

    const nextImage = () => {
        if (message.attachments && selectedAttachmentIndex < message.attachments.length - 1) {
            setSelectedAttachmentIndex(selectedAttachmentIndex + 1);
        }
    };

    const prevImage = () => {
        if (selectedAttachmentIndex > 0) {
            setSelectedAttachmentIndex(selectedAttachmentIndex - 1);
        }
    };

    const downloadFile = (url, filename) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'file';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const getSortedAttachments = () => {
        if (!message?.attachments) return { images: [], files: [] };
        const images = message.attachments.filter(attachment =>
            attachment.attachmentable?.url?.match(/\.(jpeg|jpg|png|gif)$/i)
        );
        const files = message.attachments.filter(
            attachment => !attachment.attachmentable?.url?.match(/\.(jpeg|jpg|png|gif)$/i)
        );
        return { images, files };
    };

    const { images, files } = getSortedAttachments();


    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-right align-middle transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 bg-[rgba(23,76,114,1)] text-white">
                                <h3 className="text-lg font-semibold">{message?.subject}</h3>
                                <button 
                                    onClick={toggle}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    &times;
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto bg-gray-0 dark:bg-gray-800">
                                {message ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800 dark:text-gray-300">
                                            <p className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                                <span className="font-medium">نوع سند:</span>
                                                <span className="text-gray-700 dark:text-gray-400">{translateDocumentType(message.type)}</span>
                                            </p>
                                            <p className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                                <span className="font-medium">شماره:</span>
                                                <span className="text-gray-700 dark:text-gray-400">{message.number}</span>
                                            </p>
                                            <p className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                                <span className="font-medium">تاریخ:</span>
                                                <span className="text-gray-700 dark:text-gray-400">{persianDate}</span>
                                            </p>
                                            <p className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                                <span className="font-medium">سطح اهمیت:</span>
                                                <span className="text-gray-700 dark:text-gray-400">{translateImportance(message.importance)}</span>
                                            </p>
                                            <p className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                                <span className="font-medium">سطح فوریت:</span>
                                                <span className="text-gray-700 dark:text-gray-400">{translateUrgency(message.urgency)}</span>
                                            </p>
                                            <p className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                                <span className="font-medium">ایجاد کننده:</span>
                                                <span className="text-gray-700 dark:text-gray-400">{message.user.first_name} {message.user.last_name}</span>
                                            </p>
                                            <p className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                                <span className="font-medium">امضا کننده:</span>
                                                <span className="text-gray-700 dark:text-gray-400">{message.signatory.first_name} {message.signatory.last_name}</span>
                                            </p>
                                        </div>

                                        <div className="prose dark:prose-invert max-w-none">
                                            <p className="text-gray-800 dark:text-gray-300 leading-7">{content}</p>
                                        </div>

                                        <div className="flex justify-center border-t border-b border-gray-200 dark:border-gray-700 py-4">
                                            <img src={message.user.signature} alt="امضا" className="max-h-24 object-contain"/>
                                        </div>

                                        {/* Footnotes 
                                        {message.footnotes && message.footnotes.length > 0 && (
                                            <div className="space-y-2 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">هامش/پاراف</h4>
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                                        <thead className="bg-gray-100 dark:bg-gray-600">
                                                            <tr>
                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">از طرف</th>
                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">خطاب به</th>
                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">متن هامش</th>
                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">تاریخ ثبت</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-600">
                                                            {message.footnotes.map((item, index) => (
                                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                                        {item.from_user
                                                                            ? `${item.from_user.first_name || ''}${item.from_user.first_name && item.from_user.last_name ? ' ' : ''}${item.from_user.last_name || ''}`.trim() || 'نامشخص'
                                                                            : 'نامشخص'}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                                        {item.to_user
                                                                            ? `${item.to_user.first_name || ''}${item.to_user.first_name && item.to_user.last_name ? ' ' : ''}${item.to_user.last_name || ''}`.trim() || 'نامشخص'
                                                                            : 'نامشخص'}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.content}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{formatDateTime(item.created_at)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                            */}

                                        {/* CC Users */}
                                        {message.cc_users && message.cc_users.length > 0 && (
                                            <div className="space-y-2 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">رونوشت به</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {message.cc_users.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className="px-4 py-2 bg-gray-0 dark:bg-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300 shadow-sm"
                                                            title={`${item.first_name} ${item.last_name}`}
                                                        >
                                                            {item.first_name} {item.last_name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Attachments */}
                                        {message.attachments && message.attachments.length > 0 && (
                                            <div className="space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">فایل‌های پیوست</h4>
                                                {/* Images */}
                                                {images.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h5 className="text-md font-medium text-gray-700 dark:text-gray-300">تصاویر</h5>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                            {images.map((attachment, index) => (
                                                                <div key={index} className="relative group bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
                                                                    <img
                                                                        src={attachment.attachmentable.url}
                                                                        alt={`Image ${index}`}
                                                                        className="w-full h-32 object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
                                                                        onClick={() => openImageModal(index)}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Files */}
                                                {files.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h5 className="text-md font-medium text-gray-700 dark:text-gray-300">فایل‌ها</h5>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {files.map((attachment, index) => (
                                                                <a
                                                                    key={index}
                                                                    href={attachment.attachmentable?.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center p-3 bg-white dark:bg-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors shadow-sm"
                                                                >
                                                                    <span className="text-[rgba(23,76,114,1)] dark:text-blue-400">
                                                                        {attachment.attachmentable?.url ? 'مشاهده فایل' : 'فایل بدون لینک'}
                                                                    </span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">داده‌ای برای نمایش وجود ندارد.</p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex flex-wrap gap-2 justify-end">
                                    <button
                                        onClick={() => handlePrintAndDownload(message, setPrintLoading)}
                                        disabled={isPrintLoading}
                                        className="bg-[rgba(23,76,114,1)] hover:bg-[rgba(18,60,90,1)] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                    >
                                        {isPrintLoading ? 'در حال پردازش...' : 'پرینت و دانلود'}
                                    </button>
                                    {message?.user_id === parseInt(currentUserId) && (
                                        <button
                                            onClick={handleEdit}
                                            className="bg-[rgba(23,76,114,1)] hover:bg-[rgba(18,60,90,1)] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                                        >
                                            <img src="/picture/icons/Group 3290.svg" alt="ویرایش" className="w-5 h-5"/>
                                            ویرایش
                                        </button>
                                    )}
                                    {message?.user_id === parseInt(currentUserId) && (
                                        <button
                                            onClick={() => setShowAttachmentModal(true)}
                                            className="bg-[rgba(23,76,114,1)] hover:bg-[rgba(18,60,90,1)] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                                        >
                                            <img src="/picture/icons/peivast.svg" alt="پیوست" className="w-5 h-5"/>
                                            پیوست
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowDocumentFlowModal(true)}
                                        className="bg-[rgba(23,76,114,1)] hover:bg-[rgba(18,60,90,1)] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                                    >
                                        <img src="/picture/icons/Group.svg" alt="گردش سند" className="w-5 h-5"/>
                                        گردش سند
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {showImageModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-right align-middle transition-all transform bg-gray-0 dark:bg-gray-800 rounded-lg shadow-xl">
                            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">پیش‌نمایش فایل</h3>
                                <button
                                    onClick={closeImageModal}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    &times;
                                </button>
                            </div>

                            <div className="relative bg-gray-0 dark:bg-gray-800">
                                {message && images && images[selectedAttachmentIndex] && (
                                    <div className="relative">
                                        <button
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-gray-0 p-2 rounded-full hover:bg-opacity-75 disabled:opacity-30"
                                            onClick={prevImage}
                                            disabled={selectedAttachmentIndex === 0}
                                        >
                                            &#10094;
                                        </button>
                                        <img
                                            src={images[selectedAttachmentIndex].attachmentable.url}
                                            alt={`Attachment ${selectedAttachmentIndex}`}
                                            className="max-h-[70vh] w-full object-contain"
                                        />
                                        <button
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-gray-0 p-2 rounded-full hover:bg-opacity-75 disabled:opacity-30"
                                            onClick={nextImage}
                                            disabled={selectedAttachmentIndex === images.length - 1}
                                        >
                                            &#10095;
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => downloadFile(
                                        images[selectedAttachmentIndex].attachmentable.url,
                                        `image_${selectedAttachmentIndex}`
                                    )}
                                    className="bg-[rgba(23,76,114,1)] hover:bg-[rgba(18,60,90,1)] text-gray-0 px-4 py-2 rounded-lg transition-colors"
                                >
                                    دانلود
                                </button>
                                <button
                                    onClick={closeImageModal}
                                    className="bg-red-600 hover:bg-red-700 text-gray-0 px-4 py-2 rounded-lg transition-colors"
                                >
                                    بستن
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AttachmentModal
                isOpen={showAttachmentModal}
                toggle={() => setShowAttachmentModal(false)}
                handleAttachSubmit={handleAttachSubmit}
                selectedMessageId={messageId}
            />

            <InviteModal
                isOpen={showInviteModal}
                toggle={() => setShowInviteModal(false)}
                handleSendInvite={() => {
                    setShowInviteModal(false);
                    setShowSuccessModal(true);
                }}
                inviteName=""
                setInviteName={() => {}}
                inviteEmail=""
                setInviteEmail={() => {}}
                inviteMobile=""
                setInviteMobile={() => {}}
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
        </>
    );
};

export default ViewMessageModal;