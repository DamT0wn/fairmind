import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, TrendingDown, TrendingUp } from 'lucide-react';

export default function BiasSimulator({ originalMetrics = {} }) {
  const [adjustment, setAdjustment] = useState(0);
  const simulatedMetrics = useMemo(() => {
    const adjustmentPercent = adjustment / 100;
    return {
      demographicParity: Math.max(0, (originalMetrics.demographic_parity || 0.25) * (1 - adjustmentPercent)),
      equalizedOdds: Math.max(0, (originalMetrics.equalized_odds || 0.22) * (1 - adjustmentPercent)),
      predictiveParity: Math.max(0, (originalMetrics.predictive_parity || 0.20) * (1 - adjustmentPercent)),
      overallAccuracy: (originalMetrics.overall_accuracy || 0.85) - (adjustmentPercent * 0.02),
    };
  }, [adjustment, originalMetrics]);

  const data = [
    {
      metric: 'Demographic\nParity',
      original: (originalMetrics.demographic_parity || 0.25) * 100,
      simulated: simulatedMetrics.demographicParity * 100,
    },
    {
      metric: 'Equalized\nOdds',
      original: (originalMetrics.equalized_odds || 0.22) * 100,
      simulated: simulatedMetrics.equalizedOdds * 100,
    },
    {
      metric: 'Predictive\nParity',
      original: (originalMetrics.predictive_parity || 0.20) * 100,
      simulated: simulatedMetrics.predictiveParity * 100,
    },
  ];

  const baselineParity = originalMetrics.demographic_parity || 0.25;
  const biasReduction = ((baselineParity - simulatedMetrics.demographicParity) / baselineParity * 100).toFixed(1);
  const accuracyImpact = ((originalMetrics.overall_accuracy || 0.85) - simulatedMetrics.overallAccuracy).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold gradient-text mb-2">Bias Simulator</h2>
        <p className="text-gray-600 mb-6">
          Adjust the threshold to see how it impacts fairness and accuracy
        </p>

        {/* Slider */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <label className="text-lg font-semibold text-gray-700">
              Threshold Adjustment
            </label>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: adjustment > 0 ? Infinity : 0, duration: 1.5 }}
              className="text-3xl font-bold gradient-text"
            >
              {adjustment.toFixed(1)}%
            </motion.div>
          </div>

          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={adjustment}
            onChange={(e) => setAdjustment(parseFloat(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-red-400 to-green-400 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />

          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>No Adjustment</span>
            <span>Maximum Adjustment</span>
          </div>
        </div>

        {/* Impact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Bias Reduction */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200"
          >
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Bias Reduction</p>
                <p className="text-2xl font-bold text-green-600">{biasReduction}%</p>
              </div>
            </div>
          </motion.div>

          {/* Accuracy Impact */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-gradient-to-br ${
              Math.abs(parseFloat(accuracyImpact)) < 0.01
                ? 'from-blue-50 to-cyan-50 border-blue-200'
                : 'from-yellow-50 to-orange-50 border-yellow-200'
            } p-4 rounded-lg border-2`}
          >
            <div className="flex items-center gap-3">
              {Math.abs(parseFloat(accuracyImpact)) > 0.01 ? (
                <TrendingUp className="w-8 h-8 text-orange-600" />
              ) : (
                <Zap className="w-8 h-8 text-blue-600" />
              )}
              <div>
                <p className="text-sm text-gray-600">Accuracy Impact</p>
                <p className={`text-2xl font-bold ${
                  Math.abs(parseFloat(accuracyImpact)) > 0.01
                    ? 'text-orange-600'
                    : 'text-blue-600'
                }`}>
                  {parseFloat(accuracyImpact) > 0 ? '+' : ''}{accuracyImpact}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chart */}
        <div className="h-80 bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="metric" />
              <YAxis label={{ value: 'Bias Level (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
              <Legend />
              <Bar dataKey="original" fill="#ef4444" name="Before Adjustment" radius={[8, 8, 0, 0]} />
              <Bar dataKey="simulated" fill="#10b981" name="After Adjustment" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendation */}
      {adjustment > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500"
        >
          <p className="font-semibold text-blue-900">💡 Recommendation</p>
          <p className="text-sm text-blue-800 mt-2">
            With {adjustment.toFixed(1)}% threshold adjustment:
            <br />• Bias reduces by {biasReduction}%
            <br />• Accuracy changes by {accuracyImpact}%
            <br />• Consider this trade-off before implementation
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
