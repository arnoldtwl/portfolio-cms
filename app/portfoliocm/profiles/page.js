'use client';

import { useState, useEffect } from 'react';
import '../styles.css';
import './profiles.css';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [newProfile, setNewProfile] = useState({
    network: '',
    username: '',
    url: ''
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profiles');
      const data = await response.json();
      setProfiles(data);
      setError(null);
    } catch (err) {
      setError('Failed to load profiles');
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit ? { ...newProfile, id: editMode } : newProfile;

      const response = await fetch('/api/profiles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchProfiles();
        setNewProfile({ network: '', username: '', url: '' });
        setEditMode(null);
        setError(null);
      }
    } catch (err) {
      setError('Failed to save profile');
      console.error('Error saving profile:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;

    try {
      const response = await fetch('/api/profiles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchProfiles();
        setError(null);
      }
    } catch (err) {
      setError('Failed to delete profile');
      console.error('Error deleting profile:', err);
    }
  };

  const handleEdit = (profile) => {
    setEditMode(profile.id);
    setNewProfile(profile);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getNetworkIcon = (network) => {
    const icons = {
      'github': '💻',
      'linkedin': '💼',
      'twitter': '🐦',
      'facebook': '👥',
      'instagram': '📸',
      'default': '🔗'
    };
    return icons[network.toLowerCase()] || icons.default;
  };

  if (loading) {
    return (
      <div className="container text-center">
        <div className="card animate-fade-in">
          <h2>Loading profiles...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h1>Social Profiles Management</h1>
      </div>

      {error && (
        <div className="card mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      <div className="card mb-4">
        <h2 className="mb-3">{editMode ? 'Edit Profile' : 'Add New Profile'}</h2>
        <form onSubmit={(e) => handleSubmit(e, !!editMode)} className="grid gap-3">
          <div className="grid grid-3 gap-2">
            <div className="form-group">
              <label className="form-label">Network</label>
              <input
                className="form-input"
                type="text"
                value={newProfile.network}
                onChange={(e) => setNewProfile({ ...newProfile, network: e.target.value })}
                placeholder="e.g., LinkedIn, GitHub"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                type="text"
                value={newProfile.username}
                onChange={(e) => setNewProfile({ ...newProfile, username: e.target.value })}
                placeholder="Your username"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">URL</label>
              <input
                className="form-input"
                type="url"
                value={newProfile.url}
                onChange={(e) => setNewProfile({ ...newProfile, url: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              {editMode ? 'Update Profile' : 'Add Profile'}
            </button>
            {editMode && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditMode(null);
                  setNewProfile({ network: '', username: '', url: '' });
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="grid gap-3">
        {profiles.map((profile) => (
          <div key={profile.id} className="card">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getNetworkIcon(profile.network)}</span>
                <div>
                  <h3 className="mb-2">{profile.network}</h3>
                  <p className="text-secondary mb-2">@{profile.username}</p>
                  <a
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                  >
                    View Profile
                  </a>
                </div>
              </div>
              <div className="button-group">
                <button
                  className="button-icon"
                  onClick={() => handleEdit(profile)}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="button-icon"
                  onClick={() => handleDelete(profile.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}