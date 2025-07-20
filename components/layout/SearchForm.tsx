"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchFormProps {
  onFocusChange?: (focused: boolean) => void;
}

export default function SearchForm({ onFocusChange }: SearchFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocusChange?.(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onFocusChange?.(false);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <Input
        type="text"
        placeholder="Search drug names, generics, or indications..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`transition-all duration-300 ease-in-out pl-10 pr-4 py-2 border border-medical-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent ${
          isFocused ? 'w-full scale-105' : 'w-full'
        }`}
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-gray-400 h-4 w-4" />
    </form>
  );
}