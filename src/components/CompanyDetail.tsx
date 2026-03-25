import React, { useState } from 'react';
import styles from '../styles/CompanyDetail.module.css';
import { CompanyDetail as CompanyDetailType, FounderData, apiClient } from '../api';

interface CompanyDetailProps {
  company: CompanyDetailType;
  onClose?: () => void;
}

const FounderCard: React.FC<{ founder: FounderData }> = ({ founder }) => (
  <div className={styles.founderCard}>
    <div className={styles.founderHeader}>
      <img
        src={founder.avatar_url || '/default-avatar.png'}
        alt={founder.full_name}
        className={styles.founderAvatar}
      />
      <div>
        <h4>{founder.full_name}</h4>
        {founder.location && <p className={styles.founderLocation}>{founder.location}</p>}
      </div>
    </div>

    {founder.bio && (
      <div className={styles.founderBio}>
        <p>{founder.bio}</p>
      </div>
    )}

    {founder.experience && founder.experience.length > 0 && (
      <div className={styles.founderSection}>
        <h5>Experience</h5>
        <div className={styles.experienceList}>
          {founder.experience.slice(0, 3).map((exp: any, index: number) => (
            <div key={index} className={styles.experienceItem}>
              <strong>{exp.title}</strong> at {exp.company}
              {exp.duration && <span className={styles.duration}> • {exp.duration}</span>}
            </div>
          ))}
        </div>
      </div>
    )}

    {founder.education && founder.education.length > 0 && (
      <div className={styles.founderSection}>
        <h5>Education</h5>
        <div className={styles.educationList}>
          {founder.education.slice(0, 2).map((edu: any, index: number) => (
            <div key={index} className={styles.educationItem}>
              <strong>{edu.degree}</strong> from {edu.institution}
            </div>
          ))}
        </div>
      </div>
    )}

    {founder.social_handles && (
      <div className={styles.founderSocial}>
        {founder.social_handles.linkedin && (
          <a href={founder.social_handles.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        )}
        {founder.website && (
          <a href={founder.website} target="_blank" rel="noopener noreferrer">
            Website
          </a>
        )}
      </div>
    )}
  </div>
);

export const CompanyDetail: React.FC<CompanyDetailProps> = ({ company, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const blob = await apiClient.downloadMemoPDF(undefined, company.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${company.name.replace(/\s+/g, '_')}_Investment_Memo.pdf`;
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
    <div className={styles.detailContainer}>
      {onClose && (
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
      )}

      <div className={styles.companyHeader}>
        {company.logo_url && (
          <img src={company.logo_url} alt={company.name} className={styles.companyLogo} />
        )}
        <div>
          <h1>{company.name}</h1>
          <p className={styles.domain}>{company.domain}</p>
          {company.description && <p className={styles.description}>{company.description}</p>}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className={styles.downloadButton}
          >
            {isDownloading ? '⏳ Generating PDF...' : '📄 Download Investment Memo (PDF)'}
          </button>
        </div>
      </div>

      <div className={styles.companyGrid}>
        <div className={styles.infoSection}>
          <h3>Company Information</h3>
          <div className={styles.infoGrid}>
            {company.founded_year && (
              <div className={styles.infoItem}>
                <label>Founded</label>
                <span>{company.founded_year}</span>
              </div>
            )}
            {company.employees_exact && (
              <div className={styles.infoItem}>
                <label>Employees</label>
                <span>{company.employees_exact}</span>
              </div>
            )}
            {company.raised_amount && (
              <div className={styles.infoItem}>
                <label>Funding Raised</label>
                <span>${company.raised_amount.toLocaleString()}</span>
              </div>
            )}
            {company.annual_revenue_str && (
              <div className={styles.infoItem}>
                <label>Annual Revenue</label>
                <span>{company.annual_revenue_str}</span>
              </div>
            )}
            {company.alexa_global_rank && (
              <div className={styles.infoItem}>
                <label>Global Rank</label>
                <span>#{company.alexa_global_rank.toLocaleString()}</span>
              </div>
            )}
            {company.country && (
              <div className={styles.infoItem}>
                <label>Location</label>
                <span>{[company.city, company.state, company.country].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.socialSection}>
          <h3>Social Presence</h3>
          <div className={styles.socialLinks}>
            {company.twitter_handle && (
              <a
                href={`https://twitter.com/${company.twitter_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                🐦 Twitter: @{company.twitter_handle}
                {company.twitter_followers && ` (${company.twitter_followers.toLocaleString()} followers)`}
              </a>
            )}
            {company.github_org_name && (
              <a
                href={company.github_url || `https://github.com/${company.github_org_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                🐙 GitHub: {company.github_org_name}
              </a>
            )}
          </div>

          {company.tags && company.tags.length > 0 && (
            <div className={styles.tagsSection}>
              <h4>Tags</h4>
              <div className={styles.tags}>
                {company.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {company.founders && company.founders.length > 0 && (
        <div className={styles.foundersSection}>
          <h3>Founders & Team</h3>
          <div className={styles.foundersGrid}>
            {company.founders.map((founder) => (
              <FounderCard key={founder.id} founder={founder} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};