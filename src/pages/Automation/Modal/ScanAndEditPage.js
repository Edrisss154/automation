import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

const ScanAndEditPage = () => {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [cropper, setCropper] = useState(null);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCrop = () => {
        if (cropper) {
            setCroppedImage(cropper.getCroppedCanvas().toDataURL());
        }
    };

    const handleSave = () => {
        if (croppedImage) {
            localStorage.setItem("scannedImage", croppedImage);
            navigate(-1);
        }
    };

    return (
        <div className="scan-edit-page">
            <h1>اسکن و ویرایش عکس</h1>
            <div className="upload-section">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                />
            </div>
            {image && (
                <div className="cropper-section">
                    <Cropper
                        src={image}
                        style={{ height: 400, width: "100%" }}
                        aspectRatio={1}
                        guides={true}
                        crop={handleCrop}
                        onInitialized={(instance) => setCropper(instance)}
                    />
                </div>
            )}
            {croppedImage && (
                <div className="preview-section">
                    <h2>پیش‌نمایش عکس کراپ شده:</h2>
                    <img
                        src={croppedImage}
                        alt="Cropped"
                        style={{ maxWidth: "100%", height: "auto" }}
                    />
                </div>
            )}
            <div className="actions">
                <button onClick={handleCrop}>کراپ</button>
                <button onClick={handleSave}>ذخیره و بازگشت</button>
            </div>
        </div>
    );
};

export default ScanAndEditPage;