import React from 'react';
import './ShareModal.css';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    postUrl: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, postUrl }) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(postUrl);
        // Could add a toast notification here
        onClose();
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
                    <button className="share-option-btn" onClick={handleCopyLink}>
                        <div className="share-icon copy-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        </div>
                        <div className="share-option-text">
                            <span className="share-option-title">Copy Link</span>
                            <span className="share-option-desc">Share via link</span>
                        </div>
                    </button>

                    <button className="share-option-btn">
                        <div className="share-icon twitter-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                        </div>
                        <div className="share-option-text">
                            <span className="share-option-title">Twitter</span>
                            <span className="share-option-desc">Share on Twitter</span>
                        </div>
                    </button>

                    <button className="share-option-btn">
                        <div className="share-icon facebook-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                        </div>
                        <div className="share-option-text">
                            <span className="share-option-title">Facebook</span>
                            <span className="share-option-desc">Share on Facebook</span>
                        </div>
                    </button>

                    <button className="share-option-btn">
                        <div className="share-icon linkedin-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                        </div>
                        <div className="share-option-text">
                            <span className="share-option-title">LinkedIn</span>
                            <span className="share-option-desc">Share on LinkedIn</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
