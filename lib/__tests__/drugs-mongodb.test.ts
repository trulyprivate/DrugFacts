/**
 * Unit tests for MongoDB drug service functions
 */

import { MongoClient, Db, Collection } from 'mongodb'
import { 
  getAllDrugs, 
  getDrugBySlug, 
  searchDrugs, 
  getDrugsByTherapeuticClass,
  getDrugsByManufacturer,
  getAllDrugsPaginated,
  getTherapeuticClasses,
  getManufacturers,
  getDrugStats
} from '../drugs-mongodb'
import { getDatabase } from '../database/connection'
import { DrugLabel } from '../../types/drug'

// Mock the database connection
jest.mock('../database/connection')

const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>

describe('MongoDB Drug Service', () => {
  let mockDb: jest.Mocked<any>
  let mockCollection: jest.Mocked<Collection>
  let mockCursor: jest.Mocked<any>

  const sampleDrug: DrugLabel = {
    drugName: 'Emgality',
    setId: '33a147be-233a-40e8-a55e-e40936e28db0',
    slug: 'emgality-33a147b',
    labeler: 'Eli Lilly and Company',
    therapeuticClass: 'CGRP Antagonist',
    manufacturer: 'Eli Lilly and Company',
    genericName: 'galcanezumab-gnlm'
  }

  const sampleDrugDocument = {
    ...sampleDrug,
    _id: 'mock-object-id',
    _hash: 'mock-hash',
    _created_at: new Date(),
    _updated_at: new Date()
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup cursor mock
    mockCursor = {
      toArray: jest.fn().mockResolvedValue([sampleDrugDocument]),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis()
    }

    // Setup collection mock
    mockCollection = {
      find: jest.fn().mockReturnValue(mockCursor),
      findOne: jest.fn().mockResolvedValue(sampleDrugDocument),
      countDocuments: jest.fn().mockResolvedValue(1),
      distinct: jest.fn().mockResolvedValue(['CGRP Antagonist'])
    } as any

    // Setup database mock
    mockDb = {
      isConnected: true,
      connect: jest.fn().mockResolvedValue(undefined),
      getCollection: jest.fn().mockReturnValue(mockCollection)
    }

    mockGetDatabase.mockReturnValue(mockDb)
  })

  describe('getAllDrugs', () => {
    it('should retrieve all drugs successfully', async () => {
      const drugs = await getAllDrugs()

      expect(mockDb.getCollection).toHaveBeenCalled()
      expect(mockCollection.find).toHaveBeenCalledWith({}, expect.objectContaining({
        sort: { drugName: 1 },
        projection: expect.objectContaining({
          _id: 0,
          _hash: 0
        })
      }))
      expect(drugs).toHaveLength(1)
      expect(drugs[0]).toEqual(expect.objectContaining({
        drugName: 'Emgality',
        slug: 'emgality-33a147b'
      }))
    })

    it('should handle connection errors gracefully', async () => {
      mockDb.isConnected = false
      mockDb.connect.mockRejectedValue(new Error('Connection failed'))

      const drugs = await getAllDrugs()

      expect(drugs).toEqual([])
    })

    it('should apply query options correctly', async () => {
      const options = {
        limit: 10,
        skip: 5,
        sort: { drugName: -1 }
      }

      await getAllDrugs(options)

      expect(mockCollection.find).toHaveBeenCalledWith({}, expect.objectContaining({
        limit: 10,
        skip: 5,
        sort: { drugName: -1 }
      }))
    })
  })

  describe('getAllDrugsPaginated', () => {
    it('should return paginated results', async () => {
      mockCollection.countDocuments.mockResolvedValue(100)

      const result = await getAllDrugsPaginated(2, 10)

      expect(result.data).toHaveLength(1)
      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 100,
        totalPages: 10,
        hasNext: true,
        hasPrev: true
      })
    })

    it('should handle first page correctly', async () => {
      mockCollection.countDocuments.mockResolvedValue(50)

      const result = await getAllDrugsPaginated(1, 10)

      expect(result.pagination.hasPrev).toBe(false)
      expect(result.pagination.hasNext).toBe(true)
    })

    it('should handle last page correctly', async () => {
      mockCollection.countDocuments.mockResolvedValue(50)

      const result = await getAllDrugsPaginated(5, 10)

      expect(result.pagination.hasPrev).toBe(true)
      expect(result.pagination.hasNext).toBe(false)
    })
  })

  describe('getDrugBySlug', () => {
    it('should retrieve drug by slug successfully', async () => {
      const drug = await getDrugBySlug('emgality-33a147b')

      expect(mockCollection.findOne).toHaveBeenCalledWith(
        { slug: 'emgality-33a147b' },
        expect.objectContaining({
          projection: expect.objectContaining({
            _id: 0,
            _hash: 0
          })
        })
      )
      expect(drug).toEqual(expect.objectContaining({
        drugName: 'Emgality',
        slug: 'emgality-33a147b'
      }))
    })

    it('should return null for non-existent drug', async () => {
      mockCollection.findOne.mockResolvedValue(null)

      const drug = await getDrugBySlug('non-existent-slug')

      expect(drug).toBeNull()
    })

    it('should handle invalid slug input', async () => {
      const drug1 = await getDrugBySlug('')
      const drug2 = await getDrugBySlug(null as any)
      const drug3 = await getDrugBySlug(undefined as any)

      expect(drug1).toBeNull()
      expect(drug2).toBeNull()
      expect(drug3).toBeNull()
    })

    it('should normalize slug input', async () => {
      await getDrugBySlug('  EMGALITY-33A147B  ')

      expect(mockCollection.findOne).toHaveBeenCalledWith(
        { slug: 'emgality-33a147b' },
        expect.any(Object)
      )
    })
  })

  describe('searchDrugs', () => {
    it('should perform regex search by default', async () => {
      await searchDrugs('emgality')

      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { drugName: { $regex: expect.any(RegExp) } },
            { genericName: { $regex: expect.any(RegExp) } }
          ])
        }),
        expect.any(Object)
      )
    })

    it('should perform text search when fuzzy option is enabled', async () => {
      await searchDrugs('emgality', { fuzzy: true })

      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $text: expect.objectContaining({
            $search: 'emgality',
            $caseSensitive: false
          })
        }),
        expect.any(Object)
      )
    })

    it('should return all drugs for empty query', async () => {
      await searchDrugs('')

      expect(mockCollection.find).toHaveBeenCalledWith({}, expect.any(Object))
    })

    it('should respect case sensitivity option', async () => {
      await searchDrugs('emgality', { caseSensitive: true })

      const call = mockCollection.find.mock.calls[0]
      const filter = call[0]
      const regex = filter.$or[0].drugName.$regex
      expect(regex.flags).not.toContain('i')
    })

    it('should use custom search fields', async () => {
      await searchDrugs('emgality', { fields: ['drugName', 'manufacturer'] })

      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: [
            { drugName: { $regex: expect.any(RegExp) } },
            { manufacturer: { $regex: expect.any(RegExp) } }
          ]
        }),
        expect.any(Object)
      )
    })
  })

  describe('getDrugsByTherapeuticClass', () => {
    it('should retrieve drugs by therapeutic class', async () => {
      await getDrugsByTherapeuticClass('CGRP Antagonist')

      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: [
            { therapeuticClass: { $regex: expect.any(RegExp) } },
            { _therapeutic_class_normalized: 'cgrp antagonist' }
          ]
        }),
        expect.any(Object)
      )
    })

    it('should handle invalid therapeutic class input', async () => {
      const drugs1 = await getDrugsByTherapeuticClass('')
      const drugs2 = await getDrugsByTherapeuticClass(null as any)

      expect(drugs1).toEqual([])
      expect(drugs2).toEqual([])
    })

    it('should normalize therapeutic class input', async () => {
      await getDrugsByTherapeuticClass('  CGRP Antagonist  ')

      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { _therapeutic_class_normalized: 'cgrp antagonist' }
          ])
        }),
        expect.any(Object)
      )
    })
  })

  describe('getDrugsByManufacturer', () => {
    it('should retrieve drugs by manufacturer', async () => {
      await getDrugsByManufacturer('Eli Lilly and Company')

      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: [
            { manufacturer: { $regex: expect.any(RegExp) } },
            { labeler: { $regex: expect.any(RegExp) } },
            { _manufacturer_normalized: 'eli lilly and company' }
          ]
        }),
        expect.any(Object)
      )
    })

    it('should handle invalid manufacturer input', async () => {
      const drugs1 = await getDrugsByManufacturer('')
      const drugs2 = await getDrugsByManufacturer(null as any)

      expect(drugs1).toEqual([])
      expect(drugs2).toEqual([])
    })
  })

  describe('getTherapeuticClasses', () => {
    it('should retrieve unique therapeutic classes', async () => {
      const classes = await getTherapeuticClasses()

      expect(mockCollection.distinct).toHaveBeenCalledWith(
        'therapeuticClass',
        { therapeuticClass: { $exists: true, $ne: null, $ne: '' } }
      )
      expect(classes).toEqual(['CGRP Antagonist'])
    })

    it('should handle database errors', async () => {
      mockCollection.distinct.mockRejectedValue(new Error('Database error'))

      const classes = await getTherapeuticClasses()

      expect(classes).toEqual([])
    })
  })

  describe('getManufacturers', () => {
    it('should retrieve unique manufacturers and labelers', async () => {
      mockCollection.distinct
        .mockResolvedValueOnce(['Eli Lilly and Company'])
        .mockResolvedValueOnce(['Pfizer Inc'])

      const manufacturers = await getManufacturers()

      expect(mockCollection.distinct).toHaveBeenCalledTimes(2)
      expect(manufacturers).toEqual(['Eli Lilly and Company', 'Pfizer Inc'])
    })
  })

  describe('getDrugStats', () => {
    it('should retrieve drug statistics', async () => {
      mockCollection.countDocuments
        .mockResolvedValueOnce(100) // total drugs
        .mockResolvedValueOnce(5)   // boxed warnings
        .mockResolvedValueOnce(80)  // generic names

      mockCollection.distinct
        .mockResolvedValueOnce(['Class1', 'Class2']) // therapeutic classes
        .mockResolvedValueOnce(['Mfg1', 'Mfg2', 'Mfg3']) // manufacturers

      const stats = await getDrugStats()

      expect(stats).toEqual({
        totalDrugs: 100,
        totalTherapeuticClasses: 2,
        totalManufacturers: 3,
        drugsWithBoxedWarnings: 5,
        drugsWithGenericNames: 80
      })
    })

    it('should handle database errors', async () => {
      mockCollection.countDocuments.mockRejectedValue(new Error('Database error'))

      const stats = await getDrugStats()

      expect(stats).toEqual({
        totalDrugs: 0,
        totalTherapeuticClasses: 0,
        totalManufacturers: 0,
        drugsWithBoxedWarnings: 0,
        drugsWithGenericNames: 0
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection failures', async () => {
      mockDb.isConnected = false
      mockDb.connect.mockRejectedValue(new Error('Connection failed'))

      const drugs = await getAllDrugs()
      const drug = await getDrugBySlug('test-slug')
      const searchResults = await searchDrugs('test')

      expect(drugs).toEqual([])
      expect(drug).toBeNull()
      expect(searchResults).toEqual([])
    })

    it('should handle query failures gracefully', async () => {
      mockCollection.find.mockImplementation(() => {
        throw new Error('Query failed')
      })

      const drugs = await getAllDrugs()

      expect(drugs).toEqual([])
    })
  })
})