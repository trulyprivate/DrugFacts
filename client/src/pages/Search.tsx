import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mourjaroData } from "@/data/drug-data";
import { searchDrugs } from "@/lib/drug-utils";
import { DrugLabel } from "@/types/drug";

export default function Search() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDrugs, setFilteredDrugs] = useState<DrugLabel[]>([]);
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");

  // For now, we only have Mounjaro data
  const allDrugs = [mourjaroData];

  useEffect(() => {
    // Get search query from URL params
    const params = new URLSearchParams(location.split('?')[1] || '');
    const q = params.get('q') || '';
    setSearchQuery(q);
    
    // Filter drugs based on search query
    const results = searchDrugs(q, allDrugs);
    setFilteredDrugs(results);
  }, [location]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const results = searchDrugs(query, allDrugs);
    setFilteredDrugs(results);
    
    // Update URL
    const newUrl = query.trim() ? `/search?q=${encodeURIComponent(query)}` : '/search';
    window.history.pushState({}, '', newUrl);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    const sorted = [...filteredDrugs].sort((a, b) => {
      switch (value) {
        case 'name':
          return a.drugName.localeCompare(b.drugName);
        case 'generic':
          return a.label.genericName.localeCompare(b.label.genericName);
        case 'manufacturer':
          return a.labeler.localeCompare(b.labeler);
        default:
          return 0;
      }
    });
    setFilteredDrugs(sorted);
  };

  return (
    <div className="min-h-screen bg-medical-gray-50">
      <Header />
      
      <main>
        {/* Search Header */}
        <section className="bg-white border-b border-medical-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-medical-gray-800 mb-6">
              Drug Search
            </h1>
            <div className="max-w-2xl">
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Search drug names, generics, indications, or manufacturers..."
              />
            </div>
          </div>
        </section>

        {/* Filters and Results */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={handleSort}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Drug Name</SelectItem>
                    <SelectItem value="generic">Generic Name</SelectItem>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Drugs</SelectItem>
                    <SelectItem value="diabetes">Diabetes</SelectItem>
                    <SelectItem value="cardiovascular">Cardiovascular</SelectItem>
                    <SelectItem value="oncology">Oncology</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-sm text-medical-gray-600">
                {filteredDrugs.length} drug(s) found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            {/* Results */}
            {filteredDrugs.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <h3 className="text-lg font-semibold text-medical-gray-800 mb-2">
                    No drugs found
                  </h3>
                  <p className="text-medical-gray-600 mb-4">
                    Try adjusting your search criteria or browse our featured medications.
                  </p>
                  <Link
                    href="/"
                    className="text-medical-blue hover:underline font-medium"
                  >
                    Return to Home
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDrugs.map((drug) => (
                  <Card key={drug.slug} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{drug.drugName}</CardTitle>
                        <Badge variant="outline">Rx</Badge>
                      </div>
                      <p className="text-sm text-medical-gray-600">
                        {drug.label.genericName}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm">
                          <span className="font-medium">Type:</span>{" "}
                          <span className="text-medical-gray-600">
                            {drug.label.productType}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Manufacturer:</span>{" "}
                          <span className="text-medical-gray-600">{drug.labeler}</span>
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Indication:</span>{" "}
                          <span className="text-medical-gray-600">
                            Type 2 diabetes mellitus
                          </span>
                        </p>
                      </div>
                      <Link
                        href={`/drugs/${drug.slug}`}
                        className="text-medical-blue hover:underline font-medium"
                      >
                        View Prescribing Information →
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
