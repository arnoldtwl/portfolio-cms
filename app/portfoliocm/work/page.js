'use client';

import { useState, useEffect } from 'react';
import '../styles.css';
import './work.css';

export default function WorkPage() {
  const [work, setWork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [newWork, setNewWork] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    summary: ''
  });

  useEffect(() => {
    fetchWork();
  }, []);

  const fetchWork = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/work');
      const data = await response.json();
      setWork(data);
      setError(null);
    } catch (err) {
      setError('Failed to load work experience data');
      console.error('Error fetching work:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit ? { ...newWork, id: editMode } : newWork;

      const response = await fetch('/api/work', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchWork();
        setNewWork({
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          summary: ''
        });
        setEditMode(null);
        setError(null);
      }
    } catch (err) {
      setError('Failed to save work experience');
      console.error('Error saving work:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this work experience?')) return;

    try {
      const response = await fetch('/api/work', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchWork();
        setError(null);
      }
    } catch (err) {
      setError('Failed to delete work experience');
      console.error('Error deleting work:', err);
    }
  };

  const handleEdit = (workItem) => {
    setEditMode(workItem.id);
    setNewWork({
      company: workItem.company,
      position: workItem.position,
      startDate: workItem.startDate,
      endDate: workItem.endDate,
      summary: workItem.summary
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="container text-center">
        <div className="card animate-fade-in">
          <h2>Loading work experience data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h1>Work Experience Management</h1>
      </div>

      {error && (
        <div className="card mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      <div className="card mb-4">
        <h2 className="mb-3">{editMode ? 'Edit Work Experience' : 'Add New Work Experience'}</h2>
        <form onSubmit={(e) => handleSubmit(e, !!editMode)} className="grid gap-3">
          <div className="grid grid-2 gap-2">
            <div className="form-group">
              <label className="form-label">Company</label>
              <input
                className="form-input"
                type="text"
                value={newWork.company}
                onChange={(e) => setNewWork({ ...newWork, company: e.target.value })}
                placeholder="Enter company name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Position</label>
              <input
                className="form-input"
                type="text"
                value={newWork.position}
                onChange={(e) => setNewWork({ ...newWork, position: e.target.value })}
                placeholder="Enter position"
                required
              />
            </div>
          </div>

          <div className="grid grid-2 gap-2">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                className="form-input"
                type="date"
                value={newWork.startDate}
                onChange={(e) => setNewWork({ ...newWork, startDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                className="form-input"
                type="date"
                value={newWork.endDate}
                onChange={(e) => setNewWork({ ...newWork, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Summary</label>
            <textarea
              className="form-input"
              value={newWork.summary}
              onChange={(e) => setNewWork({ ...newWork, summary: e.target.value })}
              placeholder="Enter job description"
              rows="4"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              {editMode ? 'Update Work Experience' : 'Add Work Experience'}
            </button>
            {editMode && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditMode(null);
                  setNewWork({
                    company: '',
                    position: '',
                    startDate: '',
                    endDate: '',
                    summary: ''
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
        {work.map((workItem) => (
          <div key={workItem.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="mb-2">{workItem.position}</h3>
                <p className="text-secondary mb-2">@ <span className="company-name">{workItem.company}</span></p>
                <p className="text-secondary mb-2">
                  {workItem.startDate} - {workItem.endDate}
                </p>
                <p className="work-summary mb-2">{workItem.summary}</p>
              </div>
              <div className="button-group">
                <button
                  className="button-icon"
                  onClick={() => handleEdit(workItem)}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="button-icon"
                  onClick={() => handleDelete(workItem.id)}
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
