import { Link } from "wouter";
import { relatedDrugs } from "@/data/drug-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const tableOfContents = [
    { id: "overview", label: "Drug Overview" },
    { id: "indications", label: "Indications & Usage" },
    { id: "dosage", label: "Dosage & Administration" },
    { id: "warnings", label: "Warnings & Precautions" },
    { id: "contraindications", label: "Contraindications" },
    { id: "adverse-reactions", label: "Adverse Reactions" },
    { id: "clinical-pharmacology", label: "Clinical Pharmacology" },
    { id: "clinical-studies", label: "Clinical Studies" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <aside className={`lg:col-span-1 ${className}`}>
      <div className="sticky top-24 space-y-6">
        {/* Table of Contents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Table of Contents</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="space-y-2">
              {tableOfContents.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left text-sm text-medical-gray-600 hover:text-medical-blue transition-colors py-1"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Related Drugs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Related Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relatedDrugs.map((drug) => (
                <div key={drug.slug} className="border-l-4 border-medical-green pl-3">
                  <Link
                    href={`/drugs/${drug.slug}`}
                    className="text-sm font-medium text-medical-blue hover:underline"
                  >
                    {drug.name} ({drug.genericName})
                  </Link>
                  <p className="text-xs text-medical-gray-500">{drug.therapeuticClass}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
