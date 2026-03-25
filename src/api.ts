import axios from 'axios';

export interface SignalAnalysis {
  signal_score: number;
  signal_strength: 'strong' | 'moderate' | 'weak';
  is_signal: boolean;
  rationale: string;
  category_fit: 'good' | 'moderate' | 'poor';
  traction_assessment: 'good' | 'moderate' | 'poor';
  team_assessment: 'good' | 'moderate' | 'poor';
  early_stage_indicators: 'strong' | 'moderate' | 'weak';
}

export interface CompanyData {
  name: string;
  domain: string;
  description?: string;
  founded_year?: number;
  raised_amount?: number;
  annual_revenue_str?: string;
  employees_exact?: number;
  twitter_handle?: string;
  twitter_followers?: number;
  github_org_name?: string;
  repositories?: Array<any>;
}

export interface FounderData {
  id: number;
  full_name: string;
  email?: string;
  avatar_url?: string;
  location?: string;
  website?: string;
  bio: string;
  social_handles?: any;
  experience: any[];
  education: any[];
}

export interface CompanyDetail {
  id: number;
  name: string;
  legal_name?: string;
  domain: string;
  description?: string;
  founded_year?: number;
  logo_url?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lng?: number;
  raised_amount?: number;
  annual_revenue_str?: string;
  employees_exact?: number;
  employees_range?: string;
  alexa_global_rank?: number;
  traffic_rank_label?: string;
  tags?: string[];
  contact_info?: any;
  twitter_handle?: string;
  twitter_followers?: number;
  twitter_verified?: boolean;
  twitter_data_json?: any;
  github_org_name?: string;
  github_url?: string;
  repositories?: any[];
  created_at?: string;
  updated_at?: string;
  founders: FounderData[];
}

export interface CompanyListItem {
  id: number;
  name: string;
  domain: string;
  description?: string;
  founded_year?: number;
  raised_amount?: number;
  employees_exact?: number;
  twitter_handle?: string;
  github_org_name?: string;
  created_at?: string;
}

export interface AnalysisResult {
  status: string;
  company_id?: number;
  name?: string;
  domain?: string;
  description?: string;
  signal_score?: number;
  signal_strength?: string;
  is_signal?: boolean;
  rationale?: string;
  category_fit?: string;
  traction_assessment?: string;
  team_assessment?: string;
  early_stage_indicators?: string;
  error?: string;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

const client = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const apiClient = {
  // Scraper endpoints
  scrapTwitter: async (url: string, apiKey?: string) => {
    return client.post('/tools/twitter', { url, api_key: apiKey });
  },

  scrapeLinkedIn: async (url: string, apiKey?: string) => {
    return client.post('/tools/linkedin', { url, api_key: apiKey });
  },

  scrapeGitHub: async (url: string, apiKey?: string) => {
    return client.post('/tools/github', { url, api_key: apiKey });
  },

  scrapeClearbit: async (domain: string) => {
    return client.post('/tools/clearbit', { domain });
  },

  // Ingestion
  ingestCompanyData: async (data: any) => {
    return client.post('/ingest', data);
  },

  // Analysis
  analyzeCompany: async (domain: string): Promise<AnalysisResult> => {
    const response = await client.get(`/analyze/${domain}`);
    return response.data;
  },

  // Fetch all companies
  getAllCompanies: async (skip: number = 0, limit: number = 10): Promise<{ data: { companies: CompanyListItem[]; total: number; skip: number; limit: number } }> => {
    return client.get('/companies', { params: { skip, limit } });
  },

  // Fetch company details by ID
  getCompanyDetail: async (companyId: number): Promise<{ data: CompanyDetail }> => {
    return client.get(`/companies/${companyId}`);
  },

  // Check if company exists in database
  checkCompanyExists: async (domain: string): Promise<{ data: { exists: boolean; company_id?: number; name?: string; domain: string } }> => {
    return client.get(`/check-company/${domain}`);
  },

  // Full enrichment and analysis (scrape + store + analyze)
  enrichAndAnalyzeCompany: async (domain: string): Promise<{ data: any }> => {
    return client.post(`/enrich-and-analyze/${domain}`);
  },

  // Generate and download PDF memo
  downloadMemoPDF: async (domain?: string, companyId?: number): Promise<Blob> => {
    let url = '';
    if (domain) {
      url = `/generate-memo-pdf/domain/${domain}`;
    } else if (companyId) {
      url = `/generate-memo-pdf/company/${companyId}`;
    } else {
      throw new Error('Either domain or companyId must be provided');
    }
    
    // PDF generation takes longer due to LLM memo generation, increase timeout to 120 seconds
    const response = await client.get(url, {
      responseType: 'blob',
      timeout: 120000, // 2 minutes for PDF generation
    });
    return response.data;
  }
};

export default apiClient;
