'use client'

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CollapsibleSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export default function CollapsibleSection({
  id,
  title,
  children,
  defaultExpanded = true,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card id={id} className="mb-8">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start justify-between p-4 sm:p-6 text-left hover:bg-gray-50 rounded-none min-h-[60px]"
      >
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-medical-gray-800 pr-4 leading-tight card-title-responsive">
          {title}
        </h2>
        <div className="flex-shrink-0 mt-1">
          {isExpanded ? (
            <ChevronUp className="text-medical-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <ChevronDown className="text-medical-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </div>
      </Button>
      {isExpanded && (
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}
