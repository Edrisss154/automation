import React from 'react';
import moment from 'jalali-moment';
import  '../../../styles/Automation/print.scss';

const PrintView = ({ message }) => {
    const persianDate = message ? moment(message.registered_at, 'YYYY-MM-DD').locale('fa').format('YYYY/MM/DD') : '';
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

    return (
        <div className="print-view">
            <div className="print-header">
                <h1>{message?.subject}</h1>
                <p>تاریخ: {persianDate}</p>
            </div>

            <div className="print-details">
                <div className="detail-row">
                    <span className="detail-label">نوع سند:</span>
                    <span className="detail-value">{translateDocumentType(message?.type)}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">شماره:</span>
                    <span className="detail-value">{message?.number}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">سطح اهمیت:</span>
                    <span className="detail-value">{translateImportance(message?.importance)}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">سطح فوریت:</span>
                    <span className="detail-value">{translateUrgency(message?.urgency)}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">ایجاد کننده:</span>
                    <span className="detail-value">{message?.user?.first_name} {message?.user?.last_name}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">امضا کننده:</span>
                    <span className="detail-value">{message?.signatory?.first_name} {message?.signatory?.last_name}</span>
                </div>
            </div>

            <div className="print-content">
                <p>{message?.content}</p>
            </div>

            <div className="print-signature">
                <img src={message?.user?.signature} alt="امضا" className="signature-preview" />
                <p>امضا: {message?.user?.first_name} {message?.user?.last_name}</p>
            </div>
        </div>
    );
};

export default PrintView;