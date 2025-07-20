'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}

export default function SearchBar({
  placeholder = "Search drug names, generics, or indications...",
  className = "",
  defaultValue = "",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-10 pr-12 py-3 border border-medical-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-gray-400 h-5 w-5" />
      <Button
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-medical-blue hover:bg-blue-700"
        size="sm"
      >
        Search
      </Button>
    </form>
  );
}
