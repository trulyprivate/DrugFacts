import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mourjaroData } from "@/data/drug-data";

export default function Home() {
  const handleSearch = (query: string) => {
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  const featuredDrugs = [mourjaroData];

  return (
    <div className="min-h-screen bg-medical-gray-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-white border-b border-medical-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-medical-gray-800 mb-4">
                drugfacts.wiki
              </h1>
              <p className="text-xl text-medical-gray-600 mb-8 max-w-3xl mx-auto">
                Comprehensive FDA drug information for healthcare professionals. Access 
                complete prescribing information, dosing guidelines, and clinical data.
              </p>
              <div className="max-w-2xl mx-auto">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Drugs */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-medical-gray-800 mb-8">
              Featured Medications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDrugs.map((drug) => (
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
                    <p className="text-sm text-medical-gray-700 mb-4">
                      {drug.label.productType}
                    </p>
                    <p className="text-xs text-medical-gray-500 mb-4">
                      Manufacturer: {drug.labeler}
                    </p>
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
          </div>
        </section>

        {/* Quick Access */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-medical-gray-800 mb-8 text-center">
              Quick Access
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-medical-blue rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">Rx</span>
                  </div>
                  <h3 className="font-semibold text-medical-gray-800 mb-2">
                    Drug Search
                  </h3>
                  <p className="text-sm text-medical-gray-600 mb-4">
                    Search through comprehensive drug database
                  </p>
                  <Link
                    href="/search"
                    className="text-medical-blue hover:underline font-medium"
                  >
                    Start Searching
                  </Link>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-medical-green rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">TC</span>
                  </div>
                  <h3 className="font-semibold text-medical-gray-800 mb-2">
                    Therapeutic Classes
                  </h3>
                  <p className="text-sm text-medical-gray-600 mb-4">
                    Browse drugs by therapeutic classification
                  </p>
                  <Link
                    href="/therapeutic-classes"
                    className="text-medical-blue hover:underline font-medium"
                  >
                    Browse Classes
                  </Link>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-warning-orange rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">MF</span>
                  </div>
                  <h3 className="font-semibold text-medical-gray-800 mb-2">
                    Manufacturers
                  </h3>
                  <p className="text-sm text-medical-gray-600 mb-4">
                    Find drugs by pharmaceutical company
                  </p>
                  <Link
                    href="/manufacturers"
                    className="text-medical-blue hover:underline font-medium"
                  >
                    View Manufacturers
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
