"use client"

import { DrugLabel } from "@/types/drug";
import { extractKeyHighlights } from "@/lib/drug-utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface DrugHeaderProps {
  drug: DrugLabel;
}

export default function DrugHeader({ drug }: DrugHeaderProps) {
  const highlights = extractKeyHighlights(drug);

  return (
    <Card className="mb-4 sm:mb-8">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2 space-y-2 sm:space-y-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-medical-gray-800 break-words">
                {drug.drugName}
                <sup>®</sup>
              </h1>
              <Badge className="bg-medical-blue text-white self-start">Prescription Only</Badge>
            </div>
            <h2 className="text-xl text-medical-gray-600 mb-4">
              {drug.genericName && `(${drug.genericName})`}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-medical-gray-500">Manufacturer</p>
                <p className="text-medical-gray-800">{drug.manufacturer || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-medical-gray-500">Generic Name</p>
                <p className="text-medical-gray-800">{drug.genericName || 'N/A'}</p>
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
                <p className="text-medical-gray-800">{drug.drugName} - {drug.manufacturer || 'N/A'}</p>
              </div>
            </div>

            {/* Key Highlights */}
            <div className="bg-medical-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-medical-gray-800 mb-2">
                Key Prescribing Highlights
              </h3>
              <ul className="text-sm text-medical-gray-700 space-y-1">
                {highlights.map((highlight, index) => (
                  <li key={index}>• {highlight}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
