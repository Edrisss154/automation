import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import '../../../styles/Automation/DeleteConfirmModal.scss';

const DeleteConfirmModal = ({ isOpen, toggle, handleDelete }) => (
    <Modal isOpen={isOpen} toggle={toggle} className="delete-confirm-modal">
        <ModalHeader toggle={toggle}>تایید حذف</ModalHeader>
        <ModalBody className="text-center">
            آیا مطمئن هستید که می‌خواهید این پیام را حذف کنید؟
            <img
                src="/picture/icons/Group3293.svg"
                alt="تصویر تایید حذف"
                className="confirm-delete-image"
            />
        </ModalBody>
        <ModalFooter>
            <Button color="danger" onClick={handleDelete}>بله</Button>{' '}
            <Button color="secondary" onClick={toggle}>لغو</Button>
        </ModalFooter>
    </Modal>
);

export default DeleteConfirmModal;
