import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input } from 'reactstrap';
import { getLetterDetails, getUserById, updateLetterreferer } from '../../../api/api';
import DocumentFlowTree from './DocumentFlowTree';
import '../../../styles/Automation/DocumentFlowModal.scss';
import Select from 'react-select';
import axios from 'axios';
import ReferModal from '../Modal/ReferModal';

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
    const currentUserId = localStorage.getItem('userId');

    useEffect(() => {
        if (isOpen) {
            resetState();
            fetchUsers();
            fetchDirections();
        }
    }, [isOpen, currentUserId]);

    useEffect(() => {
        if (documentId && isOpen) {
            fetchLetterDetails();
        }
    }, [documentId, isOpen, currentUserId]);

    const resetState = () => {
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
    };

    const fetchUsers = () => {
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
    };

    const fetchDirections = () => {
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
    };

    const fetchLetterDetails = async () => {
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
                } else {
                    setTargetName(getDisplayName(lastReceiver.from_user || response.user));
                }
            } else {
                setLastSenderId(response.user?.id);
                setTargetName(getDisplayName(response.user));
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
    };

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

        try {
            const letterDetails = await getLetterDetails(documentId);

            // آماده‌سازی داده‌ها مشابه Mymessage
            if (!letterDetails.receivers_user_id) letterDetails.receivers_user_id = [];
            if (!letterDetails.receivers_reason_id) letterDetails.receivers_reason_id = [];
            if (!letterDetails.receivers_footnote) letterDetails.receivers_footnote = [];
            if (!letterDetails.receivers_private_message) letterDetails.receivers_private_message = [];

            referData.forEach(data => {
                letterDetails.receivers_user_id.push(data.receiver);
                letterDetails.receivers_reason_id.push(data.direction);
                letterDetails.receivers_footnote.push(data.margin);
                letterDetails.receivers_private_message.push(data.privateNote);
            });

            const response = await updateLetterreferer(documentId, letterDetails);
            console.log("Response from server:", response);
            alert('ارجاع با موفقیت انجام شد!');
            setReferData([]);
            setShowReferModal(false);
            toggle();
        } catch (error) {
            console.error('Error referring letter:', error.response?.data || error.message);
            alert('خطا در ارجاع!');
        }
    };

    const handleReply = async () => {
        if (replyContent.trim() && lastSenderId) {
            try {
                const letterDetails = await getLetterDetails(documentId);

                if (!letterDetails.receivers_user_id) letterDetails.receivers_user_id = [];
                if (!letterDetails.receivers_reason_id) letterDetails.receivers_reason_id = [];
                if (!letterDetails.receivers_footnote) letterDetails.receivers_footnote = [];
                if (!letterDetails.receivers_private_message) letterDetails.receivers_private_message = [];

                letterDetails.receivers_user_id.push(lastSenderId);
                letterDetails.receivers_reason_id.push(directions[0]?.id || '1');
                letterDetails.receivers_footnote.push(replyContent);
                letterDetails.receivers_private_message.push(privateNote1);

                await updateLetterreferer(documentId, letterDetails);
                alert('پاسخ با موفقیت ارجاع شد!');
                setReplyContent('');
                setPrivateNote1('');
                toggle();
            } catch (error) {
                console.error('Error referring reply:', error);
                alert('خطا در ارجاع پاسخ!');
            }
        } else {
            alert('لطفاً متن پاسخ را وارد کنید!');
        }
    };

    const userOptions = users.map(user => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name || ''}`.trim()
    }));

    const directionOptions = directions.map(dir => ({
        value: dir.id,
        label: dir.title
    }));

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

                    <div className="mt-5 p-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
                        <h5 className="mb-4 text-gray-700 dark:text-gray-200">
                            {lastSenderId === parseInt(currentUserId)
                                ? `ارسال به آخرین گیرنده (${targetName || 'نامشخص'})`
                                : `پاسخ به آخرین فرستنده (${targetName || 'نامشخص'})`}
                        </h5>
                        <Input
                            type="textarea"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="پاسخ خود را اینجا بنویسید..."
                            className="mb-4 min-h-[100px] dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />
                        <Input
                            type="textarea"
                            value={privateNote1}
                            onChange={(e) => setPrivateNote1(e.target.value)}
                            placeholder="پیام خصوصی خود را اینجا بنویسید..."
                            className="mb-4 min-h-[100px] dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />

                        <Button color="success" onClick={handleReply}>
                            پاسخ سریع
                        </Button>
                    </div>

                    <Button
                        color="primary"
                        onClick={() => setShowReferModal(true)}
                        className="mt-5 mb-2.5"
                    >
                        ارجاع جدید
                    </Button>
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