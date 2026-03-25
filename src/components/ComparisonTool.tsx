import React, { useState, useEffect } from 'react';
import styles from '../styles/ComparisonTool.module.css';
import { apiClient, CompanyListItem, CompanyDetail } from '../api';

interface ComparisonToolProps {
  onClose?: () => void;
}

export const ComparisonTool: React.FC<ComparisonToolProps> = ({ onClose }) => {
  const [availableCompanies, setAvailableCompanies] = useState<CompanyListItem[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<CompanyDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableCompanies();
  }, []);

  const loadAvailableCompanies = async () => {
    try {
      const response = await apiClient.getAllCompanies(0, 50); // Load more for selection
      setAvailableCompanies(response.data.companies);
    } catch (err: any) {
      setError('Failed to load companies for comparison');
    }
  };

  const handleCompanySelect = async (company: CompanyListItem) => {
    if (selectedCompanies.length >= 3) {
      alert('Maximum 3 companies can be compared at once');
      return;
    }

    if (selectedCompanies.find(c => c.id === company.id)) {
      return; // Already selected
    }

    setLoading(true);
    try {
      const response = await apiClient.getCompanyDetail(company.id);
      setSelectedCompanies(prev => [...prev, response.data]);
    } catch (err: any) {
      setError('Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCompany = (companyId: number) => {
    setSelectedCompanies(prev => prev.filter(c => c.id !== companyId));
  };

  const renderMetricComparison = (label: string, getValue: (company: CompanyDetail) => string | number | undefined) => (
    <div className={styles.comparisonRow}>
      <div className={styles.metricLabel}>{label}</div>
      {selectedCompanies.map(company => (
        <div key={company.id} className={styles.metricValue}>
          {getValue(company) || 'N/A'}
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.comparisonContainer}>
      {onClose && (
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
      )}

      <div className={styles.header}>
        <h2>Company Comparison Tool</h2>
        <p>Select up to 3 companies to compare side by side</p>
      </div>

      <div className={styles.content}>
        <div className={styles.selectionPanel}>
          <h3>Available Companies</h3>
          <div className={styles.companySelector}>
            {availableCompanies.map(company => {
              const isSelected = selectedCompanies.some(c => c.id === company.id);
              return (
                <div
                  key={company.id}
                  className={`${styles.selectorItem} ${isSelected ? styles.selected : ''}`}
                  onClick={() => !isSelected && handleCompanySelect(company)}
                >
                  <div className={styles.selectorName}>{company.name}</div>
                  <div className={styles.selectorDomain}>{company.domain}</div>
                  {isSelected && <span className={styles.checkmark}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.comparisonPanel}>
          <h3>Comparison ({selectedCompanies.length}/3)</h3>

          {selectedCompanies.length === 0 && (
            <div className={styles.emptyComparison}>
              <p>Select companies from the left panel to start comparing</p>
            </div>
          )}

          {selectedCompanies.length > 0 && (
            <div className={styles.comparisonTable}>
              <div className={styles.tableHeader}>
                <div className={styles.headerLabel}>Metric</div>
                {selectedCompanies.map(company => (
                  <div key={company.id} className={styles.headerCompany}>
                    <div className={styles.companyName}>{company.name}</div>
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveCompany(company.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.tableBody}>
                {renderMetricComparison('Founded Year', c => c.founded_year)}
                {renderMetricComparison('Employees', c => c.employees_exact)}
                {renderMetricComparison('Funding Raised', c => c.raised_amount ? `$${c.raised_amount.toLocaleString()}` : undefined)}
                {renderMetricComparison('Annual Revenue', c => c.annual_revenue_str)}
                {renderMetricComparison('Alexa Rank', c => c.alexa_global_rank ? `#${c.alexa_global_rank.toLocaleString()}` : undefined)}
                {renderMetricComparison('Twitter Followers', c => c.twitter_followers?.toLocaleString())}
                {renderMetricComparison('GitHub Stars', c => {
                  const repos = c.repositories || [];
                  const totalStars = repos.reduce((sum: number, repo: any) => sum + (repo.stars || 0), 0);
                  return totalStars > 0 ? totalStars.toLocaleString() : undefined;
                })}
                {renderMetricComparison('Location', c => [c.city, c.state, c.country].filter(Boolean).join(', '))}
                {renderMetricComparison('Founders Count', c => c.founders?.length)}
              </div>
            </div>
          )}

          {loading && (
            <div className={styles.loading}>
              <p>Loading company details...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p>❌ {error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};