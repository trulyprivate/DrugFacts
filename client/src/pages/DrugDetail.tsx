import { useEffect } from "react";
import { useRoute } from "wouter";
import { AlertTriangle, Syringe, Clock, Utensils, MapPin, XCircle, Info } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DrugHeader from "@/components/DrugHeader";
import Sidebar from "@/components/Sidebar";
import CollapsibleSection from "@/components/CollapsibleSection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mourjaroData } from "@/data/drug-data";
import { generateDrugSEO } from "@/lib/seo";
import { stripHTMLTags } from "@/lib/drug-utils";

export default function DrugDetail() {
  const [match, params] = useRoute("/drugs/:slug");
  
  // For now, we only have Mounjaro data
  const drug = mourjaroData;
  
  useEffect(() => {
    if (drug) {
      const seo = generateDrugSEO(drug);
      document.title = seo.title;
      
      // Add meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', seo.description);

      // Add structured data
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(seo.structuredData);
      document.head.appendChild(script);
    }
  }, [drug]);

  if (!match || !drug) {
    return (
      <div className="min-h-screen bg-medical-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-medical-gray-800 mb-4">
              Drug Not Found
            </h1>
            <p className="text-medical-gray-600">
              The requested drug information could not be found.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const dosageSteps = [
    { step: 1, label: "Starting Dose", description: "2.5 mg once weekly × 4 weeks", color: "bg-medical-blue" },
    { step: 2, label: "Increase to", description: "5 mg once weekly", color: "bg-medical-green" },
    { step: 3, label: "Titrate as needed", description: "Up to 15 mg once weekly", color: "bg-warning-orange" },
  ];

  const administrationDetails = [
    { icon: Syringe, text: "Subcutaneous injection once weekly" },
    { icon: Clock, text: "Same day each week, any time of day" },
    { icon: Utensils, text: "With or without meals" },
    { icon: MapPin, text: "Thigh, abdomen, or upper arm" },
  ];

  const adverseReactions = [
    { name: "Nausea", percentage: "~20%" },
    { name: "Diarrhea", percentage: "~13%" },
    { name: "Decreased appetite", percentage: "~11%" },
    { name: "Vomiting", percentage: "~8%" },
    { name: "Constipation", percentage: "~7%" },
  ];

  const clinicalResults = [
    { value: "-2.4%", label: "Mean HbA1c reduction (15 mg)", color: "text-medical-blue" },
    { value: "-11.2 kg", label: "Mean weight reduction (15 mg)", color: "text-medical-green" },
    { value: "86%", label: "Achieved HbA1c <7% (15 mg)", color: "text-warning-orange" },
  ];

  return (
    <div className="min-h-screen bg-medical-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <nav className="bg-medical-gray-100 border-b border-medical-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-3 text-sm">
            <a href="/" className="text-medical-gray-500 hover:text-medical-blue">Home</a>
            <span className="text-medical-gray-400">/</span>
            <a href="/drugs" className="text-medical-gray-500 hover:text-medical-blue">Drugs</a>
            <span className="text-medical-gray-400">/</span>
            <span className="text-medical-gray-700 font-medium">
              {drug.drugName} ({drug.label.genericName})
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          <Sidebar />
          
          <main className="lg:col-span-3 mt-8 lg:mt-0">
            <DrugHeader drug={drug} />

            {/* Boxed Warning */}
            {drug.label.boxedWarning && (
              <Alert className="mb-8 border-red-400 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-700">
                  <div className="font-bold mb-2">BLACK BOX WARNING: RISK OF THYROID C-CELL TUMORS</div>
                  <div className="text-sm leading-relaxed">
                    {stripHTMLTags(drug.label.boxedWarning)}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Tab Navigation */}
            <Card className="mb-8">
              <Tabs defaultValue="overview" className="w-full">
                <div className="border-b border-medical-gray-200">
                  <TabsList className="grid grid-cols-4 w-full rounded-none bg-transparent">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="dosing">Dosing</TabsTrigger>
                    <TabsTrigger value="safety">Safety</TabsTrigger>
                    <TabsTrigger value="clinical">Clinical Data</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="overview" className="p-6">
                  <div className="prose prose-sm max-w-none">
                    <p>Overview information and key highlights for {drug.drugName}.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="dosing" className="p-6">
                  <div className="prose prose-sm max-w-none">
                    <p>Detailed dosing and administration information.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="safety" className="p-6">
                  <div className="prose prose-sm max-w-none">
                    <p>Safety information, warnings, and precautions.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="clinical" className="p-6">
                  <div className="prose prose-sm max-w-none">
                    <p>Clinical studies and pharmacology data.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Content Sections */}
            <div className="space-y-8">
              <CollapsibleSection id="indications" title="Indications and Usage">
                <div className="prose prose-sm max-w-none text-medical-gray-700 leading-relaxed">
                  <p className="font-medium text-medical-gray-800 mb-3">
                    MOUNJARO® is indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus.
                  </p>
                  <Alert className="border-amber-400 bg-amber-50">
                    <Info className="h-4 w-4 text-amber-600" />
                    <AlertDescription>
                      <div className="font-semibold text-amber-800 mb-2">Limitations of Use</div>
                      <p className="text-amber-700 text-sm">
                        MOUNJARO has not been studied in patients with a history of pancreatitis. 
                        Consider other antidiabetic therapies in patients with a history of pancreatitis.
                      </p>
                    </AlertDescription>
                  </Alert>
                </div>
              </CollapsibleSection>

              <CollapsibleSection id="dosage" title="Dosage and Administration">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-medical-gray-800 mb-3">Dosage Schedule</h3>
                    <div className="space-y-3">
                      {dosageSteps.map((step) => (
                        <div key={step.step} className="flex items-center p-3 bg-medical-gray-50 rounded-lg">
                          <div className={`${step.color} text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3`}>
                            {step.step}
                          </div>
                          <div>
                            <p className="font-medium text-medical-gray-800">{step.label}</p>
                            <p className="text-sm text-medical-gray-600">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-medical-gray-800 mb-3">Administration</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <ul className="space-y-2 text-sm text-medical-gray-700">
                        {administrationDetails.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <item.icon className="text-medical-blue mt-1 mr-2 h-4 w-4" />
                            {item.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection id="warnings" title="Warnings and Precautions">
                <div className="grid gap-4">
                  <Alert className="border-red-400 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription>
                      <div className="font-semibold text-red-800 mb-2">Thyroid C-Cell Tumors</div>
                      <p className="text-red-700 text-sm">
                        Monitor for symptoms of thyroid tumors including neck mass, dysphagia, dyspnea, or persistent hoarseness.
                      </p>
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-orange-400 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <AlertDescription>
                      <div className="font-semibold text-orange-800 mb-2">Pancreatitis</div>
                      <p className="text-orange-700 text-sm">
                        Discontinue if pancreatitis is suspected. Do not restart if pancreatitis is confirmed.
                      </p>
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-yellow-400 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <AlertDescription>
                      <div className="font-semibold text-yellow-800 mb-2">Hypersensitivity Reactions</div>
                      <p className="text-yellow-700 text-sm">
                        Serious hypersensitivity reactions have been reported. Discontinue immediately if suspected.
                      </p>
                    </AlertDescription>
                  </Alert>
                </div>
              </CollapsibleSection>

              <CollapsibleSection id="contraindications" title="Contraindications">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-3">
                    MOUNJARO is contraindicated in patients with:
                  </h3>
                  <ul className="space-y-2 text-red-700">
                    <li className="flex items-start">
                      <XCircle className="text-red-500 mt-1 mr-2 h-4 w-4" />
                      Personal or family history of medullary thyroid carcinoma (MTC)
                    </li>
                    <li className="flex items-start">
                      <XCircle className="text-red-500 mt-1 mr-2 h-4 w-4" />
                      Multiple Endocrine Neoplasia syndrome type 2 (MEN 2)
                    </li>
                    <li className="flex items-start">
                      <XCircle className="text-red-500 mt-1 mr-2 h-4 w-4" />
                      Known serious hypersensitivity to tirzepatide or any components
                    </li>
                  </ul>
                </div>
              </CollapsibleSection>

              <CollapsibleSection id="adverse-reactions" title="Adverse Reactions">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-medical-gray-800 mb-3">Most Common (≥5%)</h3>
                    <div className="space-y-2">
                      {adverseReactions.map((reaction, index) => (
                        <div key={index} className="bg-medical-gray-50 p-3 rounded flex justify-between items-center">
                          <span className="text-medical-gray-700">{reaction.name}</span>
                          <Badge variant="outline">{reaction.percentage}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-medical-gray-800 mb-3">Clinical Considerations</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 mb-3">
                        <strong>Gastrointestinal adverse reactions:</strong> Most frequent during dose escalation period and generally decrease over time.
                      </p>
                      <p className="text-sm text-blue-800">
                        <strong>Management:</strong> Consider dose reduction if not tolerated or discontinuation for severe reactions.
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection id="clinical-pharmacology" title="Clinical Pharmacology">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-medical-gray-800 mb-3">Mechanism of Action</h3>
                    <p className="text-medical-gray-700 mb-4">
                      Tirzepatide is a dual GIP receptor and GLP-1 receptor agonist. It selectively binds to and activates both the GIP and GLP-1 receptors, the targets for native GIP and GLP-1.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-green-800 mb-2">GLP-1 Effects</h4>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>• Glucose-dependent insulin secretion</li>
                            <li>• Glucagon suppression</li>
                            <li>• Gastric emptying delay</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-blue-800 mb-2">GIP Effects</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Enhanced insulin sensitivity</li>
                            <li>• Improved glucose tolerance</li>
                            <li>• Weight reduction effects</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection id="clinical-studies" title="Clinical Studies">
                <div className="medical-content" dangerouslySetInnerHTML={{ __html: drug.label.clinicalStudies }} />
                <div className="bg-medical-gray-50 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-medical-gray-800 mb-4">Key Efficacy Results</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    {clinicalResults.map((result, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p className={`text-2xl font-bold ${result.color}`}>{result.value}</p>
                          <p className="text-sm text-medical-gray-600 mt-1">{result.label}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection id="dosage-forms" title="Dosage Forms and Strengths">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-medical-gray-700">{drug.label.dosageFormsAndStrengths}</p>
                </div>
              </CollapsibleSection>

              <CollapsibleSection id="how-supplied" title="How Supplied/Storage and Handling">
                <div className="space-y-4">
                  <p className="text-medical-gray-700">{drug.label.howSupplied}</p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-800 mb-2">Storage Requirements</h4>
                    <p className="text-amber-700 text-sm">Store in refrigerator at 36°F to 46°F (2°C to 8°C). Do not freeze. Protect from light.</p>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection id="description" title="Description">
                <div className="medical-content" dangerouslySetInnerHTML={{ __html: drug.label.description }} />
              </CollapsibleSection>

              <CollapsibleSection id="specific-populations" title="Use in Specific Populations">
                <div className="space-y-4">
                  <p className="text-medical-gray-700">{drug.label.useInSpecificPopulations}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-orange-200 bg-orange-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-orange-800 mb-2">Pregnancy</h4>
                        <p className="text-orange-700 text-sm">Limited human data. Use only if potential benefit justifies potential risk to fetus.</p>
                      </CardContent>
                    </Card>
                    <Card className="border-purple-200 bg-purple-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-purple-800 mb-2">Pediatric Use</h4>
                        <p className="text-purple-700 text-sm">Safety and effectiveness not established in pediatric patients.</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection id="nonclinical-toxicology" title="Nonclinical Toxicology">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Animal Studies</h4>
                  <p className="text-red-700">{drug.label.nonClinicalToxicology}</p>
                </div>
              </CollapsibleSection>

              <CollapsibleSection id="instructions-for-use" title="Patient Counseling Information">
                <div className="space-y-4">
                  <p className="text-medical-gray-700">{drug.label.instructionsForUse}</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Key Patient Instructions</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Rotate injection sites to reduce risk of lipodystrophy</li>
                      <li>• Do not share pen devices between patients</li>
                      <li>• Dispose of needles properly in sharps container</li>
                      <li>• Store in refrigerator, do not freeze</li>
                    </ul>
                  </div>
                </div>
              </CollapsibleSection>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
