import React, { useState, useEffect } from 'react';
import styles from '../styles/CompanyList.module.css';
import { apiClient, CompanyListItem } from '../api';

interface CompanyListProps {
  onSelectCompany: (companyId: number) => void;
}

export const CompanyList: React.FC<CompanyListProps> = ({ onSelectCompany }) => {
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const loadCompanies = async (reset = false) => {
    try {
      setLoading(true);
      const currentSkip = reset ? 0 : skip;
      const response = await apiClient.getAllCompanies(currentSkip, limit);
      const data = response.data;

      if (reset) {
        setCompanies(data.companies);
        setSkip(limit);
      } else {
        setCompanies(prev => [...prev, ...data.companies]);
        setSkip(prev => prev + limit);
      }

      setHasMore(data.companies.length === limit);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies(true);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadCompanies();
    }
  };

  if (error) {
    return (
      <div className={styles.error}>
        <p>❌ {error}</p>
        <button onClick={() => loadCompanies(true)}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      <div className={styles.header}>
        <h2>Company Database</h2>
        <p>Browse analyzed companies</p>
      </div>

      <div className={styles.companyGrid}>
        {companies.map((company) => (
          <div
            key={company.id}
            className={styles.companyCard}
            onClick={() => onSelectCompany(company.id)}
          >
            <div className={styles.companyHeader}>
              <h3>{company.name}</h3>
              <span className={styles.domain}>{company.domain}</span>
            </div>

            {company.description && (
              <p className={styles.description}>
                {company.description.length > 120
                  ? `${company.description.substring(0, 120)}...`
                  : company.description
                }
              </p>
            )}

            <div className={styles.companyMeta}>
              {company.founded_year && (
                <span className={styles.metaItem}>
                  Founded: {company.founded_year}
                </span>
              )}
              {company.employees_exact && (
                <span className={styles.metaItem}>
                  {company.employees_exact} employees
                </span>
              )}
              {company.raised_amount && (
                <span className={styles.metaItem}>
                  ${company.raised_amount.toLocaleString()} raised
                </span>
              )}
            </div>

            <div className={styles.socialLinks}>
              {company.twitter_handle && (
                <a
                  href={`https://twitter.com/${company.twitter_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={styles.socialLink}
                >
                  🐦
                </a>
              )}
              {company.github_org_name && (
                <a
                  href={`https://github.com/${company.github_org_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={styles.socialLink}
                >
                  🐙
                </a>
              )}
            </div>

            {company.created_at && (
              <div className={styles.timestamp}>
                Analyzed {new Date(company.created_at).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {loading && (
        <div className={styles.loading}>
          <p>Loading companies...</p>
        </div>
      )}

      {!loading && hasMore && (
        <div className={styles.loadMore}>
          <button onClick={handleLoadMore} className={styles.loadMoreButton}>
            Load More Companies
          </button>
        </div>
      )}

      {!loading && companies.length === 0 && (
        <div className={styles.empty}>
          <p>No companies found. Start by analyzing some domains!</p>
        </div>
      )}
    </div>
  );
};