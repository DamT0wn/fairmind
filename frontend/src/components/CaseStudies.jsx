import { motion } from 'framer-motion';
import { Zap, TrendingDown, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { caseStudies } from '../data/caseStudies';

export default function CaseStudies({ onSelectCase }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'from-red-500 to-red-600 text-red-50';
      case 'High': return 'from-orange-500 to-orange-600 text-orange-50';
      case 'Medium': return 'from-yellow-500 to-yellow-600 text-yellow-50';
      default: return 'from-blue-500 to-blue-600 text-blue-50';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Critical': return <AlertTriangle className="w-4 h-4" />;
      case 'High': return <AlertCircle className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-4xl font-bold gradient-text mb-2">Real-World Case Studies</h1>
        <p className="text-gray-600 text-lg">
          Explore how AI bias affects different industries and see solutions in action
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {caseStudies.map((study, idx) => (
          <motion.div
            key={study.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05, translateY: -5 }}
            onClick={() => onSelectCase?.(study)}
            className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer group hover:shadow-2xl transition-all"
          >
            {/* Header Gradient */}
            <div className={`bg-gradient-to-r ${getSeverityColor(study.severity)} p-6 text-white`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold">{study.name}</h3>
                {getSeverityIcon(study.severity)}
              </div>
              <p className="text-sm opacity-90">{study.industry}</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 text-sm mb-4">{study.description}</p>

              {/* Problem */}
              <div className="mb-4 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                <p className="text-xs font-semibold text-red-900">Problem</p>
                <p className="text-xs text-red-800 mt-1">{study.problem}</p>
              </div>

              {/* Impact */}
              <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500 mb-4">
                <p className="text-xs font-semibold text-orange-900">Impact</p>
                <p className="text-xs text-orange-800 mt-1">{study.impact}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-600">DP Bias</p>
                  <p className="text-sm font-bold text-gray-900">
                    {(study.expectedMetrics.demographicParity * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-600">EO Bias</p>
                  <p className="text-sm font-bold text-gray-900">
                    {(study.expectedMetrics.equalizedOdds * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-600">Accuracy</p>
                  <p className="text-sm font-bold text-gray-900">
                    {(study.expectedMetrics.overallAccuracy * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Solution */}
              <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all group-hover:shadow-xl">
                Explore Solution →
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200"
      >
        <div className="flex gap-4">
          <Zap className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-blue-900">Click any case study to run the audit</p>
            <p className="text-sm text-blue-800 mt-1">
              See real bias metrics, visualizations, and remediation recommendations
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
