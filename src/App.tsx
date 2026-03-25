import React, { useState, useRef, useCallback, useEffect } from 'react';
import styles from './styles/App.module.css';
import { Sidebar } from './components/Sidebar';
import { SignalCard } from './components/SignalCard';
import { CompanyList } from './components/CompanyList';
import { CompanyDetail } from './components/CompanyDetail';
import { ComparisonTool } from './components/ComparisonTool';
import { apiClient, AnalysisResult, CompanyDetail as CompanyDetailType } from './api';

interface ResultItem {
  id: string;
  domain: string;
  result: AnalysisResult;
  timestamp: Date;
}

type ViewMode = 'analysis' | 'browse' | 'compare';

export const App: React.FC = () => {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('analysis');
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetailType | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const endOfResultsRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll (if needed)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && results.length > 0) {
          // Trigger load more if implemented
          console.log('Load more results...');
        }
      },
      { threshold: 0.1 }
    );

    if (endOfResultsRef.current) {
      observer.observe(endOfResultsRef.current);
    }

    return () => {
      if (endOfResultsRef.current) {
        observer.unobserve(endOfResultsRef.current);
      }
    };
  }, [results]);

  const handleDomainSearch = useCallback(async (domain: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Check if company exists in database
      const checkResponse = await apiClient.checkCompanyExists(domain);
      const companyExists = checkResponse.data.exists;

      let analysisResult: AnalysisResult;
      let companyName: string | undefined = checkResponse.data.name;

      if (companyExists) {
        // Company exists: Just run LLM analysis
        console.log(`Company ${domain} found in database, running analysis...`);
        analysisResult = await apiClient.analyzeCompany(domain);
      } else {
        // Company doesn't exist: Scrape, store, then analyze
        console.log(`Company ${domain} not found, scraping and storing...`);
        const response = await apiClient.enrichAndAnalyzeCompany(domain);
        // Extract analysis result from the response
        analysisResult = response.data.data?.analysis || response.data;
        
        // Ensure name and domain are set
        if (!analysisResult.name || !analysisResult.domain) {
          // Try to get from company record
          if (response.data.data?.id) {
            try {
              const companyDetail = await apiClient.getCompanyDetail(response.data.data.id);
              analysisResult.name = companyDetail.data.name;
              analysisResult.domain = companyDetail.data.domain;
              analysisResult.description = companyDetail.data.description;
              companyName = companyDetail.data.name;
            } catch (e) {
              console.warn('Could not fetch company details for name/domain', e);
            }
          }
        }
      }

      // Ensure domain and name are set
      if (!analysisResult.domain) {
        analysisResult.domain = domain;
      }
      // If name is missing but we have company info, use it
      if (!analysisResult.name && companyName) {
        analysisResult.name = companyName;
      }

      const resultItem: ResultItem = {
        id: `${domain}-${Date.now()}`,
        domain: analysisResult.domain || domain,
        result: analysisResult,
        timestamp: new Date()
      };

      console.log('Analysis result:', analysisResult); // Debug log

      setResults((prev) => [resultItem, ...prev]);
      setCurrentView('analysis'); // Switch to analysis view
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Unknown error';
      setError(`Failed to analyze "${domain}": ${errorMsg}`);
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectCompany = useCallback(async (companyId: number) => {
    try {
      const response = await apiClient.getCompanyDetail(companyId);
      setSelectedCompany(response.data);
    } catch (err: any) {
      console.error('Failed to load company details:', err);
      setError('Failed to load company details');
    }
  }, []);

  const handleCloseDetail = () => {
    setSelectedCompany(null);
  };

  const handleOpenComparison = () => {
    setShowComparison(true);
  };

  const handleCloseComparison = () => {
    setShowComparison(false);
  };

  return (
    <div className={styles.appContainer}>
      <Sidebar onDomainSearch={handleDomainSearch} isLoading={isLoading} />

      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Investment Recommendation System</h1>
          <p>Deep analysis for VC investment decisions</p>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${currentView === 'analysis' ? styles.active : ''}`}
            onClick={() => setCurrentView('analysis')}
          >
            📊 Analysis Results
          </button>
          <button
            className={`${styles.tab} ${currentView === 'browse' ? styles.active : ''}`}
            onClick={() => setCurrentView('browse')}
          >
            🏢 Browse Companies
          </button>
          <button
            className={`${styles.tab} ${currentView === 'compare' ? styles.active : ''}`}
            onClick={() => setCurrentView('compare')}
          >
            ⚖️ Compare Companies
          </button>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <p>⚠️ {error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {/* Analysis View */}
        {currentView === 'analysis' && (
          <div className={styles.resultsContainer}>
            {results.length === 0 && !isLoading && (
              <div className={styles.emptyState}>
                <h2>👋 Welcome</h2>
                <p>Search for a company domain to begin analysis</p>
                <p className={styles.hint}>Example: clearbit.com, github.com, stripe.com</p>
              </div>
            )}

            {results.map((item) => (
              <div key={item.id} className={styles.resultItem}>
                <span className={styles.timestamp}>
                  {item.timestamp.toLocaleTimeString()}
                </span>
                <SignalCard result={item.result} isLoading={false} domain={item.domain} />
              </div>
            ))}

            {isLoading && (
              <div className={styles.resultItem}>
                <SignalCard result={{} as AnalysisResult} isLoading={true} />
              </div>
            )}

            <div ref={endOfResultsRef} className={styles.endMarker} />
          </div>
        )}

        {/* Browse View */}
        {currentView === 'browse' && (
          <CompanyList onSelectCompany={handleSelectCompany} />
        )}

        {/* Compare View */}
        {currentView === 'compare' && (
          <div className={styles.comparePlaceholder}>
            <h2>Company Comparison Tool</h2>
            <p>Select companies to compare their metrics side by side</p>
            <button className={styles.openCompareButton} onClick={handleOpenComparison}>
              Open Comparison Tool
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedCompany && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <CompanyDetail company={selectedCompany} onClose={handleCloseDetail} />
          </div>
        </div>
      )}

      {showComparison && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <ComparisonTool onClose={handleCloseComparison} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
