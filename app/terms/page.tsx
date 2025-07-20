import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | drugfacts.wiki',
  description: 'Terms of service and conditions for using drugfacts.wiki drug information platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose max-w-none space-y-6">
            <p className="text-gray-600">
              <strong>Last updated:</strong> January 21, 2025
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing and using drugfacts.wiki, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-600 mb-4">
                Permission is granted to temporarily access drugfacts.wiki for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Medical Disclaimer</h2>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-800 font-medium">
                  IMPORTANT: The information provided on drugfacts.wiki is for educational purposes only and is not intended as a substitute for professional medical advice, diagnosis, or treatment.
                </p>
              </div>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition</li>
                <li>Never disregard professional medical advice or delay in seeking it because of something you have read on this website</li>
                <li>In case of a medical emergency, call your doctor or emergency services immediately</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Accuracy of Information</h2>
              <p className="text-gray-600">
                While we strive to provide accurate and up-to-date information sourced from FDA-approved drug labels, we make no warranties about the completeness, reliability, or accuracy of this information. Drug information can change frequently, and users should always verify information with healthcare professionals or current FDA labeling.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Limitations</h2>
              <p className="text-gray-600">
                In no event shall drugfacts.wiki or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on drugfacts.wiki, even if drugfacts.wiki or its authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Privacy</h2>
              <p className="text-gray-600">
                We do not collect any personally identifying information from users. Your privacy is completely protected. See our Privacy Policy for more details.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Governing Law</h2>
              <p className="text-gray-600">
                These terms and conditions are governed by and construed in accordance with applicable laws, and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to Terms</h2>
              <p className="text-gray-600">
                We reserve the right to modify these terms at any time. Updated terms will be posted on this page with a new "Last updated" date.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}