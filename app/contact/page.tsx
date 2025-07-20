import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | drugfacts.wiki',
  description: 'Get in touch with drugfacts.wiki for questions about drug information, feedback, or technical support.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              We're here to help with any questions about drug information or our platform.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">General Inquiries</h2>
                <p className="text-gray-600 mb-4">
                  For questions about drug information, platform features, or general feedback.
                </p>
                <p className="text-medical-blue font-medium">
                  Email: info@drugfacts.wiki
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Technical Support</h2>
                <p className="text-gray-600 mb-4">
                  For website issues, accessibility concerns, or technical problems.
                </p>
                <p className="text-medical-blue font-medium">
                  Email: support@drugfacts.wiki
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Notice</h3>
              <p className="text-gray-700">
                DrugFacts Wiki provides educational information only and is not a substitute for professional medical advice. 
                For medical emergencies, contact your healthcare provider or emergency services immediately.
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time</h3>
              <p className="text-gray-600">
                We typically respond to inquiries within 24-48 hours during business days. 
                For urgent medical questions, please consult your healthcare provider directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}