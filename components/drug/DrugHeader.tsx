import { DrugLabel } from "@/types/drug";
import { extractKeyHighlights } from "@/lib/drug-utils";
import { Bookmark, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface DrugHeaderProps {
  drug: DrugLabel;
}

export default function DrugHeader({ drug }: DrugHeaderProps) {
  const highlights = extractKeyHighlights(drug);

  return (
    <Card className="mb-8">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-medical-gray-800">
                {drug.drugName}
                <sup>®</sup>
              </h1>
              <Badge className="bg-medical-blue text-white">Prescription Only</Badge>
            </div>
            <h2 className="text-xl text-medical-gray-600 mb-4">
              {drug.genericName && `(${drug.genericName})`}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-medical-gray-50 p-4 rounded-lg">
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

          <div className="mt-6 lg:mt-0 lg:ml-8 flex-shrink-0">
            <div className="flex space-x-3">
              <Button className="bg-medical-blue hover:bg-blue-700">
                <Bookmark className="mr-2 h-4 w-4" />
                Save to Favorites
              </Button>
              <Button variant="outline">
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
