import React, { useEffect, useState, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input } from 'reactstrap';
import { getLetterDetails, getUserById, referLetter } from '../../../api/api';
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
        if (replyContent.trim() && lastSenderId) {
            const formData = new FormData();
            formData.append('receivers_user_id[]', lastSenderId);
            formData.append('receivers_reason_id[]', directions[0]?.id || '1');
            formData.append('receivers_footnote[]', replyContent);
            formData.append('receivers_private_message[]', privateNote1);
            formData.append('role_id', localStorage.getItem('roleId') || '1');

            try {
                await referLetter(documentId, formData);
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
                className="document-flow-modal"
                size="xl"
                style={{ maxWidth: '90vw', width: '1000px' }}
            >
                <ModalHeader className="modal-header" style={{ backgroundColor: 'rgba(23, 76, 114, 1)', borderBottom: '1px solid #dee2e6' }}>
                    گردش سند
                </ModalHeader>
                <ModalBody
                    style={{
                        direction: 'rtl',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        padding: '20px',
                        backgroundColor: '#ffffff',
                    }}
                >
                    <h4 className="document-title" style={{ marginBottom: '20px', color: '#2c3e50' }}>گردش سند نامه</h4>
                    {letterType === "incoming" && senderName && (
                        <div className="sender-info" style={{ marginBottom: '10px' }}>
                            <strong>فرستنده:</strong> {senderName}
                        </div>
                    )}
                    {letterType === "issued" && receiverName && (
                        <div className="receiver-info" style={{ marginBottom: '10px' }}>
                            <strong>ارسال به:</strong> {receiverName}
                        </div>
                    )}
                    {letterType === "internal" && (
                        <div className="internal-info" style={{ marginBottom: '10px' }}>
                            <strong>نامه درون سازمانی</strong>
                        </div>
                    )}
                    {loading ? (
                        <div style={{ textAlign: 'center', color: '#666' }}>یک نامه انتخاب کنید</div>
                    ) : error ? (
                        <div className="text-danger" style={{ textAlign: 'center' }}>{error}</div>
                    ) : (
                        <DocumentFlowTree
                            data={documentData}
                            currentUserId={currentUserId}
                            letterDetails={letterDetails}
                        />
                    )}




                </ModalBody>
                <ModalFooter style={{ backgroundColor: '#ffffff', borderTop: '1px solid #dee2e6' }}>
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