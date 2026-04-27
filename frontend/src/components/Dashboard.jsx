import { motion } from 'framer-motion';
import { 
  Sparkles, 
  BarChart3, 
  Shield, 
  FileText, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  ArrowRight,
  Zap
} from 'lucide-react';

function Dashboard({ onStartAudit }) {
  const features = [
    {
      icon: BarChart3,
      title: 'Comprehensive Analysis',
      description: 'Analyze multiple bias metrics including demographic parity, equalized odds, and predictive parity.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Bias Detection',
      description: 'Identify disparities in model performance across different demographic groups with precision.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Mitigation Strategies',
      description: 'Receive actionable, data-driven recommendations to reduce and mitigate detected biases.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: FileText,
      title: 'Detailed Reports',
      description: 'Generate comprehensive PDF reports with visualizations, insights, and compliance documentation.',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const steps = [
    { number: '01', title: 'Upload Data', description: 'Upload your model predictions and actual outcomes' },
    { number: '02', title: 'Define Groups', description: 'Specify protected attributes and demographic groups' },
    { number: '03', title: 'Analyze Bias', description: 'Our system calculates fairness metrics for each group' },
    { number: '04', title: 'Get Insights', description: 'Receive recommendations and download your audit report' }
  ];

  const stats = [
    { label: 'Models Audited', value: '10K+', icon: TrendingUp },
    { label: 'Bias Issues Found', value: '2.5K+', icon: Shield },
    { label: 'Organizations', value: '500+', icon: Users }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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
      className="space-y-16"
    >
      {/* Hero Section */}
      <motion.section variants={itemVariants} className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-600/5 dark:to-indigo-600/5 rounded-3xl blur-3xl"></div>
        
        <div className="relative glass-card p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Fairness Analysis</span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Detect & Eliminate</span>
            <br />
            <span className="text-slate-800 dark:text-slate-200">AI Model Bias</span>
          </h2>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            FairMind helps you identify and eliminate bias in your machine learning models.
            Upload your model data and protected attributes to get a comprehensive bias audit report.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartAudit}
            className="group relative inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
          >
            <span>Start Audit</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="glass p-6 rounded-2xl"
              >
                <stat.icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3 mx-auto" />
                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section variants={itemVariants}>
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            Powerful Features
          </h3>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to ensure your AI models are fair and unbiased
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group glass-card p-8 cursor-pointer"
            >
              <div className="relative mb-6">
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                <div className={`relative w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              
              <h4 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                {feature.title}
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section variants={itemVariants}>
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            How It Works
          </h3>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Get started in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="relative glass-card p-6"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></div>
              )}
              
              <div className="text-5xl font-bold gradient-text mb-4 opacity-50">
                {step.number}
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                {step.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {step.description}
              </p>
              <CheckCircle2 className="w-6 h-6 text-green-500 mt-4" />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section variants={itemVariants}>
        <div className="relative glass-card p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 dark:from-blue-600/5 dark:via-purple-600/5 dark:to-indigo-600/5"></div>
          
          <div className="relative">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Ready to Audit Your Model?
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Join hundreds of organizations ensuring their AI models are fair and unbiased
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartAudit}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default Dashboard;
