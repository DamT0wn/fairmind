import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle2, AlertCircle, FileText, Loader } from 'lucide-react';
import apiClient from '../services/api';

export default function FileUpload({ onDataLoaded, onError }) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/upload-data', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult({
        success: true,
        data: response.data
      });
      onDataLoaded?.(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Upload failed. Please check file format.';
      setResult({
        success: false,
        error: errorMsg
      });
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-blue-300 bg-blue-50 hover:border-blue-500 hover:bg-blue-100'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.tsv"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />

        <motion.div
          animate={loading ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: loading ? Infinity : 0, duration: 1.5 }}
        >
          {loading ? (
            <Loader className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
          ) : (
            <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          )}
        </motion.div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {loading ? 'Uploading...' : 'Drop your CSV file here'}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          or click to browse • Supports CSV, XLSX, TSV
        </p>

        <div className="text-xs text-gray-500">
          <p>Required columns: predictions, actuals, groups</p>
        </div>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border-l-4 ${
            result.success
              ? 'bg-green-50 border-green-500'
              : 'bg-red-50 border-red-500'
          }`}
        >
          <div className="flex gap-3 items-start">
            {result.success ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">Upload Successful!</p>
                  <p className="text-sm text-green-800 mt-1">
                    Rows: {result.data?.rows} • Columns: {result.data?.columns?.join(', ')}
                  </p>
                  {result.data?.dataQuality && (
                    <p className="text-xs text-green-700 mt-2">
                      Missing values: {JSON.stringify(result.data.dataQuality.missingValues)}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Upload Failed</p>
                  <p className="text-sm text-red-800 mt-1">{result.error}</p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
