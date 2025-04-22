import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input } from 'reactstrap';
import { getLetterDetails, getUserById, referLetter } from '../../../api/api';
import DocumentFlowTree from './DocumentFlowTree';
import Select from 'react-select';
import axios from 'axios';
import ReferModal from '../Modal/ReferModal';

// Custom styles for react-select (converted to Tailwind where possible)
const customStyles = {
    control: (provided) => ({
        ...provided,
        minHeight: '40px',
        borderRadius: '0.3125rem', // 5px
        border: '1px solid #ccc',
        direction: 'rtl',
        boxShadow: 'none',
        '&:hover': {
            borderColor: '#666',
        },
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
        direction: 'rtl',
        borderRadius: '0.3125rem', // 5px
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    }),
    option: (provided, state) => ({
        ...provided,
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem', // 10px
        padding: '0.625rem', // 10px
        backgroundColor: state.isSelected ? '#e9ecef' : state.isFocused ? '#f1f3f5' : '#fff',
        color: '#2c3e50',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: '#f1f3f5',
        },
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: '#e9ecef',
        borderRadius: '0.9375rem', // 15px
        display: 'flex',
        alignItems: 'center',
        margin: '0.125rem', // 2px
        padding: '0.125rem 0.3125rem', // 2px 5px
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        display: 'flex',
        alignItems: 'center',
        gap: '0.3125rem', // 5px
        padding: '0.125rem 0.3125rem', // 2px 5px
        fontSize: '0.9em',
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        cursor: 'pointer',
        padding: '0.125rem 0.3125rem', // 2px 5px
        borderRadius: '50%',
        '&:hover': {
            backgroundColor: '#dc3545',
            color: '#fff',
        },
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#999',
    }),
};

// Custom component for displaying options with image
const CustomOption = ({ data, innerProps, isSelected }) => (
    <div {...innerProps} className="flex items-center gap-2.5 p-2.5">
        <img
            src={data.profile ? `${data.profile}` : "/picture/icons/profile.jpg"}
            alt={data.label || 'کاربر'}
            className="w-[30px] h-[30px] rounded-full object-cover"
            onError={(e) => (e.target.src = "/picture/icons/profile.jpg")}
        />
        <span>{data.label || 'نامشخص'}</span>
    </div>
);

// Custom component for displaying selected values with image
const CustomMultiValue = ({ data, removeProps }) => (
    <div className="flex items-center gap-1.5 bg-gray-200 rounded-[15px] p-[2px_5px]">
        <img
            src={data.profile ? `${data.profile}` : "/picture/icons/profile.jpg"}
            alt={data.label || 'کاربر'}
            className="w-5 h-5 rounded-full object-cover"
            onError={(e) => (e.target.src = "/picture/icons/profile.jpg")}
        />
        <span>{data.label || 'نامشخص'}</span>
        <span {...removeProps} className="cursor-pointer p-[0_5px]">×</span>
    </div>
);

const DocumentFlowModal = ({ isOpen, toggle, documentId }) => {
    const [documentData, setDocumentData] = useState([]);
    const [letterDetails, setLetterDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [senderName, setSenderName] = useState('');
    const [receiverName, setReceiverName] = useState('');
    const [letterType, setLetterType] = useState('');
    const [creatorId, setCreatorId] = useState(null);
    const [lastSenderId, setLastSenderId] = useState(null);
    const [lastReceiverId, setLastReceiverId] = useState(null);
    const [targetName, setTargetName] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [users, setUsers] = useState([]);
    const [directions, setDirections] = useState([]);
    const [receiver, setReceiver] = useState('');
    const [direction, setDirection] = useState('');
    const [margin, setMargin] = useState('');
    const [privateNote, setPrivateNote] = useState('');
    const [privateNote1, setPrivateNote1] = useState('');
    const [showReferModal, setShowReferModal] = useState(false);
    const [referData, setReferData] = useState([]);
    const [isAdded, setIsAdded] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const currentUserId = localStorage.getItem('userId');
    const selectRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setDocumentData([]);
            setLetterDetails(null);
            setLoading(true);
            setError(null);
            setSenderName('');
            setReceiverName('');
            setLetterType('');
            setCreatorId(null);
            setLastSenderId(null);
            setLastReceiverId(null);
            setTargetName('');
            setReplyContent('');
            setReceiver('');
            setDirection('');
            setMargin('');
            setPrivateNote('');
            setPrivateNote1('');
            setShowReferModal(false);
            setReferData([]);
            setIsAdded(false);
            setSelectedUsers([]);

            axios.get('https://automationapi.satia.co/api/users', {
                params: { token: localStorage.getItem('token') }
            })
                .then(response => {
                    if (response.data && Array.isArray(response.data.data)) {
                        const filteredUsers = response.data.data.filter(user => user.id !== parseInt(currentUserId));
                        setUsers(filteredUsers);
                    }
                })
                .catch(error => console.error("Error fetching users:", error));

            axios.get('https://automationapi.satia.co/api/letter-reasons', {
                params: { token: localStorage.getItem('token') }
            })
                .then(response => {
                    if (response.data && Array.isArray(response.data)) {
                        setDirections(response.data);
                        setDirection(response.data[0]?.id || '');
                    }
                })
                .catch(error => console.error("Error fetching directions:", error));
        }
    }, [isOpen, currentUserId]);

    useEffect(() => {
        const fetchLetterDetails = async () => {
            if (documentId && isOpen) {
                try {
                    const response = await getLetterDetails(documentId);
                    const flowData = formatDocumentFlowData(response);
                    setDocumentData(flowData);
                    setLetterDetails(response);
                    setLoading(false);
                    setLetterType(response.type);
                    setCreatorId(response.user?.id);

                    if (response.receivers && response.receivers.length > 0) {
                        const lastReceiver = response.receivers[response.receivers.length - 1];
                        const lastSender = lastReceiver.from_user?.id || response.user?.id;
                        setLastSenderId(lastSender);
                        setLastReceiverId(lastReceiver.to_user?.id || null);

                        if (lastSender === parseInt(currentUserId)) {
                            setTargetName(getDisplayName(lastReceiver.to_user));
                            setLastSenderId(lastReceiver.to_user?.id);
                            if (lastReceiver.to_user) {
                                setSelectedUsers([{
                                    value: lastReceiver.to_user.id,
                                    label: getDisplayName(lastReceiver.to_user),
                                    profile: lastReceiver.to_user.profile,
                                    id: lastReceiver.to_user.id,
                                    first_name: lastReceiver.to_user.first_name,
                                    last_name: lastReceiver.to_user.last_name,
                                }]);
                            }
                        } else {
                            setTargetName(getDisplayName(lastReceiver.from_user || response.user));
                            if (lastReceiver.from_user || response.user) {
                                const targetUser = lastReceiver.from_user || response.user;
                                setSelectedUsers([{
                                    value: targetUser.id,
                                    label: getDisplayName(targetUser),
                                    profile: targetUser.profile,
                                    id: targetUser.id,
                                    first_name: targetUser.first_name,
                                    last_name: targetUser.last_name,
                                }]);
                            }
                        }
                    } else {
                        setLastSenderId(response.user?.id);
                        setTargetName(getDisplayName(response.user));
                        if (response.user) {
                            setSelectedUsers([{
                                value: response.user.id,
                                label: getDisplayName(response.user),
                                profile: response.user.profile,
                                id: response.user.id,
                                first_name: response.user.first_name,
                                last_name: response.user.last_name,
                            }]);
                        }
                    }

                    if (response.type === "incoming" && response.from_user_id) {
                        const user = await getUserById(response.from_user_id);
                        setSenderName(getDisplayName(user));
                    } else if (response.type === "issued" && response.to_user_id) {
                        const user = await getUserById(response.to_user_id);
                        setReceiverName(getDisplayName(user));
                    }
                } catch (error) {
                    console.error("Error fetching letter details:", error);
                    setError("خطا در دریافت اطلاعات نامه");
                    setLoading(false);
                }
            }
        };

        fetchLetterDetails();
    }, [documentId, isOpen, currentUserId]);

    const getDisplayName = (user) => {
        if (!user) return 'نامشخص';
        if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
        return user.first_name || user.last_name || 'نامشخص';
    };

    const formatDocumentFlowData = (letterDetails) => {
        const flowData = [];
        flowData.push({
            sender: getDisplayName(letterDetails.user),
            receiver: null,
            receiver_id: null,
            status: 'ایجاد شده',
            content: letterDetails.content,
            footnote: letterDetails.footnote,
            private_message: letterDetails.private_message,
            children: [],
        });

        const buildTree = (receivers) =>
            receivers.map((receiver) => {
                const receiverNode = {
                    sender: getDisplayName(receiver.from_user),
                    receiver: getDisplayName(receiver.to_user),
                    receiver_id: receiver.to_user?.id,
                    status: receiver.status,
                    content: receiver.content,
                    footnote: receiver.footnote,
                    private_message: receiver.private_message,
                    children: [],
                };
                if (receiver.children && receiver.children.length > 0) {
                    receiverNode.children = buildTree(receiver.children);
                }
                return receiverNode;
            });

        if (letterDetails.receivers && letterDetails.receivers.length > 0) {
            flowData[0].children = buildTree(letterDetails.receivers);
        }
        return flowData;
    };

    const handleAddRefer = () => {
        if (receiver && direction) {
            const newRefer = {
                receiver,
                direction,
                margin,
                privateNote,
                selectedRole: localStorage.getItem('roleId') || '1',
            };
            setReferData([...referData, newRefer]);
            setIsAdded(true);
            setReceiver('');
            setDirection('');
            setMargin('');
            setPrivateNote('');
        } else {
            alert("لطفاً گیرنده و جهت را انتخاب کنید.");
        }
    };

    const handleReferSubmit = async (referData) => {
        if (referData.length === 0) {
            alert("لطفاً حداقل یک ارجاع اضافه کنید.");
            return;
        }

        const formData = new FormData();
        referData.forEach(data => {
            formData.append('receivers_user_id[]', data.receiver);
            formData.append('receivers_reason_id[]', data.direction);
            formData.append('receivers_footnote[]', data.margin);
            formData.append('receivers_private_message[]', data.privateNote);
            formData.append('role_id', data.selectedRole || localStorage.getItem('roleId') || '1');
        });

        try {
            await referLetter(documentId, formData);
            alert('ارجاع با موفقیت انجام شد!');
            setReferData([]);
            setShowReferModal(false);
            toggle();
        } catch (error) {
            console.error('Error referring letter:', error);
            alert('خطا در ارجاع!');
        }
    };

    const handleReply = async () => {
        if (replyContent.trim() && selectedUsers.length > 0) {
            const formData = new FormData();
            selectedUsers.forEach(user => {
                formData.append('receivers_user_id[]', user.value);
                formData.append('receivers_reason_id[]', directions[0]?.id || '1');
                formData.append('receivers_footnote[]', replyContent);
                formData.append('receivers_private_message[]', privateNote1);
            });
            formData.append('role_id', localStorage.getItem('roleId') || '1');

            try {
                await referLetter(documentId, formData);
                alert('پاسخ با موفقیت ارجاع شد!');
                setReplyContent('');
                setPrivateNote1('');
                setSelectedUsers([]);
                toggle();
            } catch (error) {
                console.error('Error referring reply:', error);
                alert('خطا در ارجاع پاسخ!');
            }
        } else {
            alert('لطفاً متن پاسخ را وارد کنید و حداقل یک گیرنده انتخاب کنید!');
        }
    };

    const userOptions = users.map(user => ({
        value: user.id,
        label: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'نامشخص',
        profile: user.profile || null,
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
    }));

    const directionOptions = directions.map(dir => ({
        value: dir.id,
        label: dir.title,
    }));

    const closeSelectMenu = () => {
        if (selectRef.current) {
            selectRef.current.blur();
        }
    };

    const clearSelectedUsers = () => {
        setSelectedUsers([]);
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                toggle={toggle}
                className="w-full max-w-[90vw] md:max-w-[1000px] font-vazir"
                size="xl"
            >
                <ModalHeader className="bg-[#174C72] border-b border-gray-200 text-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
                    گردش سند
                </ModalHeader>
                <ModalBody className="dir-rtl max-h-[80vh] overflow-y-auto p-5 bg-gray-0 dark:bg-gray-900">
                    <h4 className="mb-5 text-gray-700 dark:text-gray-200">گردش سند نامه</h4>
                    {letterType === "incoming" && senderName && (
                        <div className="mb-2.5 dark:text-gray-200">
                            <strong>فرستنده:</strong> {senderName}
                        </div>
                    )}
                    {letterType === "issued" && receiverName && (
                        <div className="mb-2.5 dark:text-gray-200">
                            <strong>ارسال به:</strong> {receiverName}
                        </div>
                    )}
                    {letterType === "internal" && (
                        <div className="mb-2.5 dark:text-gray-200">
                            <strong>نامه درون سازمانی</strong>
                        </div>
                    )}
                    {loading ? (
                        <div className="text-center text-gray-600 dark:text-gray-400">یک نامه انتخاب کنید</div>
                    ) : error ? (
                        <div className="text-center text-red-500 dark:text-red-400">{error}</div>
                    ) : (
                        <DocumentFlowTree
                            data={documentData}
                            currentUserId={currentUserId}
                            letterDetails={letterDetails}
                        />
                    )}
                </ModalBody>
                <ModalFooter className="bg-gray-50 border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                    <Button color="secondary" onClick={toggle}>
                        بستن
                    </Button>
                </ModalFooter>
            </Modal>

            <ReferModal
                isOpen={showReferModal}
                toggle={() => setShowReferModal(false)}
                letterType={letterType}
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
                selectedRole={localStorage.getItem('roleId') || '1'}
                isAdded={isAdded}
                setShowInviteModal={() => {}}
                setIsAdded={setIsAdded}
                onSubmitRefer={handleReferSubmit}
                selectedMessageId={documentId}
                userRoles={[]}
            />
        </>
    );
};

export default DocumentFlowModal;