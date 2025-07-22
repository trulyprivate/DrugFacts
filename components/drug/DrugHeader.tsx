"use client"

import { DrugLabel } from "@/types/drug";
import { extractKeyHighlights } from "@/lib/drug-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import dynamic from 'next/dynamic';

// Dynamically import Share icon only when component loads
const ShareIcon = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Share })), {
  loading: () => <div className="w-4 h-4" />, // Placeholder while loading
});

interface DrugHeaderProps {
  drug: DrugLabel;
}

export default function DrugHeader({ drug }: DrugHeaderProps) {
  const highlights = extractKeyHighlights(drug);

  const handleShare = async () => {
    const shareData = {
      title: `${drug.drugName} - Drug Information`,
      text: `Get complete prescribing information for ${drug.drugName} including dosing, warnings, and patient-friendly explanations.`,
      url: window.location.href,
    };

    try {
      // Use native Web Share API if available
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (error) {
      // If share was cancelled or failed, try clipboard as fallback
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch (clipboardError) {
        // Silent fail - no toast alerts
        console.log('Share not available');
      }
    }
  };

  return (
    <Card className="mb-4 sm:mb-8">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2 space-y-2 sm:space-y-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-medical-gray-800 break-words drug-header drug-title">
                {drug.drugName}
                <sup>®</sup>
              </h1>
              <Badge className="bg-gray-600 text-white self-start">Prescription Only</Badge>
            </div>
            <h2 className="text-xl text-medical-gray-600 mb-4">
              {drug.genericName && `(${drug.genericName})`}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-medical-gray-500">Manufacturer</p>
                <p className="text-medical-gray-800">{drug.label?.labelerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-medical-gray-500">Generic Name</p>
                <p className="text-medical-gray-800">{drug.label?.genericName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-medical-gray-500">Therapeutic Class</p>
                <p className="text-medical-gray-800">{drug.therapeuticClass || 'Prescription Drug'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-medical-gray-500">Effective Date</p>
                <p className="text-medical-gray-800">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Additional metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-medical-gray-50 p-3 sm:p-4 rounded-lg">
              <div>
                <p className="text-sm font-medium text-medical-gray-500">FDA Set ID</p>
                <p className="text-xs text-medical-gray-600 font-mono">{drug.setId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-medical-gray-500">Full Title</p>
                <p className="text-medical-gray-800">{drug.drugName} - {drug.label?.labelerName || 'N/A'}</p>
              </div>
            </div>

            {/* Key Drug Information Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Critical Information Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Key Drug Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Drug Name:</span>
                    <span className="ml-2 text-blue-900">{drug.drugName} ({drug.genericName})</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Manufacturer:</span>
                    <span className="ml-2 text-blue-900">{drug.manufacturer}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Primary Use:</span>
                    <span className="ml-2 text-blue-900">
                      {drug.indicationsAndUsage 
                        ? drug.indicationsAndUsage.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                        : 'See indications section below'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Safety Warnings Card */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                  <span className="inline-block w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                  Important Safety Information
                </h3>
                <div className="space-y-2 text-sm">
                  {drug.boxedWarning && (
                    <div>
                      <span className="font-medium text-red-700">Boxed Warning:</span>
                      <span className="ml-2 text-red-900">Present - See details below</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-red-700">Contraindications:</span>
                    <span className="ml-2 text-red-900">
                      {drug.contraindications 
                        ? drug.contraindications.replace(/<[^>]*>/g, '').substring(0, 80) + '...'
                        : 'See contraindications section'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-red-700">Key Warnings:</span>
                    <span className="ml-2 text-red-900">
                      {drug.warnings || drug.warningsAndPrecautions
                        ? (drug.warnings || drug.warningsAndPrecautions || '').replace(/<[^>]*>/g, '').substring(0, 80) + '...'
                        : 'See warnings section below'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dosing Quick Reference */}
            {drug.dosageAndAdministration && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                  <span className="inline-block w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  Dosing Quick Reference
                </h3>
                <div className="text-sm text-green-900">
                  {drug.dosageAndAdministration.replace(/<[^>]*>/g, '').substring(0, 200)}
                  {drug.dosageAndAdministration.length > 200 && '...'}
                </div>
                <p className="text-xs text-green-700 mt-2">Complete dosing information available in the detailed sections below</p>
              </div>
            )}

            {/* Previous Key Highlights */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Additional Prescribing Highlights
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                {highlights.map((highlight, index) => (
                  <li key={index}>• {highlight}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 lg:mt-0 lg:ml-8 flex-shrink-0">
            <Button 
              variant="outline"
              onClick={handleShare}
            >
              <ShareIcon className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
