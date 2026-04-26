import { useState } from 'react';
import axios from 'axios';
import './AuditForm.css';

const API_URL = 'http://localhost:8000/api';

function AuditForm({ onAuditComplete, onCancel }) {
  const [formData, setFormData] = useState({
    modelName: '',
    protectedAttribute: 'gender',
    predictions: [],
    actuals: [],
    groups: []
  });

  const [useDemo, setUseDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          const lines = content.trim().split('\n');
          const values = lines.map(line => {
            const val = parseFloat(line.trim());
            return isNaN(val) ? 0 : val;
          });
          setFormData(prev => ({
            ...prev,
            [field]: values
          }));
        } catch (err) {
          setError(`Error parsing ${field} file: ${err.message}`);
        }
      };
      reader.readAsText(file);
    }
  };

  const loadDemoData = () => {
    const demoData = {
      modelName: 'Demo Credit Approval Model',
      protectedAttribute: 'gender',
      predictions: [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0],
      actuals: [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0],
      groups: ['Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female',
               'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female']
    };
    setFormData(demoData);
    setUseDemo(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.modelName) {
      setError('Please enter a model name');
      setLoading(false);
      return;
    }

    if (formData.predictions.length === 0 || formData.actuals.length === 0) {
      setError('Please upload predictions and actuals data');
      setLoading(false);
      return;
    }

    if (formData.predictions.length !== formData.actuals.length) {
      setError('Predictions and actuals must have the same length');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        model_name: formData.modelName,
        protected_attribute: formData.protectedAttribute,
        predictions: formData.predictions,
        actuals: formData.actuals,
        groups: formData.groups.length > 0 ? formData.groups : null
      };

      const response = await axios.post(`${API_URL}/audit`, payload);

      onAuditComplete(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error processing audit. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="audit-form-container">
      <div className="form-header">
        <h2>Bias Audit Form</h2>
        <button className="close-button" onClick={onCancel}>×</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="audit-form">
        <div className="form-section">
          <label htmlFor="modelName">Model Name *</label>
          <input
            id="modelName"
            type="text"
            name="modelName"
            value={formData.modelName}
            onChange={handleInputChange}
            placeholder="e.g., Credit Approval Model"
            required
          />
        </div>

        <div className="form-section">
          <label htmlFor="protectedAttribute">Protected Attribute *</label>
          <select
            id="protectedAttribute"
            name="protectedAttribute"
            value={formData.protectedAttribute}
            onChange={handleInputChange}
          >
            <option value="gender">Gender</option>
            <option value="race">Race</option>
            <option value="age">Age</option>
            <option value="income">Income Level</option>
          </select>
        </div>

        <div className="form-section">
          <label htmlFor="predictions">Model Predictions *</label>
          <input
            id="predictions"
            type="file"
            accept=".txt,.csv"
            onChange={(e) => handleFileUpload(e, 'predictions')}
          />
          <small>Upload a text file with one prediction per line (0 or 1)</small>
          {formData.predictions.length > 0 && (
            <p className="data-info">{formData.predictions.length} predictions loaded</p>
          )}
        </div>

        <div className="form-section">
          <label htmlFor="actuals">Actual Outcomes *</label>
          <input
            id="actuals"
            type="file"
            accept=".txt,.csv"
            onChange={(e) => handleFileUpload(e, 'actuals')}
          />
          <small>Upload a text file with one actual outcome per line (0 or 1)</small>
          {formData.actuals.length > 0 && (
            <p className="data-info">{formData.actuals.length} outcomes loaded</p>
          )}
        </div>

        <div className="form-section">
          <label htmlFor="groups">Demographic Groups (Optional)</label>
          <input
            id="groups"
            type="file"
            accept=".txt,.csv"
            onChange={(e) => handleFileUpload(e, 'groups')}
          />
          <small>Upload a text file with one group per line (e.g., Male, Female)</small>
          {formData.groups.length > 0 && (
            <p className="data-info">{formData.groups.length} groups loaded</p>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={loadDemoData}
            disabled={loading}
          >
            Load Demo Data
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Run Audit'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AuditForm;
