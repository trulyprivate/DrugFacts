import { Link } from "wouter";
import { relatedDrugs } from "@/data/drug-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const tableOfContents = [
    { id: "overview", label: "Drug Overview" },
    { id: "indications", label: "1. Indications & Usage" },
    { id: "dosage", label: "2. Dosage & Administration" },
    { id: "dosage-forms", label: "3. Dosage Forms & Strengths" },
    { id: "contraindications", label: "4. Contraindications" },
    { id: "warnings", label: "5. Warnings & Precautions" },
    { id: "adverse-reactions", label: "6. Adverse Reactions" },
    { id: "specific-populations", label: "8. Use in Specific Populations" },
    { id: "description", label: "11. Description" },
    { id: "clinical-pharmacology", label: "12. Clinical Pharmacology" },
    { id: "nonclinical-toxicology", label: "13. Nonclinical Toxicology" },
    { id: "clinical-studies", label: "14. Clinical Studies" },
    { id: "how-supplied", label: "16. How Supplied/Storage" },
    { id: "instructions-for-use", label: "17. Patient Counseling" },
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
