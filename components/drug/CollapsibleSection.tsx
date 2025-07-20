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
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 rounded-none"
      >
        <h2 className="text-xl font-semibold text-medical-gray-800">{title}</h2>
        {isExpanded ? (
          <ChevronUp className="text-medical-gray-400 h-5 w-5" />
        ) : (
          <ChevronDown className="text-medical-gray-400 h-5 w-5" />
        )}
      </Button>
      {isExpanded && <CardContent className="px-6 pb-6">{children}</CardContent>}
    </Card>
  );
}
