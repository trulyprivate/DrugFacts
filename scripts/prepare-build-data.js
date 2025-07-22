#!/usr/bin/env node

/**
 * Build-time data preparation script
 * Ensures drug data is available for static generation
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function prepareBuildData() {
    console.log('🔧 Preparing build data...')

    try {
        const dataDir = path.join(process.cwd(), 'data', 'drugs')
        const indexPath = path.join(dataDir, 'index.json')
        const labelsPath = path.join(dataDir, 'Labels.json')

        // Check if index.json exists
        try {
            await fs.access(indexPath)
            const indexData = await fs.readFile(indexPath, 'utf-8')
            const drugs = JSON.parse(indexData)
            console.log(`✅ Found ${drugs.length} drugs in index.json`)
            return
        } catch (error) {
            console.log('⚠️  index.json not found, checking Labels.json...')
        }

        // Try to use Labels.json as fallback
        try {
            await fs.access(labelsPath)
            const labelsData = await fs.readFile(labelsPath, 'utf-8')
            const drugs = JSON.parse(labelsData)

            // Create index.json from Labels.json
            await fs.writeFile(indexPath, JSON.stringify(drugs, null, 2))
            console.log(`✅ Created index.json from Labels.json with ${drugs.length} drugs`)
            return
        } catch (error) {
            console.log('⚠️  Labels.json not found either')
        }

        // Create minimal data structure if no data files exist
        console.log('⚠️  No drug data files found, creating minimal structure...')

        await fs.mkdir(dataDir, { recursive: true })

        const minimalData = [
            {
                drugName: "Sample Drug",
                setId: "00000000-0000-0000-0000-000000000000",
                slug: "sample-drug",
                labeler: "Sample Labeler",
                therapeuticClass: "Sample Class",
                manufacturer: "Sample Manufacturer",
                genericName: "sample-generic"
            }
        ]

        await fs.writeFile(indexPath, JSON.stringify(minimalData, null, 2))
        console.log('✅ Created minimal drug data structure')

    } catch (error) {
        console.error('❌ Failed to prepare build data:', error)
        process.exit(1)
    }

    // Copy data to public directory for static access
    try {
        const publicDataDir = path.join(process.cwd(), 'public', 'data', 'drugs')
        await fs.mkdir(publicDataDir, { recursive: true })

        // Copy index.json
        const indexPath = path.join(process.cwd(), 'data', 'drugs', 'index.json')
        const publicIndexPath = path.join(publicDataDir, 'index.json')
        await fs.copyFile(indexPath, publicIndexPath)

        // Copy individual drug files
        const dataDir = path.join(process.cwd(), 'data', 'drugs')
        const files = await fs.readdir(dataDir)

        for (const file of files) {
            if (file.endsWith('.json') && file !== 'index.json') {
                const sourcePath = path.join(dataDir, file)
                const destPath = path.join(publicDataDir, file)
                await fs.copyFile(sourcePath, destPath)
            }
        }

        console.log('📁 Copied drug data to public directory for static access')

    } catch (copyError) {
        console.warn('⚠️  Failed to copy data to public directory:', copyError)
        // Don't exit on copy error, as the build might still work
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    prepareBuildData()
        .then(() => {
            console.log('🎉 Build data preparation completed')
        })
        .catch((error) => {
            console.error('❌ Build data preparation failed:', error)
            process.exit(1)
        })
}

export { prepareBuildData }