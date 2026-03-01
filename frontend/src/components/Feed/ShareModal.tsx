import React, { useState } from 'react';
import './ShareModal.css';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    postUrl: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, postUrl }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
            onClose();
        }, 1500); // show "Copied!" for 1.5 seconds then close
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="share-modal-content">
                <div className="share-header">
                    <h2 className="share-title">Share Post</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="share-options">
                    <button
                        className={`share-option-btn ${copied ? 'share-option-btn--copied' : ''}`}
                        onClick={handleCopyLink}
                    >
                        <div className={`share-icon ${copied ? 'copied-icon' : 'copy-icon'}`}>
                            {copied ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                            )}
                        </div>
                        <div className="share-option-text">
                            <span className="share-option-title">{copied ? 'Copied!' : 'Copy Link'}</span>
                            <span className="share-option-desc">{copied ? 'Link copied to clipboard' : 'Share via link'}</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;