import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Upload, 
  X, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Loader2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function AuditForm({ onAuditComplete, onCancel }) {
  const [formData, setFormData] = useState({
    modelName: '',
    protectedAttribute: 'gender',
    predictions: [],
    actuals: [],
    groups: []
  });

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
          
          if (field === 'groups') {
            const values = lines.map(line => line.trim());
            setFormData(prev => ({ ...prev, [field]: values }));
          } else {
            const values = lines.map(line => {
              const val = parseFloat(line.trim());
              return isNaN(val) ? 0 : val;
            });
            setFormData(prev => ({ ...prev, [field]: values }));
          }
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

  const FileUploadBox = ({ field, label, description, accept, loaded }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleFileUpload(e, field)}
          className="hidden"
          id={field}
        />
        <label
          htmlFor={field}
          className="group flex items-center justify-center w-full px-6 py-8 glass rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-all"
        >
          <div className="text-center">
            {loaded > 0 ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center"
              >
                <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {loaded} items loaded
                </p>
              </motion.div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-slate-400 group-hover:text-blue-500 mx-auto mb-3 transition-colors" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {description}
                </p>
              </>
            )}
          </div>
        </label>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-4xl mx-auto"
    >
      <div className="glass-card p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold gradient-text mb-2">Bias Audit Form</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Upload your model data to begin the fairness analysis
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCancel}
            className="p-2 rounded-xl glass hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start space-x-3 p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Model Name */}
          <div className="space-y-2">
            <label htmlFor="modelName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Model Name *
            </label>
            <input
              id="modelName"
              type="text"
              name="modelName"
              value={formData.modelName}
              onChange={handleInputChange}
              placeholder="e.g., Credit Approval Model"
              required
              className="w-full px-4 py-3 glass rounded-xl border border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
          </div>

          {/* Protected Attribute */}
          <div className="space-y-2">
            <label htmlFor="protectedAttribute" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Protected Attribute *
            </label>
            <select
              id="protectedAttribute"
              name="protectedAttribute"
              value={formData.protectedAttribute}
              onChange={handleInputChange}
              className="w-full px-4 py-3 glass rounded-xl border border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-800 dark:text-slate-200"
            >
              <option value="gender">Gender</option>
              <option value="race">Race</option>
              <option value="age">Age</option>
              <option value="income">Income Level</option>
            </select>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUploadBox
              field="predictions"
              label="Model Predictions *"
              description="One prediction per line (0 or 1)"
              accept=".txt,.csv"
              loaded={formData.predictions.length}
            />
            <FileUploadBox
              field="actuals"
              label="Actual Outcomes *"
              description="One outcome per line (0 or 1)"
              accept=".txt,.csv"
              loaded={formData.actuals.length}
            />
          </div>

          <FileUploadBox
            field="groups"
            label="Demographic Groups (Optional)"
            description="One group per line (e.g., Male, Female)"
            accept=".txt,.csv"
            loaded={formData.groups.length}
          />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadDemoData}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-6 py-3 glass rounded-xl border border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 text-slate-700 dark:text-slate-300 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              <span>Load Demo Data</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-6 py-3 glass rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Cancel</span>
            </motion.button>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Run Audit</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

export default AuditForm;
