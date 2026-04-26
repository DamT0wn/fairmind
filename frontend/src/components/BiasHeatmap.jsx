import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BiasHeatmap({ groupMetrics }) {
  if (!groupMetrics || Object.keys(groupMetrics).length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-lg text-center"
      >
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Run an audit to see the bias heatmap</p>
      </motion.div>
    );
  }

  const getColorClass = (value, isAccuracy = false) => {
    if (isAccuracy) {
      if (value >= 0.9) return 'bg-green-100 text-green-900';
      if (value >= 0.8) return 'bg-yellow-100 text-yellow-900';
      return 'bg-red-100 text-red-900';
    }
    if (value >= 0.9) return 'bg-green-100 text-green-900';
    if (value >= 0.7) return 'bg-yellow-100 text-yellow-900';
    return 'bg-red-100 text-red-900';
  };

  const getBiasSeverity = (accuracy) => {
    if (accuracy >= 0.9) return { level: 'Low', icon: CheckCircle2, color: 'text-green-600' };
    if (accuracy >= 0.8) return { level: 'Medium', icon: AlertCircle, color: 'text-yellow-600' };
    return { level: 'High', icon: AlertTriangle, color: 'text-red-600' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-2 gradient-text">Bias Analysis Heatmap</h2>
      <p className="text-sm text-gray-600 mb-6">
        Color indicates fairness level: 🟢 Green (Fair) | 🟡 Yellow (Medium) | 🔴 Red (Biased)
      </p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-200">
              <th className="p-4 text-left font-semibold text-gray-700">Group</th>
              <th className="p-4 text-center font-semibold text-gray-700">Accuracy</th>
              <th className="p-4 text-center font-semibold text-gray-700">Precision</th>
              <th className="p-4 text-center font-semibold text-gray-700">Recall</th>
              <th className="p-4 text-center font-semibold text-gray-700">F1 Score</th>
              <th className="p-4 text-center font-semibold text-gray-700">Bias Level</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupMetrics).map(([group, metrics], idx) => {
              const severity = getBiasSeverity(metrics.accuracy || 0.5);
              const IconComponent = severity.icon;
              
              return (
                <motion.tr
                  key={group}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 font-semibold text-gray-800">{group}</td>
                  <td className={`p-4 text-center font-semibold rounded ${getColorClass(metrics.accuracy || 0.5, true)}`}>
                    {((metrics.accuracy || 0.5) * 100).toFixed(1)}%
                  </td>
                  <td className={`p-4 text-center font-semibold rounded ${getColorClass(metrics.precision || 0.5)}`}>
                    {((metrics.precision || 0.5) * 100).toFixed(1)}%
                  </td>
                  <td className={`p-4 text-center font-semibold rounded ${getColorClass(metrics.recall || 0.5)}`}>
                    {((metrics.recall || 0.5) * 100).toFixed(1)}%
                  </td>
                  <td className={`p-4 text-center font-semibold rounded ${getColorClass(metrics.f1 || 0.5)}`}>
                    {((metrics.f1 || 0.5) * 100).toFixed(1)}%
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <IconComponent className={`w-5 h-5 ${severity.color}`} />
                      <span className="font-semibold text-sm">{severity.level}</span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <p className="text-sm text-blue-800">
          <strong>💡 Interpretation:</strong> Compare metrics across groups. Large differences indicate bias.
        </p>
      </div>
    </motion.div>
  );
}
