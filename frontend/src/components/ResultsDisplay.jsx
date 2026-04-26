import { useState } from 'react';
import { motion } from 'framer-motion';
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
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  ArrowLeft, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Shield,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function ResultsDisplay({ results, onBack }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const handleDownloadReport = async () => {
    setDownloadError('');
    setDownloading(true);

    try {
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
      setDownloadError('Error downloading report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const biasMetrics = results.bias_metrics || {};
  const mitigationStrategies = results.mitigation_strategies || [];
  const groupMetrics = results.group_metrics || {};

  // Prepare chart data — keys must match backend response from calculate_fairness_metrics
  const overallMetricsData = [
    { name: 'Demographic Parity Diff', value: biasMetrics.demographic_parity_difference || 0, fullMark: 1 },
    { name: 'Max Accuracy Diff', value: biasMetrics.max_accuracy_diff || 0, fullMark: 1 },
    { name: 'Disparate Impact Gap', value: biasMetrics.disparate_impact_ratio != null ? 1 - biasMetrics.disparate_impact_ratio : 0, fullMark: 1 }
  ];

  const groupPerformanceData = Object.entries(groupMetrics).map(([group, metrics]) => ({
    group,
    accuracy: (metrics.accuracy || 0) * 100,
    fpr: (metrics.false_positive_rate || 0) * 100,
    fnr: (metrics.false_negative_rate || 0) * 100,
    precision: (metrics.precision || 0) * 100,
    recall: (metrics.recall || 0) * 100
  }));

  // Calculate risk level using real backend metric keys
  const maxBias = Math.max(
    biasMetrics.demographic_parity_difference || 0,
    biasMetrics.max_accuracy_diff || 0,
    biasMetrics.disparate_impact_ratio != null ? 1 - biasMetrics.disparate_impact_ratio : 0
  );

  const riskLevel = maxBias > 0.3 ? 'High' : maxBias > 0.15 ? 'Medium' : 'Low';
  const riskColor = riskLevel === 'High' ? 'red' : riskLevel === 'Medium' ? 'amber' : 'green';
  const RiskIcon = riskLevel === 'High' ? AlertTriangle : riskLevel === 'Medium' ? AlertCircle : CheckCircle2;

  const getBarColor = (value) => {
    if (value > 0.3) return '#ef4444';
    if (value > 0.15) return '#f59e0b';
    return '#22c55e';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Audit Results</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Comprehensive bias analysis for {results.model_name}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 glass rounded-xl hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>
      </motion.div>

      {/* Model Info & Risk Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Info */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Model Info</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Model Name</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{results.model_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Protected Attribute</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{results.protected_attribute}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Samples Analyzed</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{results.total_samples?.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Risk Level */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 bg-${riskColor}-100 dark:bg-${riskColor}-900/30 rounded-xl`}>
              <Shield className={`w-6 h-6 text-${riskColor}-600 dark:text-${riskColor}-400`} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Bias Risk</h3>
          </div>
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <RiskIcon className={`w-16 h-16 text-${riskColor}-500 mx-auto mb-3`} />
              <div className={`text-3xl font-bold text-${riskColor}-600 dark:text-${riskColor}-400 mb-1`}>
                {riskLevel}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Risk Level</p>
            </div>
          </div>
        </motion.div>

        {/* Overall Accuracy */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Performance</h3>
          </div>
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <div className="text-5xl font-bold gradient-text mb-2">
                {((biasMetrics.overall_accuracy || 0) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Overall Accuracy</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bias Metrics Bar Chart */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">
            Bias Metrics Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overallMetricsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {overallMetricsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-slate-600 dark:text-slate-400">Low (&lt;0.15)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-slate-600 dark:text-slate-400">Medium (0.15-0.3)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-slate-600 dark:text-slate-400">High (&gt;0.3)</span>
            </div>
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">
            Fairness Metrics Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={overallMetricsData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 1]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar 
                name="Bias Score" 
                dataKey="value" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Group Performance */}
      {groupPerformanceData.length > 0 && (
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">
            Group Performance Analysis
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={groupPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="group" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Accuracy %" 
                dot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="precision" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                name="Precision %" 
                dot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="recall" 
                stroke="#22c55e" 
                strokeWidth={3}
                name="Recall %" 
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Detailed Metrics Table */}
      <motion.div variants={itemVariants} className="glass-card p-6 overflow-x-auto">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">
          Detailed Group Metrics
        </h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Group</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Accuracy</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Precision</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Recall</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">FPR</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">FNR</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupMetrics).map(([group, metrics]) => (
              <motion.tr 
                key={group}
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                className="border-b border-slate-100 dark:border-slate-800"
              >
                <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{group}</td>
                <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-400">
                  {((metrics.accuracy || 0) * 100).toFixed(1)}%
                </td>
                <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-400">
                  {((metrics.precision || 0) * 100).toFixed(1)}%
                </td>
                <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-400">
                  {((metrics.recall || 0) * 100).toFixed(1)}%
                </td>
                <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-400">
                  {((metrics.false_positive_rate || 0) * 100).toFixed(1)}%
                </td>
                <td className="text-center py-3 px-4 text-slate-600 dark:text-slate-400">
                  {((metrics.false_negative_rate || 0) * 100).toFixed(1)}%
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Mitigation Strategies */}
      {mitigationStrategies.length > 0 && (
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">
            Recommended Mitigation Strategies
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mitigationStrategies.map((strategy, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                className="p-5 glass rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{strategy.name}</h4>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    strategy.priority === 'High' 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : strategy.priority === 'Medium'
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  }`}>
                    {strategy.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{strategy.description}</p>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  Impact: <span className="font-medium">{strategy.impact}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Download Report */}
      <motion.div variants={itemVariants} className="flex flex-col items-center space-y-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadReport}
          disabled={downloading}
          className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Download PDF Report</span>
            </>
          )}
        </motion.button>
        {downloadError && (
          <p className="text-sm text-red-600 dark:text-red-400">{downloadError}</p>
        )}
      </motion.div>
    </motion.div>
  );
}

export default ResultsDisplay;
