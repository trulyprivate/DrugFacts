import type { Metadata } from 'next';
import { staticPageDescriptions } from '@/lib/seo-utils';

export const metadata: Metadata = {
  title: 'Medical Disclaimer | drugfacts.wiki',
  description: staticPageDescriptions.disclaimer,
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Medical Disclaimer</h1>
          
          <div className="prose max-w-none space-y-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
              <h2 className="text-xl font-bold text-red-800 mb-3">⚠️ IMPORTANT MEDICAL NOTICE</h2>
              <p className="text-red-700 font-medium">
                The information provided on drugfacts.wiki is for educational and informational purposes only. 
                This website is NOT a substitute for professional medical advice, diagnosis, or treatment.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Educational Purpose Only</h2>
              <p className="text-gray-600">
                All drug information, prescribing details, and medical content on this website are provided solely for educational purposes. 
                This information is intended to supplement, not replace, the expertise and judgment of healthcare professionals.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Always Consult Healthcare Professionals</h2>
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <p className="text-yellow-800 font-medium mb-2">You should ALWAYS:</p>
                <ul className="list-disc pl-6 text-yellow-700 space-y-1">
                  <li>Consult your doctor, pharmacist, or healthcare provider before making any medical decisions</li>
                  <li>Verify all drug information with your healthcare team</li>
                  <li>Seek professional medical advice for any health condition or concern</li>
                  <li>Follow your healthcare provider's instructions for medications</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Do Not Use for Self-Diagnosis or Treatment</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Never use this information to diagnose yourself or others</li>
                <li>Do not start, stop, or change medications based on this information alone</li>
                <li>Do not delay seeking professional medical care based on information found here</li>
                <li>Individual medical situations vary greatly and require personalized professional assessment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Medical Emergencies</h2>
              <div className="bg-red-100 border border-red-300 p-4 rounded-lg">
                <p className="text-red-800 font-bold mb-2">🚨 IN CASE OF MEDICAL EMERGENCY:</p>
                <p className="text-red-700">
                  Call emergency services (911 in the US) immediately or go to your nearest emergency room. 
                  Do not rely on website information during medical emergencies.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Accuracy</h2>
              <p className="text-gray-600 mb-4">
                While we strive to provide accurate information sourced from FDA-approved drug labels:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Drug information changes frequently and may not reflect the most current labeling</li>
                <li>Individual responses to medications vary significantly</li>
                <li>Drug interactions and contraindications require professional evaluation</li>
                <li>Dosing and administration must be determined by healthcare professionals</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-600">
                drugfacts.wiki, its owners, operators, and contributors are not responsible for any adverse outcomes, 
                health consequences, or damages that may result from the use or misuse of information provided on this website. 
                Users assume full responsibility for how they use this information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Professional Resources</h2>
              <p className="text-gray-600 mb-4">
                For professional medical advice and current prescribing information, always consult:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Your personal physician or healthcare provider</li>
                <li>Licensed pharmacists</li>
                <li>Current FDA-approved prescribing information</li>
                <li>Clinical drug references and databases</li>
                <li>Poison control centers for overdose or adverse reactions</li>
              </ul>
            </section>

            <div className="bg-blue-50 p-6 rounded-lg mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Remember</h3>
              <p className="text-gray-700">
                Your health and safety are paramount. When in doubt, always err on the side of caution and 
                consult qualified healthcare professionals who can provide personalized medical guidance based on your specific situation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}