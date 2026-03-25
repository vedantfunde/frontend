import React, { useState } from 'react';
import styles from '../styles/Sidebar.module.css';

interface SidebarProps {
  onDomainSearch: (domain: string) => void;
  isLoading?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onDomainSearch, isLoading = false }) => {
  const [domain, setDomain] = useState('');
  const [scraperMode, setScraperMode] = useState<'twitter' | 'linkedin' | 'github' | 'clearbit' | null>(null);
  const [scraperUrl, setScraperUrl] = useState('');

  const handleAnalyze = () => {
    if (domain.trim()) {
      onDomainSearch(domain);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.container}>
        <h1>🏢 Company Dossier</h1>
        <p className={styles.tagline}>Investment Signal Analysis</p>

        <div className={styles.section}>
          <h3>Quick Analysis</h3>
          <input
            type="text"
            placeholder="Company domain (e.g., clearbit.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className={styles.input}
          />
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !domain.trim()}
            className={styles.button}
          >
            {isLoading ? '⏳ Analyzing...' : '🚀 Analyze'}
          </button>
        </div>

        <div className={styles.section}>
          <h3>Data Collection</h3>
          <p className={styles.sectionDesc}>Test individual scrapers</p>

          <div className={styles.scraperGroup}>
            {(['twitter', 'linkedin', 'github', 'clearbit'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setScraperMode(scraperMode === mode ? null : mode)}
                className={`${styles.scraperBtn} ${scraperMode === mode ? styles.active : ''}`}
              >
                {mode === 'twitter' && '𝕏'}
                {mode === 'linkedin' && '💼'}
                {mode === 'github' && '🐙'}
                {mode === 'clearbit' && '🔍'}
                {' '} {mode}
              </button>
            ))}
          </div>

          {scraperMode && (
            <div className={styles.scraperConfig}>
              <input
                type="text"
                placeholder={
                  scraperMode === 'clearbit'
                    ? 'Domain (e.g., clearbit.com)'
                    : 'URL or Handle'
                }
                value={scraperUrl}
                onChange={(e) => setScraperUrl(e.target.value)}
                className={styles.input}
              />
              <button className={styles.buttonSmall} disabled={!scraperUrl.trim()}>
                Fetch {scraperMode}
              </button>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h3>📊 Status</h3>
          <div className={styles.statusBox}>
            <p>Ready for analysis</p>
            <p className={styles.hint}>Enter a domain and click Analyze</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
