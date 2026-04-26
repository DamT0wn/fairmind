import { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import AuditForm from './components/AuditForm';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [auditResults, setAuditResults] = useState(null);

  const handleAuditComplete = (results) => {
    setAuditResults(results);
    setCurrentPage('results');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const handleStartAudit = () => {
    setCurrentPage('audit');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>FairScan AI Bias Auditor</h1>
          <p className="subtitle">Detect, Analyze & Mitigate AI Model Bias</p>
        </div>
      </header>

      <main className="app-main">
        {currentPage === 'dashboard' && (
          <Dashboard onStartAudit={handleStartAudit} />
        )}
        {currentPage === 'audit' && (
          <AuditForm 
            onAuditComplete={handleAuditComplete}
            onCancel={handleBackToDashboard}
          />
        )}
        {currentPage === 'results' && (
          <ResultsDisplay 
            results={auditResults}
            onBack={handleBackToDashboard}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 FairScan AI. Promoting Responsible AI Development.</p>
      </footer>
    </div>
  );
}

export default App;
