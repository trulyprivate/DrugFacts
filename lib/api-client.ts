// API client for communicating with the NestJS backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Drug {
  drugName: string;
  genericName?: string;
  activeIngredient?: string;
  slug: string;
  setId: string;
  labeler?: string;
  manufacturer?: string;
  therapeuticClass?: string;
  dea?: string;
  boxedWarning?: string;
  warnings?: string;
  precautions?: string;
  adverseReactions?: string;
  drugInteractions?: string;
  contraindications?: string;
  indicationsAndUsage?: string;
  dosageAndAdministration?: string;
  overdosage?: string;
  description?: string;
  clinicalPharmacology?: string;
  nonClinicalToxicology?: string;
  clinicalStudies?: string;
  howSupplied?: string;
  patientCounseling?: string;
  principalDisplayPanel?: string;
  spl?: string;
  aiClassification?: {
    primary_therapeutic_class: string;
    pharmacological_class: string;
    chemical_class: string;
    atc_code: string;
    controlled_substance_schedule: string;
    therapeutic_indication: string;
    mechanism_of_action_summary: string;
    confidence_level: string;
    source_sections_used: string[];
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchResponse {
  data: Drug[];
  pagination: PaginationInfo;
}

export interface SearchParams {
  q?: string;
  therapeuticClass?: string;
  manufacturer?: string;
  page?: number;
  limit?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  async searchDrugs(params: SearchParams = {}): Promise<SearchResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.q) queryParams.append('q', params.q);
    if (params.therapeuticClass) queryParams.append('therapeuticClass', params.therapeuticClass);
    if (params.manufacturer) queryParams.append('manufacturer', params.manufacturer);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${this.baseUrl}/api/drugs?${queryParams}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getAllDrugsIndex(): Promise<Drug[]> {
    const response = await fetch(`${this.baseUrl}/api/drugs/index`);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getDrugBySlug(slug: string): Promise<{ data: Drug }> {
    const response = await fetch(`${this.baseUrl}/api/drugs/${slug}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Drug not found');
      }
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getTherapeuticClasses(): Promise<{ data: string[] }> {
    const response = await fetch(`${this.baseUrl}/api/drugs/therapeutic-classes`);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getManufacturers(): Promise<{ data: string[] }> {
    const response = await fetch(`${this.baseUrl}/api/drugs/manufacturers`);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getDrugCount(): Promise<{ count: number }> {
    const response = await fetch(`${this.baseUrl}/api/drugs/count`);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async checkHealth(): Promise<{ status: string; timestamp: string; service: string; version: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export the class for custom instances if needed
export default ApiClient;