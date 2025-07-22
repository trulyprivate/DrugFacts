import type { Metadata } from 'next';
import { staticPageDescriptions } from '@/lib/seo-utils';

export const metadata: Metadata = {
  title: 'Privacy Policy | drugfacts.wiki',
  description: staticPageDescriptions.privacy,
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose max-w-none space-y-6">
            <p className="text-gray-600">
              <strong>Last updated:</strong> January 21, 2025
            </p>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <h2 className="text-lg font-semibold text-green-800 mb-2">Your Privacy is Protected</h2>
              <p className="text-green-700">
                We do not collect any personally identifying information. Your privacy is not at risk when using drugfacts.wiki.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Do NOT Collect</h2>
              <p className="text-gray-600 mb-4">
                drugfacts.wiki is designed with privacy by design. We do not collect, store, or process:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Personal names or contact information</li>
                <li>Email addresses or phone numbers</li>
                <li>User accounts or login credentials</li>
                <li>Search history or browsing patterns</li>
                <li>Location data or IP addresses</li>
                <li>Device information or browser fingerprints</li>
                <li>Cookies or tracking technologies</li>
                <li>Any health information or medical queries</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Protect Your Privacy</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>No Registration Required:</strong> You can access all drug information without creating an account</li>
                <li><strong>No Tracking:</strong> We do not use analytics, cookies, or tracking scripts</li>
                <li><strong>No Data Storage:</strong> Your searches and activities are not logged or stored</li>
                <li><strong>Anonymous Access:</strong> Your visit to our site is completely anonymous</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technical Information</h2>
              <p className="text-gray-600">
                Our website operates as a static informational resource. Standard web server logs may temporarily record basic technical information (like response times) for operational purposes only, but this data cannot be linked to any individual user and is not stored permanently.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
              <p className="text-gray-600">
                We do not integrate with any third-party analytics, advertising, or tracking services. All drug information is served directly from our platform without external data sharing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-600">
                If you have questions about our privacy practices, you can contact us through our contact page. However, please note that we cannot and do not collect any personal information even through contact forms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-600">
                If we ever change our privacy practices, we will update this policy and post the changes on this page. Given our commitment to not collecting personal data, any changes would likely involve even stronger privacy protections.
              </p>
            </section>

            <div className="bg-blue-50 p-6 rounded-lg mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
              <p className="text-gray-700">
                drugfacts.wiki is committed to providing valuable drug information while maintaining complete user privacy. 
                We believe that access to medical information should not come at the cost of your privacy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}