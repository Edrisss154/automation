import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import '../../../styles/Automation/InviteModal.scss';

const InviteModal = ({ isOpen, toggle, handleSendInvite, inviteName, setInviteName, inviteEmail, setInviteEmail, inviteMobile, setInviteMobile }) => (
    <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>دعوت به نامه چی</ModalHeader>
        <ModalBody>
            <div className="invite-form">
                <label htmlFor="inviteName">نام مخاطب:</label>
                <input type="text" id="inviteName" name="inviteName" className="form-input" value={inviteName} onChange={(e) => setInviteName(e.target.value)} required/>

                <label htmlFor="inviteEmail">ایمیل مخاطب:</label>
                <input type="email" id="inviteEmail" name="inviteEmail" className="form-input" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required/>

                <label htmlFor="inviteMobile">موبایل مخاطب:</label>
                <input type="text" id="inviteMobile" name="inviteMobile" className="form-input" value={inviteMobile} onChange={(e) => setInviteMobile(e.target.value)} required/>
            </div>
        </ModalBody>
        <ModalFooter>
            <Button color="primary" onClick={handleSendInvite} >ارسال</Button>{' '}
            <Button color="secondary" onClick={toggle}>لغو</Button>
        </ModalFooter>
    </Modal>
);

export default InviteModal;
