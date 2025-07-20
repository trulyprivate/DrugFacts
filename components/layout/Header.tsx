"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SearchForm from "./SearchForm";

export default function Header() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navigation = [
    { name: "Home", href: "/" },
    { name: "Search Drugs", href: "/search" },
    { name: "Therapeutic Classes", href: "/therapeutic-classes" },
    { name: "Manufacturers", href: "/manufacturers" },
  ];

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-medical-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className={`flex items-center space-x-4 transition-all duration-300 ease-in-out ${
            isSearchFocused ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}>
            <div className="flex-shrink-0 flex items-center h-16">
              <Link href="/" className="flex items-center space-x-2 h-full">
                <img 
                  src="/og-image.png" 
                  alt="DrugFacts Wiki Logo" 
                  className="h-8 w-8 object-contain"
                />
                <h1 className="text-xl font-bold text-medical-blue cursor-pointer leading-relaxed mb-0">
                  DrugFacts.wiki
                </h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-medical-gray-600 hover:text-medical-blue transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search Bar - Client Component */}
          <div className={`transition-all duration-300 ease-in-out mx-8 ${
            isSearchFocused ? 'flex-1 max-w-full' : 'flex-1 max-w-lg'
          }`}>
            <SearchForm onFocusChange={setIsSearchFocused} />
          </div>

          <div className="flex items-center space-x-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden" onClick={handleMobileMenuToggle} aria-label="Open navigation menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8 items-end">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-medical-gray-600 hover:text-medical-blue transition-colors font-bold text-lg py-2 text-right w-full"
                      onClick={handleLinkClick}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}