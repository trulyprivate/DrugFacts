import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function readDrugData() {
  try {
    // Read the drug data from the original location
    const drugDataPath = path.join(__dirname, '..', 'client', 'src', 'data', 'drug-data.ts')
    const content = await fs.readFile(drugDataPath, 'utf-8')
    
    // Extract the drug data using regex
    const match = content.match(/export const drugData = ({[\s\S]*});/)
    if (!match) {
      throw new Error('Could not extract drug data from file')
    }
    
    // Create a temporary module to evaluate the data
    const tempFilePath = path.join(__dirname, 'temp-drug-data.mjs')
    await fs.writeFile(tempFilePath, `export const drugData = ${match[1]};`)
    
    // Import the data
    const { drugData } = await import(tempFilePath)
    
    // Clean up temp file
    await fs.unlink(tempFilePath)
    
    return drugData
  } catch (error) {
    console.error('Error reading drug data:', error)
    // Return sample data if reading fails
    return {
      drugName: "Mounjaro",
      genericName: "tirzepatide",
      slug: "mounjaro-d2d7da5",
      setId: "d2d7da5d-ad07-4228-955f-cf7e355c8cc0",
      activeIngredient: "tirzepatide",
      therapeuticClass: "GLP-1/GIP Receptor Agonist",
      manufacturer: "Eli Lilly and Company",
      boxedWarning: "<p><strong>WARNING: RISK OF THYROID C-CELL TUMORS</strong></p><p>In rodents, tirzepatide causes dose-dependent and treatment-duration-dependent thyroid C-cell tumors. It is unknown whether MOUNJARO causes thyroid C-cell tumors, including medullary thyroid carcinoma (MTC), in humans.</p>",
      indicationsAndUsage: "<p>MOUNJARO is indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus.</p>",
      dosageAndAdministration: "<p>The recommended starting dosage of MOUNJARO is 2.5 mg injected subcutaneously once weekly. After 4 weeks, increase the dosage to 5 mg injected subcutaneously once weekly.</p>",
      contraindications: "<p>MOUNJARO is contraindicated in patients with a personal or family history of medullary thyroid carcinoma or in patients with Multiple Endocrine Neoplasia syndrome type 2.</p>",
      warnings: "<p><strong>Pancreatitis:</strong> Acute pancreatitis, including fatal and non-fatal hemorrhagic or necrotizing pancreatitis, has been observed in patients treated with GLP-1 receptor agonists.</p>",
      adverseReactions: "<p>The most common adverse reactions reported in ≥5% of patients treated with MOUNJARO are nausea, diarrhea, decreased appetite, vomiting, constipation, dyspepsia, and abdominal pain.</p>",
      drugInteractions: "<p>MOUNJARO delays gastric emptying, and thereby has the potential to impact the absorption of concomitantly administered oral medications.</p>",
      clinicalPharmacology: "<p>Tirzepatide is a 39-amino-acid modified peptide with a C20 fatty diacid moiety that enables albumin binding and prolongs the half-life.</p>",
      clinicalStudies: "<p>The efficacy of MOUNJARO was evaluated in five multicenter, randomized, controlled trials in adult patients with type 2 diabetes.</p>",
      howSupplied: "<p>MOUNJARO is supplied as a single-dose pen containing a 0.5 mL solution in the following dosage strengths: 2.5 mg/0.5 mL, 5 mg/0.5 mL, 7.5 mg/0.5 mL, 10 mg/0.5 mL, 12.5 mg/0.5 mL, and 15 mg/0.5 mL.</p>",
      patientCounseling: "<p>Advise the patient to read the FDA-approved patient labeling (Medication Guide and Instructions for Use).</p>",
      description: "<p>MOUNJARO contains tirzepatide, a GIP receptor and GLP-1 receptor agonist. It is a 39-amino-acid modified peptide.</p>",
      overdosage: "<p>In the event of overdosage, contact Poison Control for latest recommendations. Based on the pharmacological actions of tirzepatide, an overdose may result in gastrointestinal adverse reactions and hypoglycemia.</p>",
      nonClinicalToxicology: "<p>In a 2-year carcinogenicity study in rats, tirzepatide caused a dose-related and treatment-duration-dependent increase in the incidence of thyroid C-cell adenomas and carcinomas.</p>",
      principalDisplayPanel: "<p>NDC 0002-1434-80<br/>MOUNJARO™<br/>(tirzepatide) injection<br/>2.5 mg/0.5 mL<br/>For subcutaneous use only<br/>Single-Dose Pen<br/>Rx only</p>"
    }
  }
}

async function generateDrugData() {
  try {
    // Create data directory
    const dataDir = path.join(__dirname, '..', 'data', 'drugs')
    await fs.mkdir(dataDir, { recursive: true })
    
    // Get drug data
    const drugData = await readDrugData()
    
    // Save individual drug file
    const drugFileName = `${drugData.slug}.json`
    await fs.writeFile(
      path.join(dataDir, drugFileName),
      JSON.stringify(drugData, null, 2)
    )
    
    // Create index file with summary information
    const index = [{
      drugName: drugData.drugName,
      genericName: drugData.genericName,
      activeIngredient: drugData.activeIngredient,
      slug: drugData.slug,
      therapeuticClass: drugData.therapeuticClass,
      manufacturer: drugData.manufacturer,
      setId: drugData.setId,
      indicationsAndUsage: drugData.indicationsAndUsage?.slice(0, 200) + '...'
    }]
    
    await fs.writeFile(
      path.join(dataDir, 'index.json'),
      JSON.stringify(index, null, 2)
    )
    
    // Copy to public directory for client-side access
    const publicDataDir = path.join(__dirname, '..', 'public', 'data', 'drugs')
    await fs.mkdir(publicDataDir, { recursive: true })
    
    await fs.copyFile(
      path.join(dataDir, 'index.json'),
      path.join(publicDataDir, 'index.json')
    )
    
    console.log('✅ Drug data generated successfully')
    console.log(`📁 Created ${drugFileName} in data/drugs/`)
    console.log('📋 Created index.json')
    console.log('🌐 Copied index to public/data/drugs/ for client-side access')
    
  } catch (error) {
    console.error('❌ Error generating drug data:', error)
    process.exit(1)
  }
}

// Run the generation
generateDrugData()