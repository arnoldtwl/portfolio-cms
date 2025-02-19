'use client';

import { useState, useEffect } from 'react';
import '../styles.css';
import './projects.css';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    githubLink: '',
    deploymentLink: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side validation
  const validateForm = (project) => {
    // Reset error
    setError(null);

    // Validate name
    if (!project.name || project.name.length > 100) {
      setError('Project name is required and must be less than 100 characters');
      return false;
    }

    // Validate description
    if (!project.description || project.description.length > 1000) {
      setError('Description is required and must be less than 1000 characters');
      return false;
    }

    // Validate GitHub link
    if (project.githubLink) {
      try {
        const url = new URL(project.githubLink);
        if (!url.hostname.includes('github.com')) {
          setError('GitHub link must be from github.com');
          return false;
        }
      } catch {
        setError('Invalid GitHub URL');
        return false;
      }
    }

    // Validate deployment link
    if (project.deploymentLink) {
      try {
        new URL(project.deploymentLink);
      } catch {
        setError('Invalid deployment URL');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm(newProject)) {
      return;
    }

    try {
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit ? { ...newProject, id: editMode } : newProject;

      const response = await fetch('/api/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to save project');
        return;
      }

      fetchProjects();
      setNewProject({
        name: '',
        description: '',
        githubLink: '',
        deploymentLink: ''
      });
      setEditMode(null);
      setError(null);
    } catch (error) {
      console.error('Error saving project:', error);
      setError('Failed to save project. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch('/api/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchProjects();
        setError(null);
      }
    } catch (err) {
      setError('Failed to delete project');
      console.error('Error deleting project:', err);
    }
  };

  const handleEdit = (project) => {
    setNewProject({
      name: project.name,
      description: project.description,
      githubLink: project.githubLink,
      deploymentLink: project.deploymentLink
    });
    setEditMode(project.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="container text-center">
        <div className="card animate-fade-in">
          <h2>Loading projects...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h1>Projects Management</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      <div className="card mb-4">
        <h2 className="mb-3">{editMode ? 'Edit Project' : 'Add New Project'}</h2>
        <form onSubmit={(e) => handleSubmit(e, Boolean(editMode))} className="project-form">
          <div className="grid grid-2 gap-2">
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input
                className="form-input"
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="Enter project name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">GitHub Link</label>
              <input
                className="form-input"
                type="url"
                value={newProject.githubLink}
                onChange={(e) => setNewProject({ ...newProject, githubLink: e.target.value })}
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Enter project description"
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Deployment Link</label>
            <input
              className="form-input"
              type="url"
              value={newProject.deploymentLink}
              onChange={(e) => setNewProject({ ...newProject, deploymentLink: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              {editMode ? 'Update Project' : 'Add Project'}
            </button>
            {editMode && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditMode(null);
                  setNewProject({
                    name: '',
                    description: '',
                    githubLink: '',
                    deploymentLink: ''
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
        {projects.map((project) => (
          <div key={project.id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div>
                  <h3 className="mb-2">{project.name}</h3>
                  <p className="text-secondary mb-2">{project.description}</p>
                  <div className="project-links">
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-link"
                        title="GitHub Repository"
                      >
                        <span className="link-icon">🔗</span>
                        GitHub
                      </a>
                    )}
                    {project.deploymentLink && (
                      <a
                        href={project.deploymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-link"
                        title="Live Demo"
                      >
                        <span className="link-icon">🚀</span>
                        Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="button-group">
                <button
                  className="button-icon"
                  onClick={() => handleEdit(project)}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="button-icon"
                  onClick={() => handleDelete(project.id)}
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
