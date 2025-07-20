"use client"

import { DrugLabel } from "@/types/drug";
import { extractKeyHighlights } from "@/lib/drug-utils";
import { Bookmark, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface DrugHeaderProps {
  drug: DrugLabel;
}

export default function DrugHeader({ drug }: DrugHeaderProps) {
  const highlights = extractKeyHighlights(drug);
  const { toast } = useToast();

  const handleSaveToFavorites = async () => {
    try {
      // Use browser's bookmark API if available
      if ('bookmark' in navigator || (navigator as any).addToHomeScreen) {
        // For mobile devices with Add to Home Screen
        const title = `${drug.drugName} - Drug Information | drugfacts.wiki`;
        const url = window.location.href;
        
        // Try to use the Bookmark API (limited browser support)
        try {
          await (navigator as any).bookmark?.add?.({
            title: title,
            url: url
          });
          toast({
            title: "Bookmark Added",
            description: "This drug has been added to your bookmarks.",
          });
        } catch (bookmarkError) {
          // Fallback: Instruct user to bookmark manually
          toast({
            title: "Add to Bookmarks",
            description: "Press Ctrl+D (or Cmd+D on Mac) to bookmark this page.",
          });
        }
      } else {
        // Fallback: Instruct user to bookmark manually
        toast({
          title: "Add to Bookmarks",
          description: "Press Ctrl+D (or Cmd+D on Mac) to bookmark this page.",
        });
      }
    } catch (error) {
      toast({
        title: "Unable to Bookmark",
        description: "Please manually bookmark this page using your browser's bookmark feature.",
        variant: "destructive",
      });
    }
  };

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
        toast({
          title: "Shared Successfully",
          description: "Drug information has been shared.",
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "The link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      // If share was cancelled or failed, try clipboard as fallback
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "The link has been copied to your clipboard.",
        });
      } catch (clipboardError) {
        toast({
          title: "Unable to Share",
          description: "Please copy the URL from your address bar to share.",
          variant: "destructive",
        });
      }
    }
  };

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

          <div className="mt-6 lg:mt-0 lg:ml-8 flex-shrink-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                className="bg-medical-blue hover:bg-blue-700"
                onClick={handleSaveToFavorites}
              >
                <Bookmark className="mr-2 h-4 w-4" />
                Save to Favorites
              </Button>
              <Button 
                variant="outline"
                onClick={handleShare}
              >
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
