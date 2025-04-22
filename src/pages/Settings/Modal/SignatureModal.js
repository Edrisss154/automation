import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Button } from 'reactstrap';

const SignatureModal = ({ isOpen, toggle }) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleFileUpload = () => {
        if (selectedFile) {
            alert(`فایل ${selectedFile.name} با موفقیت آپلود شد`);
        } else {
            alert("لطفاً یک فایل انتخاب کنید.");
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle} style={{ borderBottom: 'none' }}>
                <Label for="mobile">افزودن امضا الکترونیک</Label>

            </ModalHeader>
            <ModalBody>
                <Form>
                    <FormGroup>
                        <Label for="person">انتخاب شخص</Label>
                        <Input type="select" name="person" id="person">
                            <option>شخص 1</option>
                            <option>شخص 2</option>
                            <option>شخص 3</option>
                        </Input>
                    </FormGroup>
                    <FormGroup>
                        <Label for="file">فایل امضا</Label>
                        <div className="file-upload-icon">
                            <input type="file" name="file" id="file" onChange={handleFileChange}
                                   style={{display: 'none'}}/>
                            <img src="/picture/icons/setting/Group 3347.svg" alt="Upload Icon"
                                 onClick={() => document.getElementById('file').click()} className="upload-icon"/>
                        </div>
                    </FormGroup>
                </Form>
            </ModalBody>
            <ModalFooter style={{justifyContent: 'center'}}>
                <Button color="primary" onClick={handleFileUpload}>ثبت امضا</Button>{' '}
            </ModalFooter>
        </Modal>
    );
};

export default SignatureModal;
