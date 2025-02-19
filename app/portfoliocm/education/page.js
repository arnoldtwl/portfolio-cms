'use client';

import { useState, useEffect } from 'react';
import '../styles.css';
import "./education.css";

export default function EducationPage() {
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [newEducation, setNewEducation] = useState({
    institution: '',
    area: '',
    studytype: '',
    enddate: ''
  });

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/education');
      const data = await response.json();
      setEducation(data);
      setError(null);
    } catch (err) {
      setError('Failed to load education data');
      console.error('Error fetching education:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit ? { ...newEducation, id: editMode } : newEducation;

      const response = await fetch('/api/education', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchEducation();
        setNewEducation({
          institution: '',
          area: '',
          studytype: '',
          enddate: ''
        });
        setEditMode(null);
        setError(null);
      }
    } catch (err) {
      setError('Failed to save education data');
      console.error('Error saving education:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return;

    try {
      const response = await fetch('/api/education', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchEducation();
        setError(null);
      }
    } catch (err) {
      setError('Failed to delete education entry');
      console.error('Error deleting education:', err);
    }
  };

  const handleEdit = (edu) => {
    setEditMode(edu.id);
    setNewEducation(edu);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="container text-center">
        <div className="card animate-fade-in">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Education Management</h1>
      
      {error && <div className="error-message card mb-4">{error}</div>}

      <div className="card mb-4">
        <h2 className="mb-3">{editMode ? 'Edit Education' : 'Add New Education'}</h2>
        <form onSubmit={(e) => handleSubmit(e, !!editMode)} className="education-form">
          <div className="form-group">
            <label className="form-label" htmlFor="institution">Institution</label>
            <input
              className="form-input"
              type="text"
              id="institution"
              placeholder="e.g., University of Cape Town"
              value={newEducation.institution}
              onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="area">Area of Study</label>
            <input
              className="form-input"
              type="text"
              id="area"
              placeholder="e.g., Computer Science"
              value={newEducation.area}
              onChange={(e) => setNewEducation({ ...newEducation, area: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="studytype">Study Type</label>
            <input
              className="form-input"
              type="text"
              id="studytype"
              placeholder="e.g., Bachelor's Degree"
              value={newEducation.studytype}
              onChange={(e) => setNewEducation({ ...newEducation, studytype: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="enddate">End Date</label>
            <input
              className="form-input"
              type="date"
              id="enddate"
              value={newEducation.enddate}
              onChange={(e) => setNewEducation({ ...newEducation, enddate: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              {editMode ? 'Update Education' : 'Add Education'}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={() => {
                  setEditMode(null);
                  setNewEducation({
                    institution: '',
                    area: '',
                    studytype: '',
                    enddate: ''
                  });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="grid gap-3">
        {education.map((edu) => (
          <div key={edu.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="mb-2">{edu.institution}</h3>
                <p className="text-secondary mb-2">{edu.area}</p>
                <p className="text-secondary mb-2">{edu.studytype}</p>
                <p className="text-secondary mb-2">Completed: {edu.enddate}</p>
              </div>
              <div className="button-group">
                <button
                  className="button-icon"
                  onClick={() => handleEdit(edu)}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="button-icon"
                  onClick={() => handleDelete(edu.id)}
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
