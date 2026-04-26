import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Trophy, TrendingUp } from 'lucide-react';

export default function ModelComparison({ models = [] }) {
  const [comparisonType, setComparisonType] = useState('bias');

  if (!models || models.length < 1) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-8 rounded-xl shadow-lg text-center"
      >
        <p className="text-gray-500">Upload or select models to compare</p>
      </motion.div>
    );
  }

  const biasData = [
    {
      metric: 'Demographic Parity',
      'Model A': (models[0]?.demographic_parity || 0.25) * 100,
      'Model B': (models[1]?.demographic_parity || 0.15) * 100,
    },
    {
      metric: 'Equalized Odds',
      'Model A': (models[0]?.equalized_odds || 0.22) * 100,
      'Model B': (models[1]?.equalized_odds || 0.12) * 100,
    },
    {
      metric: 'Predictive Parity',
      'Model A': (models[0]?.predictive_parity || 0.20) * 100,
      'Model B': (models[1]?.predictive_parity || 0.10) * 100,
    },
  ];

  const accuracyData = [
    {
      metric: 'Accuracy',
      'Model A': (models[0]?.overall_accuracy || 0.85) * 100,
      'Model B': (models[1]?.overall_accuracy || 0.88) * 100,
    },
    {
      metric: 'Precision',
      'Model A': (models[0]?.precision || 0.82) * 100,
      'Model B': (models[1]?.precision || 0.85) * 100,
    },
    {
      metric: 'Recall',
      'Model A': (models[0]?.recall || 0.80) * 100,
      'Model B': (models[1]?.recall || 0.83) * 100,
    },
  ];

  const winner = models[0]?.demographic_parity < models[1]?.demographic_parity ? 'Model A' : 'Model B';
  const biasImprovement = (Math.abs(models[0]?.demographic_parity - models[1]?.demographic_parity) * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">Model Comparison</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setComparisonType('bias')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                comparisonType === 'bias'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Fairness
            </button>
            <button
              onClick={() => setComparisonType('accuracy')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                comparisonType === 'accuracy'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Accuracy
            </button>
          </div>
        </div>

        <div className="h-80 bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonType === 'bias' ? biasData : accuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="metric" />
              <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="Model A" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Model B" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Winner Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl shadow-lg border-2 border-yellow-200"
      >
        <div className="flex items-center gap-4">
          <Trophy className="w-12 h-12 text-yellow-500" />
          <div>
            <p className="text-sm text-gray-600">Fairest Model</p>
            <p className="text-2xl font-bold text-gray-800">{winner}</p>
            <p className="text-sm text-gray-600 mt-1">
              {biasImprovement}% better fairness metrics
            </p>
          </div>
        </div>
      </motion.div>

      {/* Detailed Comparison */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {[
          { title: 'Model A', color: 'from-blue-50 to-blue-100', metrics: models[0] },
          { title: 'Model B', color: 'from-red-50 to-red-100', metrics: models[1] },
        ].map((item, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${item.color} p-6 rounded-xl border-2 border-opacity-20`}>
            <h3 className="text-lg font-bold mb-4">{item.title}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Accuracy:</span>
                <span className="font-semibold">{((item.metrics?.overall_accuracy || 0.85) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Bias (Demographic):</span>
                <span className="font-semibold">{((item.metrics?.demographic_parity || 0.20) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Fairness Score:</span>
                <span className="font-semibold text-green-600">
                  {(100 - (item.metrics?.demographic_parity || 0.20) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Recommendation */}
      <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-500">
        <div className="flex gap-3">
          <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-green-900">Recommendation</p>
            <p className="text-sm text-green-800 mt-1">
              {winner === 'Model A'
                ? 'Deploy Model A for better fairness. Apply mitigation strategies to further reduce bias.'
                : 'Deploy Model B for better fairness. Monitor for any fairness issues over time.'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
