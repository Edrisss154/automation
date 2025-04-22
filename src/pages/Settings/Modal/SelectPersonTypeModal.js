import React from 'react';

const SelectPersonTypeModal = ({ isOpen, toggle, selectPersonType }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={toggle}
            />

            {/* Modal Content */}
            <div className="fixed inset-0 flex items-center justify-center">
                <div 
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={toggle}
                        className="absolute top-2 left-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Modal Body */}
                    <div className="flex flex-col items-center space-y-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-black mb-4">
                            انتخاب نوع شخص
                        </h3>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <button
                                onClick={() => selectPersonType('حقیقی')}
                                className="flex-1 px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                            >
                                حقیقی
                            </button>
                            <button
                                onClick={() => selectPersonType('حقوقی')}
                                className="flex-1 px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                            >
                                حقوقی
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectPersonTypeModal;
