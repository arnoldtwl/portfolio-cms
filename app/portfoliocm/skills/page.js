'use client';

import { useState, useEffect } from 'react';
import '../styles.css';
import "./skills.css";

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [newSkill, setNewSkill] = useState({
    name: ''
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/skills');
      const data = await response.json();
      setSkills(data);
      setError(null);
    } catch (err) {
      setError('Failed to load skills');
      console.error('Error fetching skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    try {
      const formattedSkill = {
        ...newSkill
      };

      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit ? { ...formattedSkill, id: editMode } : formattedSkill;

      const response = await fetch('/api/skills', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save skill');
      }

      fetchSkills();
      setNewSkill({
        name: ''
      });
      setEditMode(null);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      const response = await fetch('/api/skills', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchSkills();
        setError(null);
      }
    } catch (err) {
      setError('Failed to delete skill');
      console.error('Error deleting skill:', err);
    }
  };

  const handleEdit = (skill) => {
    setNewSkill({
      name: skill.name
    });
    setEditMode(skill.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSkillIcon = (category) => {
    if (!category) return '✨'; // Add a default return if category is undefined
    
    const icons = {
      'programming': '💻',
      'languages': '🌐',
      'frameworks': '⚛️',
      'tools': '🛠️',
      'soft skills': '🤝',
      'default': '✨'
    };
    return icons[category.toLowerCase()] || icons.default;
  };

  const getLevelColor = (level) => {
    const colors = {
      'Beginner': 'var(--info)',
      'Intermediate': 'var(--success)',
      'Advanced': 'var(--primary)',
      'Expert': 'var(--accent)'
    };
    return colors[level] || 'var(--secondary)';
  };

  if (loading) {
    return (
      <div className="container text-center">
        <div className="card animate-fade-in">
          <h2>Loading skills...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h1>Skills Management</h1>
      </div>

      {error && (
        <div className="card mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      <div className="card mb-4">
        <h2 className="mb-3">{editMode ? 'Edit Skill' : 'Add New Skill'}</h2>
        <form onSubmit={(e) => handleSubmit(e, !!editMode)} className="grid gap-3">
          <div className="grid grid-2 gap-2">
            <div className="form-group">
              <label className="form-label">Skill Name</label>
              <input
                className="form-input"
                type="text"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                placeholder="Enter skill name"
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              {editMode ? 'Update Skill' : 'Add Skill'}
            </button>
            {editMode && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditMode(null);
                  setNewSkill({
                    name: ''
                  });
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="grid gap-3">
        {skills.map((skill) => (
          <div key={skill.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="mb-2">{skill.name}</h3>
              </div>
              <div className="button-group">
                <button
                  className="button-icon"
                  onClick={() => handleEdit(skill)}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="button-icon"
                  onClick={() => handleDelete(skill.id)}
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
