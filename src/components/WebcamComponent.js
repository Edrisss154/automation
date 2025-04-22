import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";

const WebcamComponent = ({ onCapture }) => {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
        onCapture(imageSrc);
    }, [webcamRef, onCapture]);

    return (
        <div>
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                height="auto"
                mirrored={true}
            />

            <button onClick={capture} style={{ marginTop: '10px' }}>
                گرفتن عکس
            </button>

            {imgSrc && (
                <div style={{ marginTop: '10px' }}>
                    <img
                        src={imgSrc}
                        alt="Captured"
                        style={{ width: '100%', height: 'auto', maxWidth: '300px' }}
                    />
                </div>
            )}
        </div>
    );
};

export default WebcamComponent;