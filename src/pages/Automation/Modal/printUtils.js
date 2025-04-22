import ReactDOMServer from 'react-dom/server';
import html2pdf from 'html2pdf.js';
import PrintView from './PrintView';

export const handlePrint = (message) => {
    const printContent = ReactDOMServer.renderToString(<PrintView message={message} />);
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
        <html>
            <head>
                <title>پرینت نامه</title>
                <style>
                    @media print {
                        .print-view {
                            font-family: 'B Nazanin', Arial, sans-serif;
                            direction: rtl;
                            text-align: right;
                            padding: 20px;
                            background-color: #fff;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .print-header {
                            text-align: center;
                            margin-bottom: 20px;
                        }
                        .print-header h1 {
                            font-size: 24px;
                            margin-bottom: 10px;
                        }
                        .print-header p {
                            font-size: 16px;
                            color: #555;
                        }
                        .print-details {
                            margin-bottom: 20px;
                        }
                        .detail-row {
                            justify-content: space-between;
                            margin-bottom: 10px;
                        }
                        .detail-label {
                            font-weight: bold;
                        }
                        .detail-value {
                            font-weight: normal;
                            color: #333;
                        }
                        .print-content {
                            margin-bottom: 20px;
                        }
                        .print-content p {
                            font-size: 16px;
                            line-height: 1.5;
                        }
                        .print-signature {
                            text-align: center;
                        }
                        .signature-preview {
                            max-width: 150px;
                            margin-bottom: 10px;
                        }
                        .print-signature p {
                            font-size: 16px;
                            font-weight: bold;
                        }
                    }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
};

export const handleDownloadPDF = async (message) => {
    const element = document.createElement('div');
    element.innerHTML = ReactDOMServer.renderToString(<PrintView message={message} />);

    const opt = {
        margin: [1.5,1],
        filename: `نامه-${message.number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: true,
            allowTaint: true
        },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' ,   hotfixes: ["px_scaling"] }
    };

    await html2pdf().set(opt).from(element).save();
};

export const handlePrintAndDownload = async (message, setPrintLoading) => {
    setPrintLoading(true);
    await handleDownloadPDF(message);
    handlePrint(message);
    setPrintLoading(false);
};