import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Sparkles, ArrowLeft, Loader2, Database, ChevronDown } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

const USE_CASES = [
  { value: 'general', label: '🔍 General / Other' },
  { value: 'hiring', label: '💼 Hiring & Recruitment' },
  { value: 'credit', label: '🏦 Credit & Lending' },
  { value: 'healthcare', label: '🏥 Healthcare & Medical' },
];

const DEMO_SCENARIOS = [
  {
    key: 'hiring', label: '💼 Hiring — Gender Bias Demo', description: 'Resume screening model with gender disparity',
    data: {
      modelName: 'Resume Screening AI v1.2', protectedAttribute: 'gender', useCase: 'hiring',
      predictions: [1,0,1,1,0,1,1,0,1,1,0,0,1,1,0,1,1,0,1,0],
      actuals:     [1,0,1,1,1,0,1,0,1,1,0,0,1,0,0,1,1,0,1,0],
      groups: ['Male','Female','Male','Female','Male','Female','Male','Female','Male','Female','Male','Female','Male','Female','Male','Female','Male','Female','Male','Female']
    }
  },
  {
    key: 'credit', label: '🏦 Credit — Race Bias Demo', description: 'Credit approval model with racial disparities',
    data: {
      modelName: 'Credit Score Model v3.0', protectedAttribute: 'race', useCase: 'credit',
      predictions: [1,0,1,1,0,0,1,0,1,1,0,0,1,0,0,1,1,0,1,0,1,1,0,1],
      actuals:     [1,0,1,1,1,0,1,0,1,1,0,0,1,1,0,1,1,0,1,0,1,1,0,1],
      groups: ['White','Black','White','Hispanic','Black','White','White','Black','White','Hispanic','Black','Hispanic','White','Black','Black','White','Hispanic','Black','White','Hispanic','White','White','Black','Hispanic']
    }
  },
  {
    key: 'healthcare', label: '🏥 Healthcare — Age Bias Demo', description: 'Patient risk model with age disparities',
    data: {
      modelName: 'Patient Risk Predictor v2.1', protectedAttribute: 'age', useCase: 'healthcare',
      predictions: [1,0,1,1,0,1,0,0,1,1,0,1,1,0,0,1,1,0,1,0],
      actuals:     [1,0,1,1,0,1,1,0,1,1,0,1,1,0,0,1,1,0,1,1],
      groups: ['Under 40','Over 60','Under 40','Over 60','Under 40','Over 60','Under 40','Over 60','Under 40','Over 60','Under 40','Over 60','Under 40','Over 60','Under 40','Over 60','Under 40','Over 60','Under 40','Over 60']
    }
  }
];

function FileBox({ field, label, description, accept, loaded, onFileChange }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      <input type="file" accept={accept} onChange={(e) => onFileChange(e, field)} className="hidden" id={`fb-${field}`} />
      <label htmlFor={`fb-${field}`} className="group flex items-center justify-center w-full px-6 py-8 glass rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 cursor-pointer transition-all">
        <div className="text-center">
          {loaded > 0
            ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center"><CheckCircle2 className="w-10 h-10 text-green-500 mb-2" /><p className="text-sm font-medium text-slate-700 dark:text-slate-300">{loaded} items loaded ✓</p></motion.div>
            : <><Upload className="w-10 h-10 text-slate-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors" /><p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Click to upload</p><p className="text-xs text-slate-500">{description}</p></>
          }
        </div>
      </label>
    </div>
  );
}

function AuditForm({ onAuditComplete, onCancel }) {
  const [mode, setMode] = useState('manual');
  const [formData, setFormData] = useState({ modelName: '', protectedAttribute: 'gender', useCase: 'general', predictions: [], actuals: [], groups: [] });
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemos, setShowDemos] = useState(false);

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleFile = (e, field) => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const lines = ev.target.result.trim().split('\n');
        setFormData(p => ({
          ...p, [field]: field === 'groups'
            ? lines.map(l => l.trim())
            : lines.map(l => { const v = parseFloat(l); return isNaN(v) ? 0 : v; })
        }));
      } catch (err) { setError(`Parse error (${field}): ${err.message}`); }
    };
    r.readAsText(file);
  };

  const loadDemo = (s) => { setFormData({ ...s.data }); setMode('manual'); setShowDemos(false); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      let res;
      if (mode === 'csv') {
        if (!csvFile) { setError('Select a CSV file.'); setLoading(false); return; }
        const fd = new FormData();
        fd.append('file', csvFile);
        fd.append('model_name', formData.modelName || csvFile.name);
        fd.append('protected_attribute', formData.protectedAttribute);
        fd.append('use_case', formData.useCase);
        res = await axios.post(`${API_BASE_URL}/audit/csv`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        if (!formData.modelName) { setError('Enter a model name.'); setLoading(false); return; }
        if (!formData.predictions.length || !formData.actuals.length) { setError('Upload predictions & actuals, or load a demo.'); setLoading(false); return; }
        if (formData.predictions.length !== formData.actuals.length) { setError('Predictions and actuals length must match.'); setLoading(false); return; }
        res = await axios.post(`${API_BASE_URL}/audit`, {
          model_name: formData.modelName, protected_attribute: formData.protectedAttribute,
          use_case: formData.useCase, predictions: formData.predictions, actuals: formData.actuals,
          groups: formData.groups.length > 0 ? formData.groups : null
        });
      }
      onAuditComplete(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Backend not reachable. Start it on port 8000.');
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-4xl mx-auto">
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold gradient-text mb-2">Bias Audit Form</h2>
            <p className="text-slate-600 dark:text-slate-400">Upload data or use a real-world demo (hiring / credit / healthcare)</p>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onCancel} className="p-2 rounded-xl glass hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 hover:text-red-600 transition-colors"><X className="w-6 h-6" /></motion.button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-start space-x-3 p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-8">
          {[{ id: 'manual', label: '📄 Manual / File Upload' }, { id: 'csv', label: '📊 CSV Dataset Upload' }].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setError(''); }} className={`flex-1 py-3 text-sm font-semibold transition-all ${mode === m.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'glass text-slate-600 dark:text-slate-400 hover:text-slate-800'}`}>{m.label}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Model Name {mode === 'manual' ? '*' : '(optional)'}</label>
              <input type="text" name="modelName" value={formData.modelName} onChange={handleChange} placeholder="e.g., Credit Approval Model v2"
                className="w-full px-4 py-3 glass rounded-xl border border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Use Case *</label>
              <select name="useCase" value={formData.useCase} onChange={handleChange} className="w-full px-4 py-3 glass rounded-xl border border-slate-300 dark:border-slate-600 focus:border-blue-500 outline-none transition-all text-slate-800 dark:text-slate-200">
                {USE_CASES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Protected Attribute *</label>
            <select name="protectedAttribute" value={formData.protectedAttribute} onChange={handleChange} className="w-full px-4 py-3 glass rounded-xl border border-slate-300 dark:border-slate-600 focus:border-blue-500 outline-none transition-all text-slate-800 dark:text-slate-200">
              {['gender','race','age','income','disability','religion','nationality'].map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
            </select>
          </div>

          {mode === 'csv' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-1">📋 Required CSV columns (case-insensitive):</p>
                <code className="block text-xs bg-blue-100 dark:bg-blue-900/40 p-2 rounded mt-1">prediction, actual, group</code>
                <p className="mt-2 text-xs">Aliases: <strong>prediction/pred/score</strong> · <strong>actual/label/outcome</strong> · <strong>group/demographic/protected</strong></p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Upload CSV *</label>
                <input type="file" accept=".csv,.tsv,.txt" onChange={(e) => setCsvFile(e.target.files[0])} className="hidden" id="csv-upload" />
                <label htmlFor="csv-upload" className="group flex items-center justify-center w-full px-6 py-10 glass rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 cursor-pointer transition-all">
                  <div className="text-center">
                    {csvFile
                      ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center"><CheckCircle2 className="w-12 h-12 text-green-500 mb-3" /><p className="text-sm font-medium text-slate-700 dark:text-slate-300">{csvFile.name}</p><p className="text-xs text-slate-500 mt-1">{(csvFile.size / 1024).toFixed(1)} KB</p></motion.div>
                      : <><Database className="w-12 h-12 text-slate-400 group-hover:text-blue-500 mx-auto mb-3 transition-colors" /><p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Click to upload CSV</p><p className="text-xs text-slate-500">.csv · .tsv · .txt</p></>
                    }
                  </div>
                </label>
              </div>
            </motion.div>
          )}

          {mode === 'manual' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileBox field="predictions" label="Model Predictions *" description="One value per line (0 or 1)" accept=".txt,.csv" loaded={formData.predictions.length} onFileChange={handleFile} />
                <FileBox field="actuals" label="Actual Outcomes *" description="One value per line (0 or 1)" accept=".txt,.csv" loaded={formData.actuals.length} onFileChange={handleFile} />
              </div>
              <FileBox field="groups" label="Demographic Groups (Optional)" description="One label per line (e.g., Male, Female)" accept=".txt,.csv" loaded={formData.groups.length} onFileChange={handleFile} />
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="relative">
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowDemos(!showDemos)} disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 glass rounded-xl border border-slate-300 dark:border-slate-600 hover:border-purple-400 text-slate-700 dark:text-slate-300 font-medium transition-all disabled:opacity-50">
                <Sparkles className="w-5 h-5 text-purple-500" /><span>Load Demo</span><ChevronDown className={`w-4 h-4 transition-transform ${showDemos ? 'rotate-180' : ''}`} />
              </motion.button>
              <AnimatePresence>
                {showDemos && (
                  <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute bottom-full mb-2 left-0 z-50 w-80 glass-card p-2 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
                    {DEMO_SCENARIOS.map(s => (
                      <button key={s.key} type="button" onClick={() => loadDemo(s)} className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{s.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.description}</p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onCancel} disabled={loading}
              className="flex items-center justify-center space-x-2 px-6 py-3 glass rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium transition-all disabled:opacity-50">
              <ArrowLeft className="w-5 h-5" /><span>Cancel</span>
            </motion.button>
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all disabled:opacity-50">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Analyzing...</span></> : <><FileText className="w-5 h-5" /><span>Run Fairness Audit</span></>}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

export default AuditForm;
