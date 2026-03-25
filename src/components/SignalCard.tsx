import React, { useState } from 'react';
import styles from '../styles/SignalCard.module.css';
import { AnalysisResult, apiClient } from '../api';

interface SignalCardProps {
  result: AnalysisResult;
  isLoading?: boolean;
  domain?: string; // Optional domain prop to ensure it's always available
}

export const SignalCard: React.FC<SignalCardProps> = ({ result, isLoading = false, domain: propDomain }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  // Use domain from prop if available, otherwise from result
  const companyDomain = propDomain || result.domain || '';
  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.loadingSpinner}>⏳ Analyzing...</div>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className={styles.card + ' ' + styles.error}>
        <h3>❌ Analysis Error</h3>
        <p>{result.error}</p>
      </div>
    );
  }

  const score = result.signal_score ?? 0;
  const isSignal = result.is_signal ?? score >= 80;
  const color = isSignal ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  const handleDownloadPDF = async () => {
    if (!companyDomain) {
      alert('Company domain not available for PDF download');
      return;
    }

    setIsDownloading(true);
    try {
      const blob = await apiClient.downloadMemoPDF(companyDomain);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${result.name || companyDomain}_Investment_Memo.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to download PDF:', error);
      alert(`Failed to download PDF: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h2>{result.name || companyDomain || 'Unknown Company'}</h2>
          <p className={styles.domain}>{companyDomain || result.domain || 'N/A'}</p>
        </div>
        <div className={styles.scoreCircle} style={{ borderColor: color }}>
          <span className={styles.scoreText} style={{ color }}>
            {score}
          </span>
        </div>
      </div>

      <div className={styles.signalSection}>
        <div className={styles.signalBadge} style={{ backgroundColor: color }}>
          {isSignal ? '✅ SIGNAL' : '❌ NO SIGNAL'}
        </div>
        <p className={styles.strength}>Strength: <strong>{result.signal_strength?.toUpperCase()}</strong></p>
      </div>

      <div className={styles.rationale}>
        <h4>📝 Rationale</h4>
        <p>{result.rationale || 'No rationale provided.'}</p>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.detailItem}>
          <label>Category Fit</label>
          <span className={styles.badge}>{result.category_fit?.toUpperCase()}</span>
        </div>
        <div className={styles.detailItem}>
          <label>Traction</label>
          <span className={styles.badge}>{result.traction_assessment?.toUpperCase()}</span>
        </div>
        <div className={styles.detailItem}>
          <label>Team</label>
          <span className={styles.badge}>{result.team_assessment?.toUpperCase()}</span>
        </div>
        <div className={styles.detailItem}>
          <label>Early Indicators</label>
          <span className={styles.badge}>{result.early_stage_indicators?.toUpperCase()}</span>
        </div>
      </div>

      <div className={styles.actionSection}>
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading || !companyDomain}
          className={styles.downloadButton}
          type="button"
        >
          {isDownloading ? '⏳ Generating PDF...' : '📄 Download Investment Memo (PDF)'}
        </button>
      </div>
    </div>
  );
};
