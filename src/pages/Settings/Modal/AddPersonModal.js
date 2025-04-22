import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

const SelectPersonTypeModal = ({ isOpen, toggle, selectPersonType }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>افزودن شخص جدید</ModalHeader>
            <ModalBody>
                <div className="select-person-type">
                    <Button color="primary" onClick={() => selectPersonType('حقیقی')} className="person-type-btn">
                        <img src="/picture/icons/Group3413.svg" alt="Real Person" />
                        حقیقی
                    </Button>
                    <Button color="secondary" onClick={() => selectPersonType('حقوقی')} className="person-type-btn">
                        <img src="/picture/icons/legal-person.svg" alt="Legal Person" />
                        حقوقی
                    </Button>
                </div>
            </ModalBody>
        </Modal>
    );
};

export default SelectPersonTypeModal;
