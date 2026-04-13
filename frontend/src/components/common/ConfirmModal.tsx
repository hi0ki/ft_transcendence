import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ConfirmModal.css';

export interface ConfirmModalProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDangerous?: boolean;
}

export default function ConfirmModal({
    isOpen,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isDangerous = true,
}: ConfirmModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="confirm-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
            <div className="confirm-modal-content">
                <div className="confirm-modal-header">
                    <h2 className="confirm-modal-title">{title}</h2>
                    <button className="confirm-modal-close-btn" onClick={onCancel} type="button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div className="confirm-modal-body">
                    <p>{message}</p>
                </div>
                <div className="confirm-modal-footer">
                    <button className="confirm-modal-btn confirm-modal-btn-cancel" onClick={onCancel} type="button">
                        {cancelText}
                    </button>
                    <button 
                        className={`confirm-modal-btn ${isDangerous ? 'confirm-modal-btn-danger' : 'confirm-modal-btn-primary'}`} 
                        onClick={onConfirm}
                        type="button"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
