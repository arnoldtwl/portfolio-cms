"use client";
import { useState, useEffect } from "react";
import "../styles.css";
import "./basics.css";

export default function BasicsPage() {
  const [basics, setBasics] = useState([]);
  const [editingField, setEditingField] = useState({
    id: null,
    field: null,
    value: "",
    fieldType: "",
  });
  const [newField, setNewField] = useState({ fieldName: "", fieldType: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBasics();
  }, []);

  const fetchBasics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/basics");
      const data = await response.json();
      setBasics(data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch basics:", error);
      setError("Failed to load basics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Client-side validation for field names
  const validateFieldName = (field) => {
    return /^[a-zA-Z0-9_\s]{1,50}$/.test(field);
  };

  // Client-side validation for field values based on type
  const validateFieldValue = (value, type) => {
    if (value === undefined || value === null) {
      return false;
    }

    if (typeof value !== 'string' || value.length > 500) {
      return false;
    }

    if (!value && type !== 'text') {
      return true; // Allow empty values except for text type
    }

    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      case 'tel':
        return /^\+?[\d\s-]{10,}$/.test(value);
      case 'date':
        return !isNaN(Date.parse(value));
      default:
        return true;
    }
  };

  const updateField = async () => {
    try {
      const { id, field, value, fieldType } = editingField;

      // Validate value based on field type
      if (!validateFieldValue(value, fieldType)) {
        setError(`Invalid ${fieldType} format`);
        return;
      }

      const response = await fetch("/api/basics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field, value }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to update field');
        return;
      }

      fetchBasics();
      setEditingField({ id: null, field: null, value: "", fieldType: "" });
      setError(null);
    } catch (error) {
      console.error("Failed to update field:", error);
      setError("Failed to update field. Please try again.");
    }
  };

  const deleteField = async (id, field) => {
    if (!confirm("Are you sure you want to delete this field?")) return;
    
    try {
      const response = await fetch("/api/basics", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field }),
      });
      if (response.ok) {
        fetchBasics();
      }
    } catch (error) {
      console.error("Failed to delete field:", error);
      setError("Failed to delete field. Please try again.");
    }
  };

  const addField = async () => {
    try {
      const { fieldName, fieldType } = newField;
      
      // Validate field name
      if (!validateFieldName(fieldName)) {
        setError('Field name must be 1-50 characters and contain only letters, numbers, spaces, and underscores');
        return;
      }

      // Validate field type
      const validTypes = ['text', 'email', 'url', 'tel', 'date'];
      if (!validTypes.includes(fieldType)) {
        setError('Invalid field type');
        return;
      }

      const response = await fetch("/api/basics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: fieldName, fieldType }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to add field');
        return;
      }

      fetchBasics();
      setNewField({ fieldName: "", fieldType: "" });
      setError(null);
    } catch (error) {
      console.error("Failed to add new field:", error);
      setError("Failed to add new field. Please try again.");
    }
  };

  const handleCancel = () => {
    setEditingField({ id: null, field: null, value: "", fieldType: "" });
    setNewField({ fieldName: "", fieldType: "" });
    setError(null);
  };

  if (loading) {
    return (
      <div className="container text-center">
        <div className="card animate-fade-in">
          <h2>Loading basics...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <h1 className="mb-4">Basics Management</h1>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="card mb-4">
        <h2 className="mb-3">Add New Field</h2>
        <div className="form-fields">
          <div className="form-group">
            <label className="form-label">Field Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g., email, phone, address"
              value={newField.fieldName}
              onChange={(e) =>
                setNewField({ ...newField, fieldName: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Field Type</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g., TEXT, INTEGER"
              value={newField.fieldType}
              onChange={(e) =>
                setNewField({ ...newField, fieldType: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button className="btn btn-primary" onClick={addField}>
            Add Field
          </button>
          <button className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {basics.map((basic) => (
          <div key={basic.id}>
            {Object.keys(basic)
              .filter((field) => field !== "id")
              .map((field) => (
                <div key={field} className="card mb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="mb-2">{field.charAt(0).toUpperCase() + field.slice(1)}</h3>
                      {editingField.id === basic.id && editingField.field === field ? (
                        <div className="form-control">
                          <input
                            className="form-input"
                            type={editingField.fieldType || 'text'}
                            value={editingField.value}
                            onChange={(e) =>
                              setEditingField({
                                ...editingField,
                                value: e.target.value,
                              })
                            }
                            placeholder={`Enter ${field}`}
                          />
                        </div>
                      ) : (
                        <p className="text-secondary">{basic[field] || ""}</p>
                      )}
                    </div>
                    <div className="button-group">
                      {editingField.id === basic.id && editingField.field === field ? (
                        <>
                          <button className="button-icon" onClick={updateField} title="Save">
                            💾
                          </button>
                          <button className="button-icon" onClick={handleCancel} title="Cancel">
                            ❌
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="button-icon"
                            onClick={() => setEditingField({
                              id: basic.id,
                              field,
                              value: basic[field] || "",
                              fieldType: basic.field_type,
                            })}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            className="button-icon"
                            onClick={() => deleteField(basic.id, field)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
