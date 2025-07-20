import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility | drugfacts.wiki',
  description: 'Accessibility features and commitment of drugfacts.wiki to ensure equal access to drug information.',
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Accessibility Statement</h1>
          
          <div className="prose max-w-none space-y-6">
            <p className="text-lg text-gray-600">
              drugfacts.wiki is committed to ensuring equal access to drug information for all users, 
              including those with disabilities. We strive to provide an accessible experience that works for everyone.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
              <p className="text-gray-600 mb-4">
                We are committed to conforming with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. 
                Our goal is to provide a website that is accessible to the widest possible audience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accessibility Features</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Visual Accessibility</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>High contrast color schemes for better readability</li>
                    <li>Scalable text that works with browser zoom up to 200%</li>
                    <li>Clear visual focus indicators for keyboard navigation</li>
                    <li>Alt text for all informative images</li>
                    <li>Consistent and logical page layouts</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Navigation & Interaction</h3>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Full keyboard navigation support</li>
                    <li>Skip links to main content</li>
                    <li>Descriptive page titles and headings</li>
                    <li>Proper form labels and instructions</li>
                    <li>Logical tab order throughout the site</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Screen Reader Support</h2>
              <p className="text-gray-600 mb-4">
                Our website is designed to work with popular screen readers including:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>JAWS (Windows)</li>
                <li>NVDA (Windows)</li>
                <li>VoiceOver (macOS and iOS)</li>
                <li>TalkBack (Android)</li>
              </ul>
              <p className="text-gray-600 mt-4">
                We use semantic HTML, proper heading structure, and ARIA labels to ensure screen reader compatibility.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Browser and Device Support</h2>
              <p className="text-gray-600 mb-4">
                drugfacts.wiki is designed to work on:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Modern web browsers (Chrome, Firefox, Safari, Edge)</li>
                <li>Mobile devices and tablets</li>
                <li>Various screen sizes and orientations</li>
                <li>Different operating systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Keyboard Navigation</h2>
              <p className="text-gray-600 mb-4">
                All interactive elements can be accessed using the keyboard:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Tab:</strong> Move forward through interactive elements</li>
                <li><strong>Shift + Tab:</strong> Move backward through interactive elements</li>
                <li><strong>Enter/Space:</strong> Activate buttons and links</li>
                <li><strong>Arrow keys:</strong> Navigate within complex components</li>
                <li><strong>Escape:</strong> Close modal dialogs and menus</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ongoing Improvements</h2>
              <p className="text-gray-600">
                Accessibility is an ongoing effort. We regularly review and improve our website to ensure it meets 
                evolving accessibility standards and user needs. We test with automated tools, manual reviews, 
                and user feedback to identify and address accessibility barriers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Feedback and Support</h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">We Want to Hear From You</h3>
                <p className="text-gray-700 mb-4">
                  If you experience any accessibility barriers or have suggestions for improvement, 
                  please contact us. Your feedback helps us make drugfacts.wiki more accessible for everyone.
                </p>
                <p className="text-gray-700">
                  <strong>Contact us:</strong> Send accessibility feedback through our{' '}
                  <a href="/contact" className="text-medical-blue hover:underline">contact page</a>{' '}
                  and mark your message as "Accessibility Feedback" for priority handling.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Alternative Formats</h2>
              <p className="text-gray-600">
                If you need drug information in an alternative format not available on our website, 
                please contact us and we will work to accommodate your needs within reasonable timeframes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Content</h2>
              <p className="text-gray-600">
                While we strive to ensure all content meets accessibility standards, some third-party 
                content may not be fully accessible. We work to minimize such content and provide 
                accessible alternatives when possible.
              </p>
            </section>

            <div className="bg-green-50 p-6 rounded-lg mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Promise</h3>
              <p className="text-gray-700">
                We believe that access to critical drug information should not be limited by disability. 
                We are committed to continuous improvement in making our platform accessible to all users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}