import ReactDOMServer from 'react-dom/server';
import html2pdf from 'html2pdf.js';
import PrintView from './PrintView';

const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      console.log(`Image loaded successfully: ${url}`);
      resolve(url);
    };
    img.onerror = (error) => {
      console.error(`Failed to load image: ${url}`, error);
      reject(new Error(`Failed to load image: ${url}`));
    };
  });
};

export const handlePrint = async (message, letterTemplate) => {
  const backgroundPath = letterTemplate?.background_path || '';
  if (backgroundPath) {
    try {
      await preloadImage(backgroundPath);
    } catch (error) {
      console.error('Failed to preload background image for print:', error);
    }
  }

  const printContent = ReactDOMServer.renderToString(
    <PrintView message={message} backgroundPath={backgroundPath} />
  );

  const printWindow = window.open('', '_blank');

  printWindow.document.write(`
    <html>
      <head>
        <title>پرینت نامه</title>
        <meta charset="UTF-8">
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0;
              background: none;
            }
            .page {
              page-break-after: always;
              width: 210mm;
              height: 297mm;
              position: relative;
              overflow: hidden;
            }
            .background-image {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              object-fit: fill;
              z-index: 0;
              print-color-adjust: exact !important;
            }
            .content {
              position: relative;
              z-index: 10;
              color: #000000 !important;
              background: transparent;
            }
            p, h1, span {
              color: #000000 !important;
              opacity: 1 !important;
            }
            @font-face {
              font-family: 'Vazir';
              src: url('https://cdn.fontcdn.ir/Fonts/Vazir/Vazir.woff') format('woff');
              font-weight: normal;
            }
            body, html {
              font-family: 'Vazir', Arial, sans-serif;
              direction: rtl;
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
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};
export const handleDownloadPDF = async (message, letterTemplate) => {
  const backgroundPath = letterTemplate?.background_path || '';
  if (backgroundPath) {
    try {
      await preloadImage(backgroundPath);
    } catch (error) {
      console.error('Failed to preload background image for PDF:', error);
    }
  }

  const element = document.createElement('div');
  element.innerHTML = ReactDOMServer.renderToString(
    <PrintView message={message} backgroundPath={backgroundPath} />
  );

  const opt = {
    margin: [0, 0, 0, 0],
    filename: `نامه-${message.number}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: true,
      allowTaint: true,
      windowWidth: 794,
      windowHeight: 1123,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      hotfixes: ['px_scaling'],
    },
    pagebreak: { mode: ['css', 'legacy'], after: '.page' }, // اطمینان از شکستن صفحات
  };

  await html2pdf().set(opt).from(element).save();
};

export const handlePrintAndDownload = async (message, setPrintLoading, letterTemplate) => {
  setPrintLoading(true);
  try {
    //await handleDownloadPDF(message, letterTemplate);
    await handlePrint(message, letterTemplate);
  } catch (error) {
    console.error('Error in print/download:', error);
  } finally {
    setPrintLoading(false);
  }
};