import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { ArrowLeft, Download, AlertTriangle, CheckCircle2, Loader2, Info, Scale, Award } from 'lucide-react';
import { API_BASE_URL } from '../services/api';
const pct = (v, d = 1) => `${((v || 0) * 100).toFixed(d)}%`;
const fmt = (v, d = 3) => (v != null ? Number(v).toFixed(d) : '—');

const GRADE_META = {
  A: { label: 'Excellent', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  B: { label: 'Good',      bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-700 dark:text-blue-300' },
  C: { label: 'Fair',      bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  D: { label: 'Poor',      bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
  F: { label: 'Failing',   bg: 'bg-red-100 dark:bg-red-900/30',     text: 'text-red-700 dark:text-red-300' },
};

function TipCard({ title, value, sub, tip, color = 'blue' }) {
  const [show, setShow] = useState(false);
  return (
    <div className="glass p-4 rounded-2xl relative">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
        {tip && <button onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="text-slate-400 hover:text-slate-600"><Info className="w-3.5 h-3.5" /></button>}
      </div>
      <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      <AnimatePresence>
        {show && tip && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute z-20 bottom-full mb-2 left-0 right-0 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl leading-relaxed">{tip}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ComplianceBadge({ pass, yes, no }) {
  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold ${pass ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
      {pass ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      <span>{pass ? yes : no}</span>
    </div>
  );
}

function ResultsDisplay({ results, onBack }) {
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState('');

  const download = async () => {
    setDlError(''); setDownloading(true);
    try {
      const r = await axios.post(`${API_BASE_URL}/generate-report`, { audit_id: results.audit_id }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a'); a.href = url;
      a.setAttribute('download', `fairmind-${results.audit_id}.pdf`);
      document.body.appendChild(a); a.click(); a.parentNode.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch { setDlError('Report generation failed. Try again.'); }
    finally { setDownloading(false); }
  };

  if (!results) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;

  const bm = results.bias_metrics || {};
  const gm = results.group_metrics || {};
  const strats = results.mitigation_strategies || [];

  const grade = bm.fairness_grade || '—';
  const gMeta = GRADE_META[grade] || GRADE_META['F'];

  const getColor = (v) => v > 0.2 ? '#ef4444' : v > 0.1 ? '#f59e0b' : '#22c55e';

  const metricsData = [
    { name: 'Dem. Parity', value: bm.demographic_parity_difference || 0 },
    { name: 'Eq. Odds',    value: bm.equalized_odds_difference     || 0 },
    { name: 'Equal Opp.', value: bm.equal_opportunity_difference  || 0 },
    { name: 'Pred. Parity',value: bm.predictive_parity_difference  || 0 },
    { name: 'Accuracy Δ', value: bm.max_accuracy_diff             || 0 },
  ];

  const groupData = Object.entries(gm).map(([g, m]) => ({
    group: g,
    'Accuracy %':  Math.round((m.accuracy || 0) * 1000) / 10,
    'Precision %': Math.round((m.precision || 0) * 1000) / 10,
    'Recall %':    Math.round((m.true_positive_rate || 0) * 1000) / 10,
    'FPR %':       Math.round((m.false_positive_rate || 0) * 1000) / 10,
  }));

  const cv = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const iv = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={cv} initial="hidden" animate="visible" className="space-y-6">

      {/* Header */}
      <motion.div variants={iv} className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-1">Audit Results</h2>
          <p className="text-slate-600 dark:text-slate-400">Fairness analysis for <strong>{results.model_name}</strong></p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 glass rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all">
          <ArrowLeft className="w-5 h-5" /><span>Back</span>
        </motion.button>
      </motion.div>

      {/* Fairness Grade + Compliance Badges */}
      <motion.div variants={iv} className="glass-card p-6">
        <div className="flex flex-wrap items-start gap-6">
          <div className={`flex items-center space-x-4 px-6 py-4 rounded-2xl ${gMeta.bg}`}>
            <Award className={`w-10 h-10 ${gMeta.text}`} />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fairness Grade</p>
              <p className={`text-5xl font-black ${gMeta.text}`}>{grade}</p>
              <p className={`text-xs font-semibold ${gMeta.text}`}>{gMeta.label}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 justify-center">
            <ComplianceBadge pass={bm.eeoc_80_rule_pass} yes={`EEOC 80% Rule ✓  (${fmt(bm.eeoc_80_rule_value)})`} no={`EEOC 80% Rule ✗  (${fmt(bm.eeoc_80_rule_value)} < 0.80 threshold)`} />
            <ComplianceBadge pass={bm.eu_ai_act_compliant} yes="EU AI Act — Compliant ✓" no="EU AI Act — Review Required ✗" />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            <TipCard title="Overall Accuracy" value={pct(bm.overall_accuracy)} color="green" tip="% of predictions matching actuals across all groups." />
            <TipCard title="Disparate Impact" value={fmt(bm.disparate_impact_ratio)}
              color={bm.disparate_impact_ratio >= 0.8 ? 'green' : bm.disparate_impact_ratio >= 0.6 ? 'amber' : 'red'}
              sub="≥ 0.80 = EEOC pass" tip="Minority approval rate ÷ majority approval rate. EEOC requires ≥ 0.80." />
          </div>
        </div>
      </motion.div>

      {/* 5 Metric Cards */}
      <motion.div variants={iv}>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Fairness Metrics Dashboard</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <TipCard title="Dem. Parity Diff" value={fmt(bm.demographic_parity_difference)} color={bm.demographic_parity_difference > 0.2 ? 'red' : bm.demographic_parity_difference > 0.1 ? 'amber' : 'green'} tip="Gap in approval rates across groups. 0 = perfect parity." />
          <TipCard title="Eq. Odds Diff"   value={fmt(bm.equalized_odds_difference)}    color={bm.equalized_odds_difference > 0.2    ? 'red' : bm.equalized_odds_difference > 0.1    ? 'amber' : 'green'} tip="Max of TPR and FPR gaps. Measures error rate parity." />
          <TipCard title="Equal Opp. Diff" value={fmt(bm.equal_opportunity_difference)} color={bm.equal_opportunity_difference > 0.2  ? 'red' : bm.equal_opportunity_difference > 0.1  ? 'amber' : 'green'} tip="True Positive Rate gap. Are qualified people approved equally?" />
          <TipCard title="Pred. Parity Diff" value={fmt(bm.predictive_parity_difference)} color={bm.predictive_parity_difference > 0.2 ? 'red' : bm.predictive_parity_difference > 0.1 ? 'amber' : 'green'} tip="Precision gap. Does 'approved' mean the same for all groups?" />
          <TipCard title="Accuracy Diff"   value={fmt(bm.max_accuracy_diff)}           color={bm.max_accuracy_diff > 0.2            ? 'red' : bm.max_accuracy_diff > 0.1            ? 'amber' : 'green'} tip="Max accuracy gap across groups." />
        </div>
      </motion.div>

      {/* Most Disadvantaged Group Alert */}
      {bm.most_disadvantaged_group && (
        <motion.div variants={iv} className="flex items-center space-x-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-200">Most Disadvantaged Group: <strong>{bm.most_disadvantaged_group}</strong></p>
            <p className="text-sm text-amber-700 dark:text-amber-300">Approval rate {pct(bm.most_disadvantaged_rate)} vs overall {pct(bm.overall_approval_rate)}</p>
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={iv} className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Metrics Comparison</h3>
          <p className="text-xs text-slate-500 mb-4">Lower = more fair · 🟢 &lt;0.10 · 🟡 0.10–0.20 · 🔴 &gt;0.20</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={metricsData} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 1]} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={(v) => [Number(v).toFixed(3), 'Value']} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {metricsData.map((e, i) => <Cell key={i} fill={getColor(e.value)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={iv} className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Fairness Radar</h3>
          <p className="text-xs text-slate-500 mb-4">Ideal shape: compact near the center</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={metricsData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 0.5]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <Radar name="Bias" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} formatter={(v) => [Number(v).toFixed(3), 'Score']} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Group Performance Line Chart */}
      {groupData.length > 0 && (
        <motion.div variants={iv} className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Group-by-Group Performance</h3>
          <p className="text-xs text-slate-500 mb-4">All lines should be at similar heights for a fair model</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={groupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="group" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="Accuracy %"  stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="Precision %" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="Recall %"    stroke="#22c55e" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="FPR %"       stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Group Metrics Table */}
      {Object.keys(gm).length > 0 && (
        <motion.div variants={iv} className="glass-card p-6 overflow-x-auto">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Detailed Group Metrics</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {['Group','Count','Approval','Accuracy','Precision','Recall (TPR)','FPR','FNR'].map(h => (
                  <th key={h} className="text-left py-3 px-3 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(gm).map(([g, m]) => (
                <tr key={g} className={`border-b border-slate-100 dark:border-slate-800 ${g === bm.most_disadvantaged_group ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{g === bm.most_disadvantaged_group ? '⚠️ ' : ''}{g}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{m.count}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{pct(m.approval_rate)}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{pct(m.accuracy)}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{pct(m.precision)}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{pct(m.true_positive_rate)}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{pct(m.false_positive_rate)}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{pct(m.false_negative_rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Mitigation Strategies */}
      {strats.length > 0 && (
        <motion.div variants={iv} className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Recommended Mitigation Strategies <span className="text-xs font-normal text-slate-500">(auto-prioritized)</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strats.map((s, i) => (
              <motion.div key={i} whileHover={{ y: -4 }} className="p-5 glass rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{s.name}</h4>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ml-2 whitespace-nowrap ${
                    s.phase === 'Pre-processing'  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                    s.phase === 'In-processing'   ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}`}>
                    {s.phase}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">{s.description}</p>
                {s.steps && s.steps.slice(0, 2).map((st, si) => (
                  <p key={si} className="text-xs text-slate-500 dark:text-slate-400 flex items-start space-x-1 mb-1"><span className="text-blue-500">→</span><span>{st}</span></p>
                ))}
                {s.regulatory_relevance && (
                  <div className="flex items-center space-x-1 text-xs text-slate-400 mt-2"><Scale className="w-3 h-3" /><span>{s.regulatory_relevance}</span></div>
                )}
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>Difficulty: <strong className="text-slate-600 dark:text-slate-300">{s.difficulty}</strong></span>
                  <span>Impact: <strong className="text-slate-600 dark:text-slate-300">{s.estimated_impact}</strong></span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Download */}
      <motion.div variants={iv} className="flex flex-col items-center space-y-3 pb-8">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={download} disabled={downloading}
          className="flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all disabled:opacity-50">
          {downloading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Generating PDF...</span></> : <><Download className="w-5 h-5" /><span>Download Full PDF Report</span></>}
        </motion.button>
        <p className="text-xs text-slate-500 dark:text-slate-400">Includes all metrics, charts, compliance badges &amp; mitigation strategies</p>
        {dlError && <p className="text-sm text-red-600 dark:text-red-400">{dlError}</p>}
      </motion.div>

    </motion.div>
  );
}

export default ResultsDisplay;
