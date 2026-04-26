export const caseStudies = [
  {
    id: 1,
    name: "Loan Approval Bias",
    industry: "Finance",
    severity: "Critical",
    description: "Detect gender bias in credit approval decisions",
    problem: "Banks denying loans unfairly to women applicants",
    impact: "Affects 50M+ loan applications annually",
    data: {
      modelName: "Credit Approval Model",
      totalSamples: 100,
      protectedAttribute: "gender",
      predictions: Array.from({length: 100}, (_, i) => i % 3 === 0 ? 0 : (Math.random() > (i % 2 === 0 ? 0.7 : 0.5) ? 1 : 0)),
      actuals: Array.from({length: 100}, (_, i) => i % 4 === 0 ? 0 : (Math.random() > 0.3 ? 1 : 0)),
      groups: Array.from({length: 100}, (_, i) => i % 2 === 0 ? "Female" : "Male")
    },
    expectedMetrics: {
      demographicParity: 0.25,
      equalizedOdds: 0.18,
      predictiveParity: 0.22,
      overallAccuracy: 0.78
    },
    solution: "Adjust approval threshold by 3% for protected group",
    impactAfter: "Reduce bias by 80%, maintain 99% accuracy"
  },
  {
    id: 2,
    name: "Job Screening Bias",
    industry: "HR/Recruitment",
    severity: "High",
    description: "Resume screening AI discrimination",
    problem: "Names from minorities filtered out unfairly",
    impact: "Affects 100M+ job applications yearly",
    data: {
      modelName: "Resume Screening Model",
      totalSamples: 100,
      protectedAttribute: "ethnicity",
      predictions: Array.from({length: 100}, () => Math.random() > 0.4 ? 1 : 0),
      actuals: Array.from({length: 100}, () => Math.random() > 0.35 ? 1 : 0),
      groups: Array.from({length: 100}, (_, i) => i % 3 === 0 ? "Hispanic" : i % 3 === 1 ? "African American" : "Caucasian")
    },
    expectedMetrics: {
      demographicParity: 0.32,
      equalizedOdds: 0.28,
      predictiveParity: 0.25,
      overallAccuracy: 0.72
    },
    solution: "Balance dataset with stratified sampling",
    impactAfter: "Reduce bias to 5%, accuracy 95%"
  },
  {
    id: 3,
    name: "Credit Scoring Bias",
    industry: "Fintech",
    severity: "High",
    description: "Racial bias in credit score predictions",
    problem: "Lower credit scores assigned to minorities",
    impact: "Affects billions in lending decisions",
    data: {
      modelName: "Credit Score Model",
      totalSamples: 100,
      protectedAttribute: "race",
      predictions: Array.from({length: 100}, () => Math.random() > 0.5 ? 1 : 0),
      actuals: Array.from({length: 100}, () => Math.random() > 0.48 ? 1 : 0),
      groups: Array.from({length: 100}, (_, i) => ["White", "Black", "Asian", "Hispanic"][i % 4])
    },
    expectedMetrics: {
      demographicParity: 0.28,
      equalizedOdds: 0.22,
      predictiveParity: 0.19,
      overallAccuracy: 0.81
    },
    solution: "Apply fairness-aware pre-processing",
    impactAfter: "Achieve demographic parity < 2%"
  },
  {
    id: 4,
    name: "Healthcare Admission Bias",
    industry: "Healthcare",
    severity: "Critical",
    description: "Age and gender bias in hospital admissions",
    problem: "Older women denied admission more often",
    impact: "Affects patient health outcomes",
    data: {
      modelName: "Hospital Admission Model",
      totalSamples: 100,
      protectedAttribute: "age_group",
      predictions: Array.from({length: 100}, (_, i) => i % 5 > 2 ? 0 : (Math.random() > 0.6 ? 1 : 0)),
      actuals: Array.from({length: 100}, () => Math.random() > 0.45 ? 1 : 0),
      groups: Array.from({length: 100}, (_, i) => ["Young", "Middle", "Elderly"][i % 3])
    },
    expectedMetrics: {
      demographicParity: 0.35,
      equalizedOdds: 0.31,
      predictiveParity: 0.27,
      overallAccuracy: 0.76
    },
    solution: "Retrain with balanced age groups",
    impactAfter: "Equal opportunity for all age groups"
  },
  {
    id: 5,
    name: "Insurance Pricing Bias",
    industry: "Insurance",
    severity: "High",
    description: "Gender bias in insurance premium pricing",
    problem: "Women charged higher premiums unfairly",
    impact: "Affects millions of insurance policies",
    data: {
      modelName: "Insurance Pricing Model",
      totalSamples: 100,
      protectedAttribute: "gender",
      predictions: Array.from({length: 100}, () => Math.random() > 0.45 ? 1 : 0),
      actuals: Array.from({length: 100}, () => Math.random() > 0.42 ? 1 : 0),
      groups: Array.from({length: 100}, (_, i) => i % 2 === 0 ? "Female" : "Male")
    },
    expectedMetrics: {
      demographicParity: 0.23,
      equalizedOdds: 0.19,
      predictiveParity: 0.21,
      overallAccuracy: 0.82
    },
    solution: "Remove gender from decision factors",
    impactAfter: "Fair pricing across all genders"
  }
];
