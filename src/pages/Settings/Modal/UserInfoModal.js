import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

const UserInfoModal = ({ isOpen, toggle, personType }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                افزودن اطلاعات {personType}
            </ModalHeader>
            <ModalBody>
                <input type="text" placeholder="نام" />
                <input type="text" placeholder="نام خانوادگی" />
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={toggle}>ذخیره</Button>
                <Button color="secondary" onClick={toggle}>لغو</Button>
            </ModalFooter>
        </Modal>
    );
};

export default UserInfoModal;
