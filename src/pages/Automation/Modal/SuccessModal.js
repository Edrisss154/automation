import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

const SuccessModal = ({ isOpen, toggle, message }) => (
    <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}></ModalHeader>
        <ModalBody>
            {message}
        </ModalBody>
        <ModalFooter>
            <Button color="primary" onClick={toggle}>بستن</Button>
        </ModalFooter>
    </Modal>
);

export default SuccessModal;


