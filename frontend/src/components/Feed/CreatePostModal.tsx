import React, { useState } from 'react';
import './CreatePostModal.css';

type PostType = 'Help' | 'Resource' | 'Meme';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (post: { type: PostType; content: string; tags: string[]; imageUrl?: string; contentUrl?: string }) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [selectedType, setSelectedType] = useState<PostType>('Help');
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [imageUrl, setImageUrl] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [contentUrl, setContentUrl] = useState('');

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
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
        if (!content.trim()) return;

        let finalTags = [...tags];
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            finalTags.push(tagInput.trim());
        }

        onSubmit({
            type: selectedType,
            content,
            tags: finalTags,
            imageUrl: imageUrl || undefined,
            contentUrl: contentUrl || undefined
        });

        // Reset state after submission
        setContent('');
        setTagInput('');
        setTags([]);
        setSelectedType('Help');
        setImageUrl('');
        setImagePreview('');
        setContentUrl('');
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Create a Post</h2>
                        <p className="modal-subtitle">Share knowledge, ask for help, or post a meme</p>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="post-type-selector">
                    <button
                        className={`type-btn ${selectedType === 'Help' ? 'active' : ''}`}
                        onClick={() => setSelectedType('Help')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        Help
                    </button>
                    <button
                        className={`type-btn ${selectedType === 'Resource' ? 'active' : ''}`}
                        onClick={() => setSelectedType('Resource')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Resource
                    </button>
                    <button
                        className={`type-btn ${selectedType === 'Meme' ? 'active' : ''}`}
                        onClick={() => setSelectedType('Meme')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                        Meme
                    </button>
                </div>

                <div className="input-group">
                    <label className="input-label">
                        {selectedType === 'Help' ? 'What do you need help with?' : 
                         selectedType === 'Resource' ? 'Share your resource' : 
                         'Share your meme or funny content'}
                    </label>
                    <textarea
                        className="post-textarea"
                        placeholder={
                            selectedType === 'Help' ? 'Describe your question or problem in detail...' :
                            selectedType === 'Resource' ? 'Share a useful resource, tutorial, or guide...' :
                            'Share something funny with the community...'
                        }
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Add Image (Optional)</label>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="file-input"
                    />
                    {imagePreview && (
                        <div className="image-preview">
                            <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                        </div>
                    )}
                </div>

                <div className="input-group">
                    <label className="input-label">Add Link (Optional)</label>
                    <input 
                        type="text" 
                        placeholder="https://example.com" 
                        value={contentUrl} 
                        onChange={(e) => setContentUrl(e.target.value)}
                        className="link-input"
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Tags (Optional)</label>
                    <div className="tags-input-wrapper">
                        <div className="tag-input-field-container">
                            <input
                                type="text"
                                className="tag-input"
                                placeholder="Add a tag..."
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                            />
                            <button className="tag-add-btn" onClick={handleAddTag}>Add</button>
                        </div>
                    </div>
                    {tags.length > 0 && (
                        <div className="selected-tags">
                            {tags.map(tag => (
                                <span key={tag} className="selected-tag-pill">
                                    {tag}
                                    <button onClick={() => handleRemoveTag(tag)}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="modal-post-btn" onClick={handlePost} disabled={!content.trim()}>Post</button>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;
