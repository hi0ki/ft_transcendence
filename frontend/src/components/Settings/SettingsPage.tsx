import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, getAvatarSrc } from '../../services/authApi';
import './SettingsPage.css';

interface ProfileFormData {
    username: string;
    bio: string;
    skills: string[];
}

interface FormErrors {
    username?: string;
}

const BIO_MAX = 160;
const USERNAME_MIN = 3;
const USERNAME_MAX = 10;

function SettingsPage() {
    const navigate = useNavigate();
    const currentUser = authAPI.getCurrentUser();
    const derivedUsername = currentUser?.username || currentUser?.email?.split('@')[0] || 'user';

    const [form, setForm] = useState<ProfileFormData>({
        username: derivedUsername,
        bio: 'Computer Science student | Love helping others learn',
        skills: ['JavaScript', 'React', 'Python', 'Data Structures'],
    });

    const [skillInput, setSkillInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Validate form
    const validateForm = (username: string): FormErrors => {
        const newErrors: FormErrors = {};
        if (username.length < USERNAME_MIN) {
            newErrors.username = `Username must be at least ${USERNAME_MIN} characters`;
        } else if (username.length > USERNAME_MAX) {
            newErrors.username = `Username must not exceed ${USERNAME_MAX} characters`;
        }
        return newErrors;
    };

    // In a real app, you might fetch the latest profile data here
    useEffect(() => {
        if (!authAPI.isAuthenticated()) {
            navigate('/login');
            return;
        }
        // Fetch real profile to get the current avatarUrl
        authAPI.getMyProfile().then((data) => {
            if (data) {
                setForm(prev => ({
                    ...prev,
                    username: data.username || prev.username,
                    bio: data.bio || prev.bio,
                    skills: data.skills || prev.skills,
                }));
                setProfileAvatarUrl(data.avatarUrl || null);
            }
        });
    }, [navigate]);

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

    const handleSave = async () => {
        const newErrors = validateForm(form.username);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setIsSaving(true);
        try {
            await authAPI.updateProfile({
                username: form.username,
                bio: form.bio,
                skills: form.skills,
            });
            // Redirect to home after successful save
            navigate('/profile');
        } catch (err) {
            console.error('Failed to save:', err);
            // Handle error response from backend
            if (err instanceof Error) {
                setErrors({ username: err.message });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-container">
                <div className="settings-header">
                    <h1 className="settings-title">Account Settings</h1>
                    <p className="settings-subtitle">Manage your profile and account preferences</p>
                </div>

                <div className="settings-avatar-row">
                    <div className="settings-avatar-container">
                        <img
                            src={previewImage || getAvatarSrc(profileAvatarUrl, form.username)}
                            alt="Avatar preview"
                            className="settings-avatar"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(form.username)}`;
                            }}
                        />
                        <button
                            className="settings-avatar-edit-overlay"
                            onClick={() => fileInputRef.current?.click()}
                            type="button"
                            title="Change profile picture"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                        </button>
                    </div>
                    <div className="settings-avatar-info">
                        <h4>Profile Picture</h4>
                        <p>Customize your visual identity</p>
                        <button
                            className="settings-upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                            type="button"
                        >
                            Change Portrait
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                <div className="settings-section">
                    <div className="settings-field">
                        <label className="settings-label" htmlFor="settings-username">Username</label>
                        <input
                            id="settings-username"
                            className={`settings-input ${errors.username ? 'settings-input--error' : ''}`}
                            type="text"
                            value={form.username}
                            onChange={e => {
                                const newUsername = e.target.value;
                                setForm(prev => ({ ...prev, username: newUsername }));
                                // Validate on change
                                const newErrors = validateForm(newUsername);
                                setErrors(newErrors);
                            }}
                            placeholder="username"
                        />
                        {errors.username && <p className="settings-error-message">{errors.username}</p>}
                        <p className="settings-hint">{USERNAME_MIN}-{USERNAME_MAX} characters</p>
                    </div>

                    <div className="settings-field">
                        <label className="settings-label" htmlFor="settings-bio">Bio</label>
                        <textarea
                            id="settings-bio"
                            className="settings-textarea"
                            value={form.bio}
                            onChange={e => {
                                if (e.target.value.length <= BIO_MAX)
                                    setForm(prev => ({ ...prev, bio: e.target.value }));
                            }}
                            placeholder="Tell people about yourself..."
                        />
                        <div className="settings-char-count">{form.bio.length}/{BIO_MAX} characters</div>
                    </div>

                    <div className="settings-field">
                        <label className="settings-label">Skills</label>
                        <div className="settings-skills-input-row">
                            <input
                                className="settings-input"
                                type="text"
                                value={skillInput}
                                onChange={e => setSkillInput(e.target.value)}
                                onKeyDown={handleSkillKeyDown}
                                placeholder="Add a skill (expert in...)"
                            />
                            <button className="settings-add-btn" onClick={handleAddSkill} type="button">Add</button>
                        </div>
                        <div className="settings-skills-chips">
                            {form.skills.map(skill => (
                                <span key={skill} className="settings-skill-chip">
                                    {skill}
                                    <button
                                        className="settings-skill-remove"
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
                </div>

                <div className="settings-footer">
                    <button
                        className="settings-cancel-btn"
                        onClick={() => navigate(-1)}
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        className="settings-save-btn"
                        onClick={handleSave}
                        type="button"
                        disabled={isSaving || Object.keys(errors).length > 0}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
