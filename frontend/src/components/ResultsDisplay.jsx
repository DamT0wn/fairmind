import { useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import './ResultsDisplay.css';

const API_URL = 'http://localhost:8000/api';

function ResultsDisplay({ results, onBack }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const handleDownloadReport = async () => {
    setDownloadError('');
    setDownloading(true);

    try {
      console.log('[v0] Downloading report...');
      const response = await axios.post(
        `${API_URL}/generate-report`,
        { audit_id: results.audit_id },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fairscan-report-${results.audit_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log('[v0] Error downloading report:', err);
      setDownloadError('Error downloading report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!results) {
    return <div>Loading results...</div>;
  }

  const biasMetrics = results.bias_metrics || {};
  const mitigationStrategies = results.mitigation_strategies || [];
  const groupMetrics = results.group_metrics || {};

  // Prepare chart data
  const overallMetricsData = [
    { name: 'Demographic Parity', value: biasMetrics.demographic_parity || 0 },
    { name: 'Equalized Odds', value: biasMetrics.equalized_odds || 0 },
    { name: 'Predictive Parity', value: biasMetrics.predictive_parity || 0 }
  ];

  const groupPerformanceData = Object.entries(groupMetrics).map(([group, metrics]) => ({
    group,
    accuracy: metrics.accuracy || 0,
    fpr: metrics.false_positive_rate || 0,
    fnr: metrics.false_negative_rate || 0
  }));

  const riskLevels = {
    high: overallMetricsData.filter(m => m.value > 0.3).length > 0,
    medium: overallMetricsData.filter(m => m.value > 0.15 && m.value <= 0.3).length > 0,
    low: overallMetricsData.filter(m => m.value <= 0.15).length > 0
  };

  const riskLevel = riskLevels.high ? 'High' : riskLevels.medium ? 'Medium' : 'Low';
  const riskColor = riskLevel === 'High' ? '#ef4444' : riskLevel === 'Medium' ? '#f59e0b' : '#10b981';

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Audit Results</h2>
        <button className="back-button" onClick={onBack}>← Back to Dashboard</button>
      </div>

      <div className="model-info">
        <h3>{results.model_name}</h3>
        <p>Protected Attribute: {results.protected_attribute}</p>
        <p>Audit ID: {results.audit_id}</p>
      </div>

      <div className="risk-summary">
        <div className="risk-card">
          <h4>Overall Bias Risk Level</h4>
          <div className="risk-indicator" style={{ borderColor: riskColor }}>
            <span className="risk-label" style={{ color: riskColor }}>{riskLevel}</span>
          </div>
        </div>
        <div className="stats-card">
          <h4>Model Metrics</h4>
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-label">Overall Accuracy</span>
              <span className="stat-value">{(biasMetrics.overall_accuracy || 0).toFixed(3)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Samples Analyzed</span>
              <span className="stat-value">{results.total_samples || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h4>Bias Metrics Comparison</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overallMetricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6">
                {overallMetricsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value > 0.3 ? '#ef4444' : entry.value > 0.15 ? '#f59e0b' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {groupPerformanceData.length > 0 && (
          <div className="chart-container">
            <h4>Group Performance Analysis</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={groupPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" name="Accuracy" />
                <Line type="monotone" dataKey="fpr" stroke="#ef4444" name="False Positive Rate" />
                <Line type="monotone" dataKey="fnr" stroke="#f59e0b" name="False Negative Rate" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mitigation-section">
        <h3>Mitigation Strategies</h3>
        {mitigationStrategies.length > 0 ? (
          <div className="strategies-list">
            {mitigationStrategies.map((strategy, index) => (
              <div key={index} className="strategy-card">
                <h5>{strategy.name}</h5>
                <p>{strategy.description}</p>
                <div className="strategy-details">
                  <span>Impact: {strategy.impact}</span>
                  <span>Priority: {strategy.priority}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No mitigation strategies needed - model shows low bias.</p>
        )}
      </div>

      <div className="group-details">
        <h3>Detailed Group Metrics</h3>
        <div className="metrics-table">
          <table>
            <thead>
              <tr>
                <th>Group</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>FPR</th>
                <th>FNR</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupMetrics).map(([group, metrics]) => (
                <tr key={group}>
                  <td>{group}</td>
                  <td>{(metrics.accuracy || 0).toFixed(3)}</td>
                  <td>{(metrics.precision || 0).toFixed(3)}</td>
                  <td>{(metrics.recall || 0).toFixed(3)}</td>
                  <td>{(metrics.false_positive_rate || 0).toFixed(3)}</td>
                  <td>{(metrics.false_negative_rate || 0).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="actions-section">
        <button
          className="primary-button"
          onClick={handleDownloadReport}
          disabled={downloading}
        >
          {downloading ? 'Generating PDF...' : 'Download PDF Report'}
        </button>
        {downloadError && <div className="error-message">{downloadError}</div>}
      </div>
    </div>
  );
}

export default ResultsDisplay;
