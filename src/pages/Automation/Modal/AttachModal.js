import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input } from 'reactstrap';
import '../../../styles/Automation/AttachModal.scss';

const AttachModal = ({ isOpen, toggle, handleAttachSubmit, selectedMessageId }) => {
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);

        const filePreviews = selectedFiles.map(file => {
            if (file.type.startsWith('image/')) {
                return URL.createObjectURL(file);
            }
            return null;
        });
        setPreviews(filePreviews);
    };

    const handleRemoveFile = (index) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        const updatedPreviews = previews.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        setPreviews(updatedPreviews);
    };


    const handleSave = () => {
        if (files.length === 0) {
            alert('لطفاً حداقل یک فایل انتخاب کنید.');
            return;
        }

        const formattedFiles = files.map(file => ({
            file: file,
            type: 'file'
        }));

        handleAttachSubmit(formattedFiles, selectedMessageId);
        setFiles([]);
        setPreviews([]);
        toggle();
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} className="attach-modal">
            <ModalHeader toggle={toggle} className="modal-header-blue">پیوست</ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label for="files">فایل پیوست:</Label>
                    <Input
                        type="file"
                        name="files"
                        id="files"
                        onChange={handleFileChange}
                        multiple
                        accept="image/*,application/pdf"
                    />
                </FormGroup>

                {/*  پیش‌نمایش فایل‌ها */}
                {previews.length > 0 && (
                    <div className="file-previews">
                        {previews.map((preview, index) => (
                            <div key={index} className="file-preview">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt={`Preview ${index}`}
                                        style={{ maxWidth: '100px', maxHeight: '100px', margin: '5px' }}
                                    />
                                ) : (
                                    <span>{files[index].name}</span>
                                )}
                                <Button
                                    color="danger"
                                    size="sm"
                                    onClick={() => handleRemoveFile(index)}
                                    style={{ marginLeft: '10px' }}
                                >
                                    حذف
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleSave} disabled={files.length === 0}>
                    ذخیره
                </Button>
                <Button color="secondary" onClick={toggle}>
                    انصراف
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default AttachModal;