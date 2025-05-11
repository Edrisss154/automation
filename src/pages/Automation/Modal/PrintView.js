import React from 'react';
import moment from 'jalali-moment';

const PrintView = ({ message, backgroundPath }) => {
  const persianDate = message
    ? moment(message.registered_at, 'YYYY-MM-DD').locale('fa').format('YYYY/MM/DD')
    : '';

  const translateImportance = (importance) => {
    switch (importance) {
      case 'normal':
        return 'عادی';
      case 'secret':
        return 'محرمانه';
      case 'classified':
        return 'سری';
      default:
        return importance;
    }
  };

  const translateUrgency = (urgency) => {
    switch (urgency) {
      case 'normal':
        return 'عادی';
      case 'urgent':
        return 'فوری';
      case 'instant':
        return 'انی';
      default:
        return urgency;
    }
  };

  const translateDocumentType = (type) => {
    switch (type) {
      case 'internal':
        return 'داخلی';
      case 'issued':
        return 'صادره';
      case 'incoming':
        return 'وارده';
      default:
        return type;
    }
  };

  // Split content into lines for pagination
  const contentLines = message?.content ? message.content.split('\n') : [];
  const linesPerPage = 28; // تنظیم تعداد خطوط در هر صفحه
  const pages = [];
  for (let i = 0; i < contentLines.length; i += linesPerPage) {
    pages.push(contentLines.slice(i, i + linesPerPage));
  }
  if (pages.length === 0) pages.push([]);

  return (
    <>
      {pages.map((pageLines, pageIndex) => (
        <div
          key={pageIndex}
          className="page relative w-[210mm] h-[297mm] box-border font-sans text-right bg-white"
          style={{ fontFamily: "'Vazir', Arial, sans-serif" }}
        >
          {/* Background Image for Each Page */}
          {backgroundPath && (
            <img
              src={backgroundPath}
              alt="Background"
              className="absolute top-0 left-0 w-full h-full object-fill z-0"
              crossOrigin="anonymous"
            />
          )}

          <div className="relative z-10 px-12 py-16">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="text-sm">
                <span>شماره: {message?.number}</span>
              </div>
              <div className="text-sm">
                <span>تاریخ: {persianDate}</span>
              </div>
            </div>

            {/* Subject */}
            <h1 className="text-center text-lg font-semibold mb-8">{message?.subject}</h1>

            {/* Details */}
            <div className="border-t border-b border-gray-900 py-4 mb-8 text-sm">
              <div className="flex justify-between mb-2">
                <span className="font-bold">نوع سند:</span>
                <span>{translateDocumentType(message?.type)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-bold">سطح اهمیت:</span>
                <span>{translateImportance(message?.importance)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-bold">سطح فوریت:</span>
                <span>{translateUrgency(message?.urgency)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-bold">ایجاد کننده:</span>
                <span>
                  {message?.user?.first_name} {message?.user?.last_name}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-bold">امضا کننده:</span>
                <span>
                  {message?.signatory?.first_name} {message?.signatory?.last_name}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="text-base leading-7 max-h-[calc(297mm-180mm)] overflow-hidden">
              {pageLines.map((line, index) => (
                <p key={index} className="mb-2 break-inside-avoid">
                  {line}
                </p>
              ))}
            </div>

            {/* Signature (only on last page) */}
            {/* {pageIndex === pages.length - 1 && message?.signatory?.signature && (
              <div className="absolute bottom-16 w-full text-center">
                <img
                  src={message.signatory.signature}
                  alt="امضا"
                  className="max-w-[150px] mx-auto mb-2"
                />
                <p className="text-sm font-bold">
                  {message?.signatory?.first_name} {message?.signatory?.last_name}
                </p>
              </div>
            )} */}
          </div>
        </div>
      ))}
    </>
  );
};

export default PrintView;