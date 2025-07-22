/**
 * MongoDB Document Schema and Validation
 * Defines document structures and validation utilities for MongoDB collections
 */

import { ObjectId } from 'mongodb'
import { DrugLabel } from '../../types/drug'
import { MongoDocument, IndexDefinition } from '../../types/mongodb'

/**
 * Enhanced DrugDocument interface for MongoDB storage
 */
export interface DrugDocument extends DrugLabel, MongoDocument {
  _id?: ObjectId
  _hash?: string
  _created_at?: Date
  _updated_at?: Date
  
  // Search optimization fields
  _search_text?: string
  _search_keywords?: string[]
  
  // Computed fields for better querying
  _has_boxed_warning?: boolean
  _has_generic_name?: boolean
  _therapeutic_class_normalized?: string
  _manufacturer_normalized?: string
}

/**
 * Document metadata interface
 */
export interface DocumentMetadata {
  _hash: string
  _created_at: Date
  _updated_at: Date
  _version?: number
  _source?: string
  _migration_batch?: string
}

/**
 * Schema validation rules
 */
export const DRUG_SCHEMA_RULES = {
  required: ['drugName', 'setId', 'slug'],
  
  fields: {
    drugName: {
      type: 'string',
      minLength: 1,
      maxLength: 500,
      required: true
    },
    setId: {
      type: 'string',
      pattern: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
      required: true
    },
    slug: {
      type: 'string',
      pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      minLength: 1,
      maxLength: 200,
      required: true
    },
    labeler: {
      type: 'string',
      maxLength: 500
    },
    therapeuticClass: {
      type: 'string',
      maxLength: 200
    },
    manufacturer: {
      type: 'string',
      maxLength: 500
    },
    genericName: {
      type: 'string',
      maxLength: 500
    },
    activeIngredient: {
      type: 'string',
      maxLength: 1000
    }
  }
} as const

/**
 * Index definitions for the drugs collection
 */
export const DRUG_COLLECTION_INDEXES: IndexDefinition[] = [
  {
    name: 'slug_unique',
    keys: { slug: 1 },
    options: { unique: true }
  },
  {
    name: 'setId_unique',
    keys: { setId: 1 },
    options: { unique: true }
  },
  {
    name: 'drug_search_text',
    keys: { 
      drugName: 'text',
      genericName: 'text',
      activeIngredient: 'text',
      therapeuticClass: 'text',
      manufacturer: 'text',
      labeler: 'text'
    },
    options: {
      weights: {
        drugName: 10,
        genericName: 8,
        activeIngredient: 6,
        therapeuticClass: 4,
        manufacturer: 2,
        labeler: 1
      }
    }
  },
  {
    name: 'therapeuticClass_index',
    keys: { therapeuticClass: 1 }
  },
  {
    name: 'manufacturer_index',
    keys: { manufacturer: 1 }
  },
  {
    name: 'labeler_index',
    keys: { labeler: 1 }
  },
  {
    name: 'created_at_index',
    keys: { _created_at: -1 }
  },
  {
    name: 'updated_at_index',
    keys: { _updated_at: -1 }
  },
  {
    name: 'compound_search_index',
    keys: { 
      therapeuticClass: 1,
      manufacturer: 1,
      _created_at: -1
    }
  }
]

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string
  value: any
  rule: string
  message: string
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

/**
 * Document validator class
 */
export class DrugDocumentValidator {
  /**
   * Validate a drug document against schema rules
   */
  static validate(document: Partial<DrugDocument>): ValidationResult {
    const errors: ValidationError[] = []

    // Check required fields
    for (const field of DRUG_SCHEMA_RULES.required) {
      if (!document[field as keyof DrugDocument]) {
        errors.push({
          field,
          value: document[field as keyof DrugDocument],
          rule: 'required',
          message: `Field '${field}' is required`
        })
      }
    }

    // Validate field types and constraints
    for (const [fieldName, rules] of Object.entries(DRUG_SCHEMA_RULES.fields)) {
      const value = document[fieldName as keyof DrugDocument]
      
      if (value !== undefined && value !== null) {
        const fieldErrors = this.validateField(fieldName, value, rules)
        errors.push(...fieldErrors)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate individual field
   */
  private static validateField(
    fieldName: string, 
    value: any, 
    rules: any
  ): ValidationError[] {
    const errors: ValidationError[] = []

    // Type validation
    if (rules.type === 'string' && typeof value !== 'string') {
      errors.push({
        field: fieldName,
        value,
        rule: 'type',
        message: `Field '${fieldName}' must be a string`
      })
      return errors // Skip other validations if type is wrong
    }

    // String-specific validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push({
          field: fieldName,
          value,
          rule: 'minLength',
          message: `Field '${fieldName}' must be at least ${rules.minLength} characters long`
        })
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push({
          field: fieldName,
          value,
          rule: 'maxLength',
          message: `Field '${fieldName}' must be no more than ${rules.maxLength} characters long`
        })
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push({
          field: fieldName,
          value,
          rule: 'pattern',
          message: `Field '${fieldName}' does not match required pattern`
        })
      }
    }

    return errors
  }

  /**
   * Sanitize document for storage
   */
  static sanitize(document: Partial<DrugDocument>): DrugDocument {
    const sanitized = { ...document } as DrugDocument

    // Trim string fields
    const stringFields = ['drugName', 'slug', 'labeler', 'therapeuticClass', 'manufacturer', 'genericName']
    for (const field of stringFields) {
      const value = sanitized[field as keyof DrugDocument]
      if (typeof value === 'string') {
        (sanitized as any)[field] = value.trim()
      }
    }

    // Normalize fields for better searching
    if (sanitized.therapeuticClass) {
      sanitized._therapeutic_class_normalized = sanitized.therapeuticClass.toLowerCase().trim()
    }

    if (sanitized.manufacturer) {
      sanitized._manufacturer_normalized = sanitized.manufacturer.toLowerCase().trim()
    }

    // Create search text for full-text search
    const searchFields = [
      sanitized.drugName,
      sanitized.genericName,
      sanitized.activeIngredient,
      sanitized.therapeuticClass,
      sanitized.manufacturer,
      sanitized.labeler
    ].filter(Boolean)

    sanitized._search_text = searchFields.join(' ').toLowerCase()
    sanitized._search_keywords = Array.from(new Set(
      searchFields.join(' ')
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2)
    ))

    // Set computed boolean flags
    sanitized._has_boxed_warning = !!(
      sanitized.boxedWarning || 
      sanitized.label?.boxedWarning
    )

    sanitized._has_generic_name = !!(
      sanitized.genericName || 
      sanitized.label?.genericName
    )

    return sanitized
  }

  /**
   * Prepare document for insertion with metadata
   */
  static prepareForInsert(document: Partial<DrugDocument>): DrugDocument {
    const sanitized = this.sanitize(document)
    const now = new Date()

    return {
      ...sanitized,
      _created_at: now,
      _updated_at: now,
      _version: 1
    }
  }

  /**
   * Prepare document for update with metadata
   */
  static prepareForUpdate(document: Partial<DrugDocument>): Partial<DrugDocument> {
    const sanitized = this.sanitize(document)
    
    return {
      ...sanitized,
      _updated_at: new Date()
    }
  }
}

/**
 * Schema utilities
 */
export class SchemaUtils {
  /**
   * Generate document hash for change detection
   */
  static generateDocumentHash(document: Partial<DrugDocument>): string {
    // Create a copy without metadata fields
    const hashableDoc = { ...document }
    delete hashableDoc._id
    delete hashableDoc._hash
    delete hashableDoc._created_at
    delete hashableDoc._updated_at
    delete hashableDoc._version
    delete hashableDoc._source
    delete hashableDoc._migration_batch
    delete hashableDoc._search_text
    delete hashableDoc._search_keywords
    delete hashableDoc._has_boxed_warning
    delete hashableDoc._has_generic_name
    delete hashableDoc._therapeutic_class_normalized
    delete hashableDoc._manufacturer_normalized

    // Sort keys for consistent hashing
    const sortedDoc = this.sortObjectKeys(hashableDoc)
    const jsonString = JSON.stringify(sortedDoc)
    
    // Simple hash function (in production, use crypto.createHash)
    let hash = 0
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36)
  }

  /**
   * Sort object keys recursively for consistent hashing
   */
  private static sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item))
    }

    const sortedKeys = Object.keys(obj).sort()
    const sortedObj: any = {}
    
    for (const key of sortedKeys) {
      sortedObj[key] = this.sortObjectKeys(obj[key])
    }
    
    return sortedObj
  }

  /**
   * Check if document needs update based on hash comparison
   */
  static needsUpdate(newDoc: Partial<DrugDocument>, existingDoc: DrugDocument): boolean {
    const newHash = this.generateDocumentHash(newDoc)
    const existingHash = existingDoc._hash
    
    return newHash !== existingHash
  }

  /**
   * Extract searchable text from document
   */
  static extractSearchableText(document: DrugDocument): string[] {
    const searchableFields = [
      document.drugName,
      document.genericName,
      document.activeIngredient,
      document.therapeuticClass,
      document.manufacturer,
      document.labeler,
      document.label?.genericName,
      document.label?.title,
      document.label?.indicationsAndUsage,
      document.label?.description
    ]

    return searchableFields
      .filter(Boolean)
      .map(text => text!.toLowerCase())
      .join(' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter((word, index, array) => array.indexOf(word) === index) // unique
  }
}

/**
 * Collection schema configuration
 */
export const COLLECTION_SCHEMAS = {
  drugs: {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['drugName', 'setId', 'slug'],
        properties: {
          drugName: {
            bsonType: 'string',
            minLength: 1,
            maxLength: 500,
            description: 'Drug name is required and must be a string'
          },
          setId: {
            bsonType: 'string',
            pattern: '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$',
            description: 'setId must be a valid UUID'
          },
          slug: {
            bsonType: 'string',
            pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
            minLength: 1,
            maxLength: 200,
            description: 'slug must be a valid URL-friendly identifier'
          },
          _created_at: {
            bsonType: 'date',
            description: 'Creation timestamp'
          },
          _updated_at: {
            bsonType: 'date',
            description: 'Last update timestamp'
          }
        }
      }
    },
    validationLevel: 'strict',
    validationAction: 'error'
  }
} as const