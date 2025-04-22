import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { Resizable } from 're-resizable';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { updateLetterTemplate } from '../../../api/api';
import 'react-resizable/css/styles.css';

const EditHeaderModal = ({ isOpen, toggle, headerData, updateHeader }) => {
    const [title, setTitle] = useState(headerData.title || '');
    const [templateType, setTemplateType] = useState(headerData.type || 'A4');
    const [backgroundImage, setBackgroundImage] = useState(headerData.background_path || null);
    const [backgroundImageFile, setBackgroundImageFile] = useState(null);
    const [font, setFont] = useState(headerData.font_family || '');
    const [fontSize, setFontSize] = useState(headerData.font_size || '');
    const [droppedElements, setDroppedElements] = useState(headerData.template || []);
    const dropAreaRef = useRef(null);

    useEffect(() => {
        if (headerData) {
            setTitle(headerData.title || '');
            setTemplateType(headerData.type || 'A4');
            setFont(headerData.font_family || '');
            setFontSize(headerData.font_size || '');
            setDroppedElements(headerData.template || []);
            setBackgroundImage(headerData.background_path || null);
        }
    }, [headerData]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBackgroundImage(URL.createObjectURL(file));
            setBackgroundImageFile(file);
        }
    };

    const handleDragStop = (e, data, element) => {
        const updatedElements = droppedElements.map(el =>
            el.id === element.id ? { ...el, x: data.x, y: data.y } : el
        );
        setDroppedElements(updatedElements);
    };

    const handleResizeStop = (event, direction, ref, delta, element) => {
        const updatedElements = droppedElements.map(el =>
            el.id === element.id ? { ...el, width: ref.style.width, height: ref.style.height } : el
        );
        setDroppedElements(updatedElements);
    };

    const handleRemoveElement = (id) => {
        setDroppedElements(droppedElements.filter(el => el.id !== id));
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('type', templateType);
        formData.append('font_family', font);
        formData.append('font_size', fontSize);

        if (backgroundImageFile) {
            formData.append('background', backgroundImageFile);
        }

        const elementData = droppedElements.map(el => ({
            id: el.id,
            label: el.label,
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height
        }));

        formData.append('template', JSON.stringify(elementData));
        formData.append('_method', 'put');

        try {
            const response = await updateLetterTemplate(headerData.id, formData);
            console.log('Response:', response);
            updateHeader(response);
            toggle();
             window.location.href = '/settings/Headers';

        } catch (error) {
            console.error('Error updating letter template:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" className="rtl">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                {/* Modal Header */}
                <div className="bg-blue-900 dark:bg-blue-800 px-6 py-4 flex justify-between items-center rounded-t-lg">
                    <h3 className="text-xl font-bold text-white">ویرایش سربرگ</h3>
                    <button onClick={toggle} className="text-white hover:text-gray-200">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-x-auto">
                    {/* Form Container - Now responsive */}
                    <div className="w-full mb-6">
                        <form className="space-y-4 max-w-3xl mx-auto">
                            {/* Title Input */}
                            <div className="space-y-2">
                                <label className="block text-black dark:text-gray-200 text-sm font-medium">عنوان</label>
                                <input 
                                    type="text" 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                                />
                            </div>

                            {/* Template Type Select */}
                            <div className="space-y-2">
                                <label className="block text-black dark:text-gray-200 text-sm font-medium">نوع قالب</label>
                                <select 
                                    value={templateType} 
                                    disabled
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                                >
                                    <option value="A4">A4</option>
                                    <option value="A5">A5</option>
                                    <option value="A3">A3</option>
                                </select>
                            </div>

                            {/* Background Image Input */}
                            <div className="space-y-2">
                                <label className="block text-black dark:text-gray-200 text-sm font-medium">تصویر زمینه</label>
                                <input 
                                    type="file" 
                                    onChange={handleImageChange}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                                />
                            </div>

                            {/* Font Input */}
                            <div className="space-y-2">
                                <label className="block text-black dark:text-gray-200 text-sm font-medium">فونت</label>
                                <input 
                                    type="text" 
                                    value={font} 
                                    onChange={(e) => setFont(e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                                />
                            </div>

                            {/* Font Size Input */}
                            <div className="space-y-2">
                                <label className="block text-black dark:text-gray-200 text-sm font-medium">اندازه فونت</label>
                                <input 
                                    type="number" 
                                    value={fontSize} 
                                    onChange={(e) => setFontSize(e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-black"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Drop Area Container - Fixed width with horizontal scroll */}
                    <div className="overflow-x-auto">
                        <div 
                            ref={dropAreaRef} 
                            className="mt-6 border-2 border-dashed border-gray-300 dark:border-gray-600 relative bg-cover bg-center bg-no-repeat overflow-hidden"
                            style={{ 
                                backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                                width: '794px',  // A4 width in pixels (72 dpi)
                                height: '1123px', // A4 height in pixels (72 dpi)
                                margin: '0 auto'
                            }}
                        >
                            {droppedElements.map((element) => (
                                <Draggable
                                    key={element.id}
                                    position={{ x: element.x, y: element.y }}
                                    onStop={(e, data) => handleDragStop(e, data, element)}
                                    bounds="parent"
                                >
                                    <Resizable
                                        size={{ width: element.width, height: element.height }}
                                        minWidth={50}
                                        minHeight={30}
                                        maxWidth={400}
                                        maxHeight={200}
                                        onResizeStop={(e, direction, ref, delta) => handleResizeStop(e, direction, ref, delta, element)}
                                    >
                                        <div className="p-2 bg-white dark:bg-gray-700 shadow-md relative w-full h-full cursor-move">
                                            <span className="text-gray-900 dark:text-black">{element.label}</span>
                                            <button 
                                                onClick={() => handleRemoveElement(element.id)}
                                                className="absolute top-0 right-0 p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </Resizable>
                                </Draggable>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 flex justify-between items-center rounded-b-lg">
                    <button 
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
                    >
                        ثبت
                    </button>
                    <button 
                        onClick={toggle}
                        className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
                    >
                        انصراف
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditHeaderModal;
