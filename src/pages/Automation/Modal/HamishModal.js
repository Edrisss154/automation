import React, { useState, useEffect } from 'react';
import '../../../styles/Automation/HamishModal.scss';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, FormGroup, Label, Table } from 'reactstrap';
import { addFootnote, getUsersLetterable } from '../../../api/api';
import { toast, ToastContainer } from 'react-toastify';
import SuccessModal from "./SuccessModal";
import { useNavigate } from 'react-router-dom';

const HamishModal = ({ isOpen, toggle, letterId }) => {
    const [hamishItems, setHamishItems] = useState([]);
    const [newHamish, setNewHamish] = useState({ from: '', to: '', text: '', date: '', time: '' });
    const [editIndex, setEditIndex] = useState(null);
    const [users, setUsers] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getUsersLetterable();
                setUsers(response.data.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    const handleChange = (field, value) => {
        setNewHamish({ ...newHamish, [field]: value });
    };

    const getCurrentDateTime = () => {
        const current = new Date();
        const date = current.toLocaleDateString('fa-IR');
        const time = current.toLocaleTimeString('fa-IR');
        return { date, time };
    };

    const addHamishItem = () => {
        if (newHamish.to && newHamish.text) {
            const dateTime = getCurrentDateTime();
            const user = users.find(user => user.id === parseInt(newHamish.to));
            if (user) {
                setHamishItems([...hamishItems, { ...newHamish, ...dateTime, to_name: `${user.first_name} ${user.last_name}` }]);
                setNewHamish({ from: '', to: '', text: '', date: '', time: '' });
                toast.success("هامش با موفقیت اضافه شد!");
            }
        } else {
            toast.error("لطفاً تمامی فیلدهای ضروری را پر کنید.");
        }
    };


    const editHamishItem = (index) => {
        const item = hamishItems[index];
        setNewHamish(item);
        setEditIndex(index);
    };

    const saveEditHamishItem = () => {
        const dateTime = getCurrentDateTime();
        const updatedItems = [...hamishItems];
        updatedItems[editIndex] = { ...newHamish, date: dateTime.date, time: dateTime.time };
        setHamishItems(updatedItems);
        setEditIndex(null);
        setNewHamish({ from: '', to: '', text: '', date: '', time: '' });
    };

    const removeHamishItem = (index) => {
        setHamishItems(hamishItems.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        hamishItems.forEach(hamish => {
            const formData = new FormData();
            formData.append('to_user_id', hamish.to);
            formData.append('content', hamish.text);

            addFootnote(letterId, formData);
        });
        toggle();
        setSuccessMessage("نامه دریافتی ارجاع شد!");
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(true);
            navigate('/automation');
        }, 1);    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} className="hamish-modal">
            <ModalHeader toggle={toggle} className="modal-header-blue">هامش</ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label for="to">خطاب به:</Label>
                    <div className="input-with-button">
                        <select
                            className="form-control"
                            value={newHamish.to}
                            onChange={(e) => handleChange('to', e.target.value)}
                        >
                            <option value="">انتخاب گیرنده</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.first_name} {user.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </FormGroup>
                <FormGroup>
                    <Label for="text">متن هامش:</Label>
                    <Input
                        type="textarea"
                        name="text"
                        id="text"
                        value={newHamish.text}
                        onChange={(e) => handleChange('text', e.target.value)}
                        rows="3"
                    />
                </FormGroup>
                {editIndex === null ? (
                    <div className="add-hamish-button" onClick={addHamishItem}>
                        <img src="/picture/icons/Group3247.svg" alt="افزودن هامش"/>
                    </div>
                ) : (
                    <Button color="primary" onClick={saveEditHamishItem}>ذخیره ویرایش</Button>
                )}
                {hamishItems.length > 0 && editIndex === null && (
                    <Table striped>
                        <thead>
                        <tr>
                            <th>خطاب به</th>
                            <th>متن هامش</th>
                            <th>تاریخ</th>
                            <th>زمان</th>
                            <th>عملیات</th>
                        </tr>
                        </thead>
                        <tbody>
                        {hamishItems.map((item, index) => (
                            <tr key={index}>
                                <td>{item.to_name}</td>
                                <td>{item.text}</td>
                                <td>{item.date}</td>
                                <td>{item.time}</td>
                                <td>
                                    <img
                                        src="/picture/icons/edite1.svg"
                                        alt="ویرایش"
                                        onClick={() => editHamishItem(index)}
                                        className="icon-action"
                                    />
                                    <img
                                        src="/picture/icons/delete.svg"
                                        alt="حذف"
                                        onClick={() => removeHamishItem(index)}
                                        className="icon-action"
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                )}

            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleSave}>ذخیره</Button>
                <Button color="secondary" onClick={toggle}>انصراف</Button>
            </ModalFooter>
            <SuccessModal
                isOpen={showSuccessModal}
                toggle={() => setShowSuccessModal(false)}
                message={successMessage}

            />
        </Modal>
    );
};

export default HamishModal;
