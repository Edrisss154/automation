import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import WebcamComponent from "../../../components/WebcamComponent";

const ScannerModal = ({ isOpen, toggle, onScan }) => {
    const [scannedImages, setScannedImages] = useState([]);

    const handleScan = (image) => {
        setScannedImages([...scannedImages, image]);
        onScan(image);
    };

    const handleRemoveScannedImage = (index) => {
        setScannedImages(scannedImages.filter((_, i) => i !== index));
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>اسکن آنلاین</ModalHeader>
            <ModalBody>
                <WebcamComponent onCapture={handleScan} />

                <div className="scanned-images">
                    {scannedImages.map((image, index) => (
                        <div key={index} className="scanned-image">
                            <img src={image} alt={`Scanned ${index}`} style={{ width: '100px', height: '100px', marginRight: '10px' }} />
                            <button
                                type="button"
                                onClick={() => handleRemoveScannedImage(index)}
                                className="remove-file-btn"
                            >
                                حذف
                            </button>
                        </div>
                    ))}
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={toggle}>بستن</Button>
            </ModalFooter>
        </Modal>
    );
};

export default ScannerModal;
