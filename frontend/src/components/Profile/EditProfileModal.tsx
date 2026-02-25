import React, { useState, useEffect, useRef } from 'react';
import './ProfilePage.css';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ProfileFormData) => void;
    initialData: ProfileFormData;
}

export interface ProfileFormData {
    fullName: string;
    username: string;
    bio: string;
    skills: string[];
}

const BIO_MAX = 160;

function EditProfileModal({ isOpen, onClose, onSave, initialData }: EditProfileModalProps) {
    const [form, setForm] = useState<ProfileFormData>(initialData);
    const [skillInput, setSkillInput] = useState('');
    const overlayRef = useRef<HTMLDivElement>(null);

    // Reset form whenever modal opens with fresh data
    useEffect(() => {
        if (isOpen) {
            setForm(initialData);
            setSkillInput('');
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === overlayRef.current) onClose();
    };

    const handleAddSkill = () => {
        const trimmed = skillInput.trim();
        if (trimmed && !form.skills.includes(trimmed)) {
            setForm(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
        }
        setSkillInput('');
    };

    const handleRemoveSkill = (skill: string) => {
        setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill();
        }
    };

    const handleSave = () => {
        onSave(form);
        onClose();
    };

    return (
        <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
            <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">

                <div className="modal-header">
                    <h2 className="modal-title" id="modal-title">Edit Profile</h2>
                    <p className="modal-subtitle">Update your profile information</p>
                </div>

                {/* Avatar preview */}
                <div className="modal-avatar-row">
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${form.username}`}
                        alt="Avatar preview"
                        className="modal-avatar"
                    />
                    <div className="modal-avatar-info">
                        <h4>Change Avatar</h4>
                        <p>JPG, GIF or PNG. Max size 2MB.</p>
                    </div>
                </div>

                {/* Full Name */}
                <div className="modal-field">
                    <label className="modal-label" htmlFor="edit-fullname">Full Name</label>
                    <input
                        id="edit-fullname"
                        className="modal-input"
                        type="text"
                        value={form.fullName}
                        onChange={e => setForm(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Your full name"
                    />
                </div>

                {/* Username */}
                <div className="modal-field">
                    <label className="modal-label" htmlFor="edit-username">Username</label>
                    <input
                        id="edit-username"
                        className="modal-input"
                        type="text"
                        value={form.username}
                        onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="@username"
                    />
                </div>

                {/* Bio */}
                <div className="modal-field">
                    <label className="modal-label" htmlFor="edit-bio">Bio</label>
                    <textarea
                        id="edit-bio"
                        className="modal-textarea"
                        value={form.bio}
                        onChange={e => {
                            if (e.target.value.length <= BIO_MAX)
                                setForm(prev => ({ ...prev, bio: e.target.value }));
                        }}
                        placeholder="Tell people about yourself..."
                    />
                    <div className="modal-char-count">{form.bio.length}/{BIO_MAX} characters</div>
                </div>

                {/* Skills */}
                <div className="modal-field">
                    <label className="modal-label">Skills</label>
                    <div className="modal-skills-input-row">
                        <input
                            className="modal-input"
                            type="text"
                            value={skillInput}
                            onChange={e => setSkillInput(e.target.value)}
                            onKeyDown={handleSkillKeyDown}
                            placeholder="Add a skill..."
                        />
                        <button className="modal-add-btn" onClick={handleAddSkill} type="button">Add</button>
                    </div>
                    <div className="modal-skills-chips">
                        {form.skills.map(skill => (
                            <span key={skill} className="modal-skill-chip">
                                {skill}
                                <button
                                    className="modal-skill-remove"
                                    onClick={() => handleRemoveSkill(skill)}
                                    type="button"
                                    aria-label={`Remove ${skill}`}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button className="modal-cancel-btn" onClick={onClose} type="button">Cancel</button>
                    <button className="modal-save-btn" onClick={handleSave} type="button">Save Changes</button>
                </div>
            </div>
        </div>
    );
}

export default EditProfileModal;
