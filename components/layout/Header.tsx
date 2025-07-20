import Link from "next/link";
import { Search, Bookmark, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SearchForm from "./SearchForm";

export default function Header() {
  const navigation = [
    { name: "Home", href: "/" },
    { name: "Search Drugs", href: "/search" },
    { name: "Therapeutic Classes", href: "/therapeutic-classes" },
    { name: "Manufacturers", href: "/manufacturers" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-medical-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Link href="/" className="block">
                <h1 className="text-xl font-bold text-medical-blue cursor-pointer">
                  drugfacts.wiki
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
          <div className="flex-1 max-w-lg mx-8">
            <SearchForm />
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col space-y-4 mt-8">
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
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}