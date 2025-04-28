    import React, { useEffect, useState } from 'react';
    import ReactQuill from 'react-quill';
    import 'react-quill/dist/quill.snow.css';
    import { useParams, useNavigate } from 'react-router-dom';
    import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
    import moment from 'moment-jalaali';
    import axios from 'axios';
    import ReferModal from './Modal/ReferModal';
    import InviteModal from './Modal/InviteModal';
    import SuccessModal from './Modal/SuccessModal';
    import {addLetter, getLetterDetails, updateLetter} from '../../api/api';
    import DOMPurify from 'dompurify';
    import useUserRoles from "../hooks/useUserRoles";
    import Select from 'react-select';

    const EditMessage = () => {
        const [selectedFromUser, setSelectedFromUser] = useState(null);
        const [selectedToUser, setSelectedToUser] = useState(null);
        const [successMessage, setSuccessMessage] = useState('');
        const [filteredUsers, setFilteredUsers] = useState([]);
        const [previousFiles, setPreviousFiles] = useState([]);
        const [newFiles, setNewFiles] = useState([]);
        const [startDate, setStartDate] = useState(null);
        const [uploadedFiles, setUploadedFiles] = useState([]);
        const [editorValue, setEditorValue] = useState('');
        const [from, setFrom] = useState('');
        const [footnotes_to, setfootnotes_to] = useState('');
        const [carbonCopy, setCarbonCopy] = useState([]);
        const [importanceLevel, setImportanceLevel] = useState('normal');
        const [importanceLevel1, setImportanceLevel1] = useState('internal');
        const [priorityLevel, setPriorityLevel] = useState('normal');
        const [subject, setSubject] = useState('');
        const [signatureFile, setSignatureFile] = useState(null);
        const [signatoryId, setSignatoryId] = useState('');
        const [letterNumber, setLetterNumber] = useState('');
        const [attachments, setAttachments] = useState([]);
        const [footnotes, setFootnotes] = useState([]);
        const [receivers, setReceivers] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [referData, setReferData] = useState([]);
        const [receiver, setReceiver] = useState('');
        const [direction, setDirection] = useState('');
        const [margin, setMargin] = useState('');
        const [privateNote, setPrivateNote] = useState('');
        const [isAdded, setIsAdded] = useState(false);
        const [showReferModal, setShowReferModal] = useState(false);
        const [showInviteModal, setShowInviteModal] = useState(false);
        const [inviteName, setInviteName] = useState('');
        const [inviteEmail, setInviteEmail] = useState('');
        const [inviteMobile, setInviteMobile] = useState('');
        const [showSuccessModal, setShowSuccessModal] = useState(false);
        const [showReferTableModal, setShowReferTableModal] = useState(false);
        const [newComment, setNewComment] = useState('');
        const [footnoteItems, setFootnoteItems] = useState([]);
        const [newFootnote, setNewFootnote] = useState({ from: '', to: '', text: '' });
        const [removedFootnotes, setRemovedFootnotes] = useState([]);
        const [editIndex, setEditIndex] = useState(null);
        const navigate = useNavigate();
        const { id } = useParams();
        const [users, setUsers] = useState([]);
        const [searchTermCC, setSearchTermCC] = useState('');
        const [filteredFromUsers, setFilteredFromUsers] = useState([]);
        const [searchTermFrom, setSearchTermFrom] = useState('');
        const [filteredCCUsers, setFilteredCCUsers] = useState([]);
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const [footnoteGroups, setFootnoteGroups] = useState([
            { from: '', to: '', content: '' }
        ]);
        const [removedCCUsers, setRemovedCCUsers] = useState([]);
        const { userRoles, selectedRole, setSelectedRole } = useUserRoles();
        const [uploadedFileCount, setUploadedFileCount] = useState(0);
        const handleRoleChange = (event) => {
            setSelectedRole(event.target.value);
        };
        const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);
        const [fromUserId, setFromUserId] = useState('');
        const [toUserId, setToUserId] = useState('');
        const dropdownRef = React.useRef(null);

        useEffect(() => {
            const fetchLetterDetails = async () => {
                try {
                    const data = await getLetterDetails(id);
                    if (data.cc_users && Array.isArray(data.cc_users)) {
                        setCarbonCopy(data.cc_users);
                    } else {
                        setCarbonCopy([]);
                    }
                    setFrom(data.footnotes?.[0]?.from_user?.first_name || '');
                    setfootnotes_to(data.footnotes?.[0]?.to_user_id || '');
                    setNewComment(data.footnotes?.[0]?.content || '');
                    setStartDate(data.registered_at);
                    setEditorValue(data.content);
                    
                    // Convert English values to Persian for display
                    setImportanceLevel(convertImportanceToPersian(data.importance || 'normal'));
                    setPriorityLevel(convertUrgencyToPersian(data.urgency || 'normal'));
                    setImportanceLevel1(convertTypeToPersian(data.type || 'internal'));
                    
                    setSubject(data.subject || '');
                    setSignatureFile(data.user.signature|| null);
                    setSignatoryId(data.signatory_id || '');
                    setLetterNumber(data.number || '');
                    setUploadedFiles(data.attachments || []);
                    setAttachments(data.attachments || []);
                    setFootnotes(data.footnotes || []);
                    setReceivers(data.receivers || []);
                    setPreviousFiles(data.attachments || []);
                    setUploadedFiles(data.attachments || []);

                    if (data.type === "incoming" && data.from_user_id) {
                        const fromUser = users.find(user => user.id === data.from_user_id);
                        if (fromUser) {
                            setSelectedFromUser({
                                value: fromUser.id,
                                label: `${fromUser.first_name} ${fromUser.last_name || ''}`.trim()
                            });
                        }
                    } else if (data.type === "issued" && data.to_user_id) {
                        const toUser = users.find(user => user.id === data.to_user_id);
                        if (toUser) {
                            setSelectedToUser({
                                value: toUser.id,
                                label: `${toUser.first_name} ${toUser.last_name || ''}`.trim()
                            });
                        }
                    }


                    setLoading(false);
                } catch (err) {
                    console.error("Error fetching letter details:", err);
                    setError('مشکلی در دریافت داده‌ها وجود دارد');
                    setLoading(false);
                }
            };

            fetchLetterDetails();
        }, [id,users]);


        useEffect(() => {
            setCarbonCopy([]);

            setFilteredFromUsers(users);

            setFootnoteItems([]);
        }, [users]);
        useEffect(() => {
            const fetchUserData = async () => {
                try {
                    const isContact = importanceLevel1 === "internal" ? 0 : 1;
                    const response = await axios.get('https://automationapi.satia.co/api/users', {
                        params: {
                            token: localStorage.getItem('token'),
                            per_page: 100000}
                    });
                    if (response.data && Array.isArray(response.data.data)) {
                        setUsers(response.data.data);
                        setFilteredUsers(response.data.data);
                    } else {
                        setUsers([]);
                        setFilteredUsers([]);
                        console.error("Unexpected response format:", response.data);
                    }
                } catch (error) {
                    console.error("خطا در دریافت داده‌های کاربر:", error);
                }
            };

            fetchUserData();
        }, [importanceLevel1]);




        const handleSubmitAndRefer = () => {
            setShowReferModal(true);
        };
        useEffect(() => {
            const filtered = users.filter(user =>
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTermFrom.toLowerCase())
            );
            setFilteredFromUsers(filtered);
        }, [searchTermFrom, users]);

        const userOptions = users.map(user => ({
            value: user.id,
            label: `${user.first_name} ${user.last_name || ''}`.trim()
        }));

        const fromUserOptions = users
            .filter(user => user.is_contact === 1)
            .map(user => ({
                value: user.id,
                label: `${user.first_name} ${user.last_name || ''}`.trim()
            }));

        const toUserOptions = users
            .filter(user => user.is_contact === 1)
            .map(user => ({
                value: user.id,
                label: `${user.first_name} ${user.last_name || ''}`.trim()
            }));


        const convertTypeToEnglish = (type) => {
            switch (type) {
                case "داخلی":
                    return "internal";
                case "صادره":
                    return "issued";
                case "وارده":
                    return "incoming";
                default:
                    return type;
            }
        };

        const convertTypeToPersian = (type) => {
            switch (type) {
                case "internal":
                    return "داخلی";
                case "issued":
                    return "صادره";
                case "incoming":
                    return "وارده";
                default:
                    return type;
            }
        };

        const convertImportanceToEnglish = (importance) => {
            switch (importance) {
                case "عادی":
                    return "normal";
                case "محرمانه":
                    return "secret";
                case "سری":
                    return "classified";
                default:
                    return importance;
            }
        };

        const convertImportanceToPersian = (importance) => {
            switch (importance) {
                case "normal":
                    return "عادی";
                case "secret":
                    return "محرمانه";
                case "classified":
                    return "سری";
                default:
                    return importance;
            }
        };

        const convertUrgencyToEnglish = (urgency) => {
            switch (urgency) {
                case "عادی":
                    return "normal";
                case "فوری":
                    return "urgent";
                case "آنی":
                    return "instant";
                default:
                    return urgency;
            }
        };

        const convertUrgencyToPersian = (urgency) => {
            switch (urgency) {
                case "normal":
                    return "عادی";
                case "urgent":
                    return "فوری";
                case "instant":
                    return "آنی";
                default:
                    return urgency;
            }
        };

        const handleChange = (value) => {
            setEditorValue(value);
        };

        const modules = {
            toolbar: [
                [{'header': '1'}, {'header': '2'}, {'font': []}],
                [{'align': []}],
                ['bold', 'italic', 'underline'],
                ['link'],
                [{'indent': '-1'}, {'indent': '+1'}],
                ['blockquote'],
                ['image', 'video'],
                ['code-block']
            ],
        };

        const handleFileUpload = (event, type) => {
            const files = Array.from(event.target.files);

            if (previousFiles.length + newFiles.length + files.length > 2) {
                alert("شما فقط می‌توانید حداکثر ۲ فایل آپلود کنید.");
                return;
            }

            const newUploadedFiles = files.map(file => ({
                file: file,
                type: type,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
            }));

            setNewFiles(prev => [...prev, ...newUploadedFiles]);
            setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
        };

        const removeFile = (index) => {
            if (index < previousFiles.length) {
                const fileToRemove = previousFiles[index];
                setRemovedAttachmentIds(prev => [...prev, fileToRemove.id]);
                const updatedPreviousFiles = previousFiles.filter((_, i) => i !== index);
                setPreviousFiles(updatedPreviousFiles);
            } else {
                const newIndex = index - previousFiles.length;
                const updatedNewFiles = newFiles.filter((_, i) => i !== newIndex);
                setNewFiles(updatedNewFiles);
            }
            setUploadedFiles(prev => prev.filter((_, i) => i !== index));
        };

        const handleSubmit = async (askForNavigation = true) => {
            if (!validateForm()) {
                alert('لطفاً تمام فیلدهای ضروری را پر کنید.');
                return;
            }

            const cleanedEditorValue = DOMPurify.sanitize(editorValue, { ALLOWED_TAGS: [] });
            const gregorianDate = moment(startDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
            const signatoryId = localStorage.getItem('userId');

            if (!signatoryId) {
                alert("شناسه کاربر معتبر نیست. لطفاً دوباره وارد شوید.");
                return;
            }

            const formData = new FormData();
            formData.append('type', convertTypeToEnglish(importanceLevel1));
            formData.append('subject', subject);
            formData.append('content', cleanedEditorValue);
            formData.append('importance', convertImportanceToEnglish(importanceLevel));
            formData.append('urgency', convertUrgencyToEnglish(priorityLevel));
            formData.append('signatory_id', signatoryId);
            formData.append('registered_at', startDate);
            formData.append('_method', 'put');
            formData.append('role_id', selectedRole);

            if (importanceLevel1 === "incoming") {
                formData.append('from_user_id', fromUserId);
            } else if (importanceLevel1 === "issued") {
                formData.append('to_user_id', toUserId);
            }

            if (signatureFile instanceof File) {
                formData.append('signature', signatureFile);
            }
            newFiles.forEach((file, index) => {
                formData.append(`attachments[]`, 'file');
                formData.append(`files[]`, file.file);
            });
            if (removedAttachmentIds.length > 0) {
                removedAttachmentIds.forEach(id => {
                    formData.append('remove_attachment_ids[]', id);
                });
            }
            if (carbonCopy.length !== (receivers.cc || []).length) {
                carbonCopy.forEach(user => {
                    formData.append('cc[]', user.id);
                });

                removedCCUsers.forEach(userId => {
                    formData.append('cc_remove_ids[]', userId);
                });
            }

            if (referData.length > 0) {
                referData.forEach(data => {
                    formData.append('receivers_user_id[]', data.receiver);
                    formData.append('receivers_reason_id[]', data.direction);
                    formData.append('receivers_footnote[]', data.margin);
                    formData.append('receivers_private_message[]', data.privateNote);
                });
            }

            try {
                const response = await updateLetter(id, formData);
                setSuccessMessage("نامه با موفقیت ثبت  شد!");
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                    navigate('/automation');
                }, 2000);

            } catch (err) {
                console.error("Error from server:", err.response?.data || err.message);
                setError("مشکلی در ارسال داده‌ها وجود دارد");
            }
        };

        const handleRemoveUser = (userId) => {
            setCarbonCopy(carbonCopy.filter(user => user.id !== userId));
            setRemovedCCUsers(prev => [...prev, userId]);
        };
        const handleReferSubmit = async (referData) => {
            if (!validateForm()) {
                alert('لطفاً تمام فیلدهای ضروری را پر کنید.');
                return;
            }

            const cleanedEditorValue = DOMPurify.sanitize(editorValue, { ALLOWED_TAGS: [] });
            const gregorianDate = moment(startDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
            const signatoryId = localStorage.getItem('userId');

            if (!signatoryId) {
                alert("شناسه کاربر معتبر نیست. لطفاً دوباره وارد شوید.");
                return;
            }

            const formData = new FormData();
            formData.append('type', convertTypeToEnglish(importanceLevel1));
            formData.append('subject', subject);
            formData.append('content', cleanedEditorValue);
            formData.append('importance', convertImportanceToEnglish(importanceLevel));
            formData.append('urgency', convertUrgencyToEnglish(priorityLevel));
            formData.append('signatory_id', signatoryId);
            formData.append('registered_at', gregorianDate);
            formData.append('_method', 'put');
            formData.append('role_id', selectedRole);
            newFiles.forEach((file, index) => {
                formData.append(`attachments[]`, 'file');
                formData.append(`files[]`, file.file);
            });
            if (removedAttachmentIds.length > 0) {
                removedAttachmentIds.forEach(id => {
                    formData.append('remove_attachment_ids[]', id);
                });
            }
            if (importanceLevel1 === "incoming") {
                formData.append('from_user_id', fromUserId);
            } else if (importanceLevel1 === "issued") {
                formData.append('to_user_id', toUserId);
            }

            if (referData.length > 0) {
                referData.forEach(data => {
                    formData.append('receivers_user_id[]', data.receiver);
                    formData.append('receivers_reason_id[]', data.direction);
                    formData.append('receivers_footnote[]', data.margin);
                    formData.append('receivers_private_message[]', data.privateNote);
                });
            }
            if (carbonCopy.length > 0) {
                carbonCopy.forEach(user => {
                    formData.append('cc[]', user.id);
                });
            }

            for (let [key, value] of formData.entries()) {
            }

            try {
                const response = await updateLetter(id, formData);
                setSuccessMessage("نامه با موفقیت ثبت و ارجاع شد!");
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                    navigate('/automation');
                }, 2000);
                setShowReferModal(false);
            } catch (err) {
                console.error("Error from server:", err.response?.data || err.message);
                setError("مشکلی در ارسال داده‌ها وجود دارد");
                alert("خطا در ثبت نامه. لطفاً دوباره تلاش کنید.");
            }
        };
        const handleAddRefer = () => {
            if (receiver && direction) {
                const newRefer = {
                    receiver,
                    direction,
                    margin,
                    privateNote,
                    selectedRole
                };
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

        const handleCancel = () => {
            navigate('/automation');
        };

        useEffect(() => {
            const filtered = users.filter(user =>
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTermFrom.toLowerCase())
            );
            setFilteredFromUsers(filtered);
        }, [searchTermFrom, users]);





        useEffect(() => {
            const filtered = users.filter(user =>
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTermCC.toLowerCase()) &&
                !carbonCopy.some(ccUser => ccUser.id === user.id)
            );
            setFilteredCCUsers(filtered);
        }, [searchTermCC, users, carbonCopy]);


        const handleSearchCC = (event) => {
            setSearchTermCC(event.target.value);
            setIsDropdownOpen(true);
        };

        const handleSelectUserCC = (user) => {
            if (!carbonCopy.some(ccUser => ccUser.id === user.id)) {
                setCarbonCopy(prev => [...prev, user]);
            }
            setSearchTermCC('');
            setIsDropdownOpen(false);
        };
        const handleInputClick = () => {
            setIsDropdownOpen(true);
        };

        const handleGroupChange = (index, field, value) => {
            const newGroups = [...footnoteGroups];
            newGroups[index][field] = value;
            setFootnoteGroups(newGroups);
        };


        const validateForm = () => {
            return (
                editorValue.trim() !== '' &&
                startDate !== null &&
                subject.trim() !== ''
            );
        };

        if (loading) {
            return <div>در حال بارگذاری...</div>;
        }

        if (error) {
            return <div>خطا: {error}</div>;
        }

        const persianDate = moment(startDate, 'YYYY-MM-DD').locale('fa').format('jYYYY/jMM/jDD');

        return (
            <div className="w-full max-w-4xl mx-auto font-vazir dir-rtl p-4">
                <div className=" dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">ویرایش نامه</h2>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <img src="/picture/icons/semat.svg" alt="User Icon" className="w-6 h-6"/>
                                <label htmlFor="userRole" className="text-gray-700 dark:text-gray-300">سمت:</label>
                                <select
                                    id="userRole"
                                    value={selectedRole}
                                    onChange={handleRoleChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                >
                                    {userRoles.map((role, index) => (
                                        <option key={index} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">شماره:</label>
                                <input
                                    type="text"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    name="number"
                                    value={letterNumber}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">تاریخ:</label>
                                <input
                                    type="text"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    value={persianDate || ""}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="ImportanceLevel1"
                                    value="داخلی"
                                    checked={importanceLevel1 === "داخلی"}
                                    onChange={(e) => setImportanceLevel1(e.target.value)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <span className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">داخلی</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="ImportanceLevel1"
                                    value="صادره"
                                    checked={importanceLevel1 === "صادره"}
                                    onChange={(e) => setImportanceLevel1(e.target.value)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <span className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">صادره</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="ImportanceLevel1"
                                    value="وارده"
                                    checked={importanceLevel1 === "وارده"}
                                    onChange={(e) => setImportanceLevel1(e.target.value)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <span className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">وارده</span>
                            </label>
                        </div>

                        <div className="space-y-2">
                            {importanceLevel1 === "وارده" && (
                                <>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">فرستنده (از مخاطبین غیرداخلی):</label>
                                    <Select
                                        options={fromUserOptions}
                                        value={selectedFromUser}
                                        onChange={(selectedOption) => {
                                            setSelectedFromUser(selectedOption);
                                            setFromUserId(selectedOption ? selectedOption.value : '');
                                        }}
                                        placeholder="انتخاب فرستنده"
                                        isSearchable
                                        noOptionsMessage={() => "نتیجه‌ای یافت نشد"}
                                        className="w-full"
                                    />
                                </>
                            )}
                            {importanceLevel1 === "صادره" && (
                                <>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">گیرنده (به مخاطبین غیرداخلی):</label>
                                    <Select
                                        options={toUserOptions}
                                        value={selectedToUser}
                                        onChange={(selectedOption) => {
                                            setSelectedToUser(selectedOption);
                                            setToUserId(selectedOption ? selectedOption.value : '');
                                        }}
                                        placeholder="انتخاب گیرنده"
                                        isSearchable
                                        noOptionsMessage={() => "نتیجه‌ای یافت نشد"}
                                        className="w-full"
                                    />
                                </>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                موضوع: <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                name="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>

                        <div className="form-group flex flex-col gap-2">
                            <label className="font-bold dark:text-gray-200">
                                متن: <span className="text-red-500">*</span>
                            </label>
                            <div className="dark:bg-gray-700 rounded-lg">
                                <ReactQuill
                                    theme="snow"
                                    value={editorValue}
                                    onChange={handleChange}
                                    modules={modules}
                                    className="w-full text-gray-800 dark:text-gray-200 [&_.ql-toolbar]:dark:bg-gray-600 [&_.ql-toolbar]:dark:border-gray-500 [&_.ql-toolbar_.ql-stroke]:dark:stroke-gray-200 [&_.ql-toolbar_.ql-fill]:dark:fill-gray-200 [&_.ql-toolbar_.ql-picker-label]:dark:text-gray-200 [&_.ql-toolbar_.ql-picker-item]:dark:text-gray-200 [&_.ql-container]:dark:border-gray-500 [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:dark:bg-gray-700 [&_.ql-editor]:dark:text-gray-200"
                                    style={{ direction: "rtl", textAlign: "right" }}
                                />
                            </div>
                        </div>

                        <div className="form-group flex flex-col gap-2">
                            <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold dark:text-gray-200">
                                        سطح اهمیت:
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center dark:text-gray-200">
                                            عادی
                                            <input
                                                type="radio"
                                                name="security"
                                                value="عادی"
                                                checked={importanceLevel === "عادی"}
                                                onChange={(e) => setImportanceLevel(e.target.value)}
                                                className="mr-2 dark:accent-blue-400"
                                            />
                                        </label>
                                        <label className="flex items-center dark:text-gray-200">
                                            محرمانه
                                            <input
                                                type="radio"
                                                name="security"
                                                value="محرمانه"
                                                checked={importanceLevel === "محرمانه"}
                                                onChange={(e) => setImportanceLevel(e.target.value)}
                                                className="mr-2 dark:accent-blue-400"
                                            />
                                        </label>
                                        <label className="flex items-center dark:text-gray-200">
                                            سری
                                            <input
                                                type="radio"
                                                name="security"
                                                value="سری"
                                                checked={importanceLevel === "سری"}
                                                onChange={(e) => setImportanceLevel(e.target.value)}
                                                className="mr-2 dark:accent-blue-400"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group flex flex-col gap-2">
                            <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                                <div className="flex flex-col gap-2">
                                    <label className="font-bold dark:text-gray-200">
                                        فوریت:
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center dark:text-gray-200">
                                            عادی
                                            <input
                                                type="radio"
                                                name="priority"
                                                value="عادی"
                                                checked={priorityLevel === "عادی"}
                                                onChange={(e) => setPriorityLevel(e.target.value)}
                                                className="mr-2 dark:accent-blue-400"
                                            />
                                        </label>
                                        <label className="flex items-center dark:text-gray-200">
                                            فوری
                                            <input
                                                type="radio"
                                                name="priority"
                                                value="فوری"
                                                checked={priorityLevel === "فوری"}
                                                onChange={(e) => setPriorityLevel(e.target.value)}
                                                className="mr-2 dark:accent-blue-400"
                                            />
                                        </label>
                                        <label className="flex items-center dark:text-gray-200">
                                            آنی
                                            <input
                                                type="radio"
                                                name="priority"
                                                value="آنی"
                                                checked={priorityLevel === "آنی"}
                                                onChange={(e) => setPriorityLevel(e.target.value)}
                                                className="mr-2 dark:accent-blue-400"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group flex flex-col gap-2">
                            <label className="font-bold dark:text-gray-200">
                                آپلود/افزودن مدرک:
                            </label>
                            <div className="flex gap-4">
                                <div>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => handleFileUpload(e, "file")}
                                        className="hidden"
                                        id="file-upload-1"
                                        accept="image/*"
                                    />
                                    <label
                                        htmlFor="file-upload-1"
                                        className="px-4 py-2 rounded-md cursor-pointer bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
                                    >
                                        آپلود فایل
                                    </label>
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => handleFileUpload(e, "letter")}
                                        className="hidden"
                                        id="file-upload-2"
                                        accept="image/*"
                                    />
                                    <label
                                        htmlFor="file-upload-2"
                                        className="px-4 py-2 rounded-md cursor-pointer bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
                                    >
                                        افزودن مدرک
                                    </label>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                {uploadedFiles.map((file, index) => (
                                    <div key={index} className="relative group">
                                        {file.preview || (file.file && file.file.type.startsWith("image/")) ? (
                                            <div className="relative">
                                                <img
                                                    src={file.preview || URL.createObjectURL(file.file)}
                                                    alt={`Uploaded ${index}`}
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-100 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                                    title="حذف تصویر"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : file.attachmentable?.url ? (
                                            <div className="relative">
                                                <img
                                                    src={file.attachmentable.url}
                                                    alt={`Uploaded ${index}`}
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-100 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                                    title="حذف تصویر"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center relative">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {file.name || 'فایل'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-100 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                                    title="حذف فایل"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group flex flex-col gap-2 relative" ref={dropdownRef}>
                            <label
                                className={`font-bold dark:text-gray-200`}
                            >
                                رونوشت:
                            </label>
                            <div className="relative w-1/2">
                                <input
                                    type="text"
                                    className={`border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200`}
                                    value={searchTermCC}
                                    onChange={handleSearchCC}
                                    onClick={handleInputClick}
                                    placeholder="نام مخاطب را وارد کنید..."
                                />
                                {isDropdownOpen && filteredCCUsers.length > 0 && (
                                    <ul
                                        className={`absolute w-full max-h-60 overflow-y-auto border rounded-md shadow-md z-10 mt-1 bg-gray-0 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200`}
                                    >
                                        {filteredCCUsers.map((user) => (
                                            <li
                                                key={user.id}
                                                onClick={() => handleSelectUserCC(user)}
                                                className={`p-2 cursor-pointer text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 flex items-center gap-2`}
                                            >
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white overflow-hidden">
                                                    {user.profile ? (
                                                        <img 
                                                            src={`${user.profile}`}
                                                            alt={`${user.first_name} ${user.last_name}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-medium">
                                                            {user.first_name?.[0]?.toUpperCase() || ''}{user.last_name?.[0]?.toUpperCase() || ''}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.first_name} {user.last_name}</span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">{user.email || 'بدون ایمیل'}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="selected-users flex flex-wrap gap-2 mt-2">
                            {carbonCopy.map((user) => (
                                <span
                                    key={user.id}
                                    className={`flex items-center rounded-md p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white overflow-hidden">
                                            {user.profile_url || user.profile ? (
                                                <img 
                                                    src={user.profile_url || `https://automationapi.satia.co/storage/${user.profile}`}
                                                    alt={`${user.first_name} ${user.last_name}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FFFFFF"><text x="50%" y="50%" font-size="12" fill="%23FFFFFF" text-anchor="middle" dy=".3em">${user.first_name?.[0]?.toUpperCase() || ''}${user.last_name?.[0]?.toUpperCase() || ''}</text></svg>`;
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-sm font-medium">
                                                    {user.first_name?.[0]?.toUpperCase() || ''}{user.last_name?.[0]?.toUpperCase() || ''}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.first_name} {user.last_name}</span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{user.email || 'بدون ایمیل'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveUser(user.id)}
                                        className="mr-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-full transition-colors duration-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </span>
                            ))}
                        </div>

                        <div className="form-actions flex justify-end gap-4 flex-wrap">
                            <button
                                type="button"
                                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 dark:bg-green-700 dark:hover:bg-green-800 dark:disabled:bg-gray-600 transition-colors duration-200"
                                onClick={handleSubmit}
                                disabled={!validateForm() || isSubmitting}
                            >
                                ویرایش
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 dark:bg-blue-700 dark:hover:bg-blue-800 dark:disabled:bg-gray-600 transition-colors duration-200"
                                onClick={handleSubmitAndRefer}
                                disabled={!validateForm() || isSubmitting}
                            >
                                ثبت و ارجاع
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200"
                                onClick={handleCancel}
                            >
                                انصراف
                            </button>
                        </div>
                    </form>
                </div>

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
                    userRoles={userRoles}
                    letterType={importanceLevel1}
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

                <Modal isOpen={showReferTableModal} toggle={() => setShowReferTableModal(false)}>
                    <ModalHeader toggle={() => setShowReferTableModal(false)}>ارجاع داده‌ها</ModalHeader>
                    <ModalBody>
                        <button
                            type="button"
                            onClick={handleAddRefer}
                            className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                        >
                            اضافه کردن
                        </button>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">گیرنده</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">جهت</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">هامش</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">یادداشت خصوصی</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">سمت</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {referData.map((data, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{data.receiver}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{data.direction}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{data.margin}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{data.privateNote}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{data.selectedRole}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => setShowReferTableModal(false)}>بستن</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }

    export default EditMessage;
