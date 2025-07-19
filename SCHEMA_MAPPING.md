# Drug Schema to UI Mapping

This document explains where each field from the drug schema is displayed in the user interface.

## Complete Schema Field Mapping

### Top-Level Fields

| Schema Field | Display Location | Component | Notes |
|-------------|------------------|-----------|-------|
| `drugName` | Drug Detail Header | `DrugHeader` | Main drug brand name (e.g., "Mounjaro") |
| `setId` | Drug Detail Header | `DrugHeader` | FDA unique identifier in metadata section |
| `slug` | URL routing | Router | Used for `/drugs/mounjaro-d2d7da5` URLs |
| `labeler` | Drug Detail Header | `DrugHeader` | Manufacturer company name |

### Label Fields

| Schema Field | Display Location | Component/Section | Notes |
|-------------|------------------|-------------------|-------|
| `label.boxedWarning` | Prominent Warning Alert | `DrugDetail` | Red alert box with black box warning |
| `label.genericName` | Drug Detail Header | `DrugHeader` | Active ingredient name (e.g., "tirzepatide") |
| `label.labelerName` | Drug Detail Header | `DrugHeader` | Same as `labeler` - manufacturer name |
| `label.productType` | Drug Detail Header | `DrugHeader` | Drug classification type |
| `label.effectiveTime` | Drug Detail Header | `DrugHeader` | Formatted date of current label |
| `label.title` | Drug Detail Header | `DrugHeader` | Official FDA drug title |
| `label.indicationsAndUsage` | Section 1 | `CollapsibleSection` | What the drug treats |
| `label.dosageAndAdministration` | Section 2 | `CollapsibleSection` | How to use the drug |
| `label.dosageFormsAndStrengths` | Section 3 | `CollapsibleSection` | Available formulations |
| `label.warningsAndPrecautions` | Section 5 | `CollapsibleSection` | Safety warnings displayed as alert cards |
| `label.adverseReactions` | Section 6 | `CollapsibleSection` | Side effects with percentages |
| `label.clinicalPharmacology` | Section 12 | `CollapsibleSection` | How the drug works |
| `label.clinicalStudies` | Section 14 | `CollapsibleSection` | Research evidence with efficacy results |
| `label.howSupplied` | Section 16 | `CollapsibleSection` | Packaging and storage information |
| `label.useInSpecificPopulations` | Section 8 | `CollapsibleSection` | Special patient considerations |
| `label.description` | Section 11 | `CollapsibleSection` | Technical drug description |
| `label.nonclinicalToxicology` | Section 13 | `CollapsibleSection` | Animal study data |
| `label.instructionsForUse` | Section 17 | `CollapsibleSection` | Patient counseling information |
| `label.mechanismOfAction` | Section 12 | `CollapsibleSection` | Biological mechanism (part of clinical pharmacology) |
| `label.contraindications` | Section 4 | `CollapsibleSection` | When NOT to use the drug |
| `label.highlights.dosageAndAdministration` | Drug Overview & Section 2 | `DrugHeader` + `CollapsibleSection` | Summary dosing info in highlights |

## Page-by-Page Coverage

### Home Page (`Home.tsx`)
- `drugName` - Featured drug cards
- `label.genericName` - Featured drug cards  
- `label.productType` - Featured drug cards
- `labeler` - Featured drug cards
- `slug` - Navigation links

### Search Page (`Search.tsx`)
- `drugName` - Search results cards
- `label.genericName` - Search results cards
- `label.productType` - Search results cards
- `labeler` - Search results cards
- `slug` - Navigation links

### Drug Detail Page (`DrugDetail.tsx`)
- **ALL schema fields are displayed** across different sections
- Comprehensive display of complete FDA label information
- SEO metadata generated from multiple fields

## SEO Integration

### Structured Data (`seo.ts`)
- `drugName` - Drug schema name
- `label.genericName` - Active ingredient  
- `labeler` - Manufacturer organization
- `label.indicationsAndUsage` - Drug indication
- `label.contraindications` - Contraindication data

### Meta Tags
- Generated from `drugName`, `label.genericName`, and other fields
- Title format: "{genericName} ({drugName}) - Complete Prescribing Information"

## Visual Enhancement

### Color-Coded Sections
- **Red alerts**: Black box warnings, contraindications, serious warnings
- **Blue sections**: General information, descriptions, instructions
- **Green sections**: Efficacy data, positive clinical results
- **Orange/Amber**: Storage requirements, special populations
- **Purple**: Pediatric considerations

## Missing Fields Check

✅ **All schema fields are now displayed to users**

The application now comprehensively displays every field from the FDA drug label schema, ensuring healthcare professionals have access to complete prescribing information as required for medical decision-making.

## Future Migration to Next.js

The current React structure follows Next.js patterns:
- File-based page organization
- SEO utilities in separate modules
- Component-based architecture
- Static data processing
- Structured routing patterns

This makes future migration to Next.js straightforward with minimal code changes.