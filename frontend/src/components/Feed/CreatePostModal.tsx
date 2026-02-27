import React, { useState } from 'react';
import './CreatePostModal.css';

type PostType = 'Help' | 'Resource' | 'Meme';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (post: { type: PostType; title: string; content: string; tags: string[]; imageUrl?: string; contentUrl?: string }) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [selectedType, setSelectedType] = useState<PostType>('Help');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [contentUrl, setContentUrl] = useState('');

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_SIZE) {
            alert('Image size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64String = event.target?.result as string;
            setImageUrl(base64String);
            setImagePreview(base64String);
        };
        reader.readAsDataURL(file);
    };

    const handlePost = () => {
        if (!title.trim() || !content.trim()) return;

        onSubmit({
            type: selectedType,
            title,
            content,
            tags: [],
            imageUrl: imageUrl || undefined,
            contentUrl: contentUrl || undefined
        });

        // Reset state after submission
        setTitle('');
        setContent('');
        setSelectedType('Help');
        setImageUrl('');
        setImagePreview('');
        setContentUrl('');
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">Create Post</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="post-type-container">
                    <div className="post-type-selector">
                        <button
                            className={`type-btn ${selectedType === 'Help' ? 'active type-help' : ''}`}
                            onClick={() => setSelectedType('Help')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            Help
                        </button>
                        <button
                            className={`type-btn ${selectedType === 'Resource' ? 'active type-resource' : ''}`}
                            onClick={() => setSelectedType('Resource')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            Resource
                        </button>
                        <button
                            className={`type-btn ${selectedType === 'Meme' ? 'active type-meme' : ''}`}
                            onClick={() => setSelectedType('Meme')}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                            Meme
                        </button>
                    </div>
                    <div className="post-type-subtitle">
                        {selectedType === 'Help' ? 'Ask for assistance with a problem or concept.' :
                            selectedType === 'Resource' ? 'Share notes, tutorials, or helpful tools.' :
                                'Lighten the mood with something funny.'}
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">Title</label>
                    <input
                        type="text"
                        className="custom-input"
                        placeholder="Give your post a clear title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Content</label>
                    <textarea
                        className="post-textarea"
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Link (Optional)</label>
                    <div className="input-with-icon">
                        <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        <input
                            type="text"
                            placeholder="https://example.com"
                            value={contentUrl}
                            onChange={(e) => setContentUrl(e.target.value)}
                            className="custom-input with-icon"
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">Image (Optional)</label>
                    <div className="image-upload-area" onClick={() => document.getElementById('image-upload')?.click()}>
                        <input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                        <svg className="upload-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <span className="upload-text">Click to upload image</span>
                        <span className="upload-hint">PNG, JPG up to 5MB</span>
                    </div>
                    {imagePreview && (
                        <div className="image-preview" onClick={() => { setImageUrl(''); setImagePreview(''); }}>
                            <img src={imagePreview} alt="Preview" style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain' }} />
                            <div className="remove-image-overlay">Remove Image</div>
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="modal-post-btn" onClick={handlePost} disabled={!title.trim() || !content.trim()}>Post</button>
                </div>
            </div>
        </div >
    );
};

export default CreatePostModal;
