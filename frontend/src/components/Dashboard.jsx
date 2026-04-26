import './Dashboard.css';

function Dashboard({ onStartAudit }) {
  return (
    <div className="dashboard">
      <section className="hero-section">
        <div className="hero-content">
          <h2>AI Bias Detection & Mitigation</h2>
          <p>
            FairScan helps you identify and eliminate bias in your machine learning models.
            Upload your model data and protected attributes to get a comprehensive bias audit report.
          </p>
          <button className="primary-button" onClick={onStartAudit}>
            Start Audit
          </button>
        </div>
      </section>

      <section className="features-section">
        <h3>Key Features</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>Comprehensive Analysis</h4>
            <p>Analyze multiple bias metrics including demographic parity, equalized odds, and more.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h4>Bias Detection</h4>
            <p>Identify disparities in model performance across different demographic groups.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛠️</div>
            <h4>Mitigation Strategies</h4>
            <p>Receive actionable recommendations to reduce and mitigate detected biases.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h4>Detailed Reports</h4>
            <p>Generate comprehensive PDF reports with visualizations and insights.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h3>How It Works</h3>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Upload Data</h4>
            <p>Upload your model predictions and actual outcomes</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Define Groups</h4>
            <p>Specify protected attributes and demographic groups</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Analyze Bias</h4>
            <p>Our system calculates fairness metrics for each group</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h4>Get Insights</h4>
            <p>Receive recommendations and download your audit report</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
