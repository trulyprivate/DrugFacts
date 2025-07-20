import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ | drugfacts.wiki',
  description: 'Frequently asked questions about drugfacts.wiki, including how to use the platform and understand drug information.',
};

export default function FAQPage() {
  const faqs = [
    {
      question: "What is drugfacts.wiki?",
      answer: "DrugFacts Wiki is a comprehensive platform providing professional drug information based on FDA-approved labeling. We offer detailed prescribing information, patient-friendly explanations, and related content to help healthcare professionals and patients make informed decisions."
    },
    {
      question: "Is the information on drugfacts.wiki accurate?",
      answer: "All drug information is sourced directly from FDA-approved drug labels and official prescribing information. However, this information is for educational purposes only and should not replace professional medical advice."
    },
    {
      question: "Can I use this site for medical decisions?",
      answer: "No. DrugFacts Wiki provides educational information only. Always consult with your healthcare provider for medical advice, diagnosis, or treatment decisions."
    },
    {
      question: "How often is the drug information updated?",
      answer: "We regularly update our database with the latest FDA-approved drug labeling information. However, drug information can change frequently, so always verify with your healthcare provider or the latest FDA labeling."
    },
    {
      question: "Is drugfacts.wiki free to use?",
      answer: "Yes, drugfacts.wiki is completely free to use. We believe that access to accurate drug information should be available to everyone."
    },
    {
      question: "Do you collect personal information?",
      answer: "We do not collect any personally identifying information. Your privacy and anonymity are completely protected when using our platform."
    },
    {
      question: "Can I suggest drugs to be added?",
      answer: "Currently, our database includes FDA-approved medications with official labeling. For suggestions or requests, please contact us through our contact page."
    },
    {
      question: "How do I report an error or issue?",
      answer: "If you notice any errors or technical issues, please contact our support team immediately. We take accuracy very seriously and will investigate all reports promptly."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>
          
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Still have questions?</h3>
            <p className="text-gray-700">
              If you can't find the answer you're looking for, please contact us through our{' '}
              <a href="/contact" className="text-medical-blue hover:underline">contact page</a>.
              We're here to help!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}