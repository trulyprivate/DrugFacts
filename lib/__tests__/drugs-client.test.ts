/**
 * Integration tests for client-side drug utilities
 */

import { 
  getAllDrugsClient,
  getAllDrugsClientPaginated,
  searchDrugsClient,
  getDrugBySlugClient,
  getDrugsByTherapeuticClassClient,
  getDrugsByManufacturerClient,
  checkApiHealth
} from '../drugs-client'
import { DrugLabel } from '../../types/drug'

// Mock fetch globally
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('Client-side Drug Utilities', () => {
  const sampleDrug: DrugLabel = {
    drugName: 'Emgality',
    setId: '33a147be-233a-40e8-a55e-e40936e28db0',
    slug: 'emgality-33a147b',
    labeler: 'Eli Lilly and Company',
    therapeuticClass: 'CGRP Antagonist',
    manufacturer: 'Eli Lilly and Company',
    genericName: 'galcanezumab-gnlm'
  }

  const mockApiResponse = {
    data: [sampleDrug],
    pagination: {
      page: 1,
      limit: 50,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllDrugsClient', () => {
    it('should fetch drugs from API successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      } as Response)

      const drugs = await getAllDrugsClient()

      expect(mockFetch).toHaveBeenCalledWith('/api/drugs?page=1&limit=50', {
        headers: { 'Content-Type': 'application/json' }
      })
      expect(drugs).toEqual([sampleDrug])
    })

    it('should fallback to JSON file when API fails', async () => {
      // Mock API failure
      mockFetch.mockRejectedValueOnce(new Error('API Error'))
      
      // Mock successful fallback
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [sampleDrug]
      } as Response)

      const drugs = await getAllDrugsClient()

      expect(mockFetch).toHaveBeenCalledWith('/data/drugs/index.json')
      expect(drugs).toEqual([sampleDrug])
    })

    it('should return empty array when both API and fallback fail', async () => {
      mockFetch.mockRejectedValue(new Error('Network Error'))

      const drugs = await getAllDrugsClient()

      expect(drugs).toEqual([])
    })

    it('should handle custom pagination parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      } as Response)

      await getAllDrugsClient(2, 25)

      expect(mockFetch).toHaveBeenCalledWith('/api/drugs?page=2&limit=25', {
        headers: { 'Content-Type': 'application/json' }
      })
    })
  })

  describe('getAllDrugsClientPaginated', () => {
    it('should return paginated results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      } as Response)

      const result = await getAllDrugsClientPaginated(1, 50)

      expect(result.data).toEqual([sampleDrug])
      expect(result.pagination).toEqual(mockApiResponse.pagination)
    })

    it('should provide default pagination when API response lacks it', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [sampleDrug] })
      } as Response)

      const result = await getAllDrugsClientPaginated()

      expect(result.pagination).toEqual({
        page: 1,
        limit: 50,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      })
    })

    it('should handle errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'))

      const result = await getAllDrugsClientPaginated()

      expect(result.data).toEqual([])
      expect(result.pagination.total).toBe(0)
    })
  })

  describe('searchDrugsClient', () => {
    it('should search drugs via API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      } as Response)

      const drugs = await searchDrugsClient('emgality')

      expect(mockFetch).toHaveBeenCalledWith('/api/drugs?q=emgality&page=1&limit=50', {
        headers: { 'Content-Type': 'application/json' }
      })
      expect(drugs).toEqual([sampleDrug])
    })

    it('should return all drugs for empty query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      } as Response)

      const drugs = await searchDrugsClient('')

      expect(mockFetch).toHaveBeenCalledWith('/api/drugs?page=1&limit=50', {
        headers: { 'Content-Type': 'application/json' }
      })
    })

    it('should fallback to client-side search when API fails', async () => {
      // Mock API failure
      mockFetch.mockRejectedValueOnce(new Error('API Error'))
      
      // Mock successful fallback
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [sampleDrug, {
          ...sampleDrug,
          drugName: 'Other Drug',
          slug: 'other-drug'
        }]
      } as Response)

      const drugs = await searchDrugsClient('emgality')

      expect(mockFetch).toHaveBeenCalledWith('/data/drugs/index.json')
      expect(drugs).toHaveLength(1)
      expect(drugs[0].drugName).toBe('Emgality')
    })

    it('should handle URL encoding for special characters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      } as Response)

      await searchDrugsClient('drug & medicine')

      expect(mockFetch).toHaveBeenCalledWith('/api/drugs?q=drug%20%26%20medicine&page=1&limit=50', {
        headers: { 'Content-Type': 'application/json' }
      })
    })
  })

  describe('getDrugBySlugClient', () => {
    it('should fetch drug by slug from API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: sampleDrug })
      } as Response)

      const drug = await getDrugBySlugClient('emgality-33a147b')

      expect(mockFetch).toHaveBeenCalledWith('/api/drugs/emgality-33a147b', {
        headers: { 'Content-Type': 'application/json' }
      })
      expect(drug).toEqual(sampleDrug)
    })

    it('should return null for empty slug', async () => {
      const drug1 = await getDrugBySlugClient('')
      const drug2 = await getDrugBySlugClient('   ')

      expect(drug1).toBeNull()
      expect(drug2).toBeNull()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fallback to JSON file when API fails', async () => {
      // Mock API failure
      mockFetch.mockRejectedValueOnce(new Error('API Error'))
      
      // Mock successful fallback
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => sampleDrug
      } as Response)

      const drug = await getDrugBySlugClient('emgality-33a147b')

      expect(mockFetch).toHaveBeenCalledWith('/data/drugs/emgality-33a147b.json')
      expect(drug).toEqual(sampleDrug)
    })

    it('should handle URL encoding for slug', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: sampleDrug })
      } as Response)

      await getDrugBySlugClient('drug-name with spaces')

      expect(mockFetch).toHaveBeenCalledWith('/api/drugs/drug-name%20with%20spaces', {
        headers: { 'Content-Type': 'application/json' }
      })
    })
  })

  describe('getDrugsByTherapeuticClassClient', () => {
    it('should fetch drugs by therapeutic class', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      } as Response)

      const drugs = await getDrugsByTherapeuticClassClient('CGRP Antagonist')

      expect(mockFetch).toHaveBeenCalledWith('/api/drugs?therapeuticClass=CGRP%20Antagonist&page=1&limit=50', {
        headers: { 'Content-Type': 'application/json' }
      })
      expect(drugs).toEqual([sampleDrug])
    })

    it('should return empty array for empty therapeutic class', async () => {
      const drugs = await getDrugsByTherapeuticClassClient('')

      expect(drugs).toEqual([])
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fallback to client-side filtering when API fails', async () => {
      // Mock API failure
      mockFetch.mockRejectedValueOnce(new Error('API Error'))
      
      // Mock successful getAllDrugsClient call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      } as Response)

      const drugs = await getDrugsByTherapeuticClassClient('CGRP Antagonist')

      expect(drugs).toEqual([sampleDrug])
    })
  })

  describe('getDrugsByManufacturerClient', () => {
    it('should fetch drugs by manufacturer', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      } as Response)

      const drugs = await getDrugsByManufacturerClient('Eli Lilly and Company')

      expect(mockFetch).toHaveBeenCalledWith('/api/drugs?manufacturer=Eli%20Lilly%20and%20Company&page=1&limit=50', {
        headers: { 'Content-Type': 'application/json' }
      })
      expect(drugs).toEqual([sampleDrug])
    })

    it('should return empty array for empty manufacturer', async () => {
      const drugs = await getDrugsByManufacturerClient('')

      expect(drugs).toEqual([])
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fallback to client-side filtering when API fails', async () => {
      // Mock API failure
      mockFetch.mockRejectedValueOnce(new Error('API Error'))
      
      // Mock successful getAllDrugsClient call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      } as Response)

      const drugs = await getDrugsByManufacturerClient('Eli Lilly and Company')

      expect(drugs).toEqual([sampleDrug])
    })
  })

  describe('checkApiHealth', () => {
    it('should return true when API is healthy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true
      } as Response)

      const isHealthy = await checkApiHealth()

      expect(mockFetch).toHaveBeenCalledWith('/api/drugs?limit=1')
      expect(isHealthy).toBe(true)
    })

    it('should return false when API is unhealthy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false
      } as Response)

      const isHealthy = await checkApiHealth()

      expect(isHealthy).toBe(false)
    })

    it('should return false when API request fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      const isHealthy = await checkApiHealth()

      expect(isHealthy).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors with proper error messages', async () => {
      const errorResponse = {
        error: 'Internal Server Error',
        message: 'Database connection failed'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => errorResponse
      } as Response)

      const drugs = await getAllDrugsClient()

      expect(drugs).toEqual([])
    })

    it('should handle malformed API responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON') }
      } as Response)

      const drugs = await getAllDrugsClient()

      expect(drugs).toEqual([])
    })

    it('should handle network timeouts', async () => {
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )

      const drugs = await getAllDrugsClient()

      expect(drugs).toEqual([])
    })
  })
})