import { Link } from "wouter";

export default function Footer() {
  const footerSections = [
    {
      title: "Resources",
      links: [
        { name: "Drug Search", href: "/search" },
        { name: "Therapeutic Classes", href: "/therapeutic-classes" },
        { name: "Drug Interactions", href: "/interactions" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Contact Us", href: "/contact" },
        { name: "FAQ", href: "/faq" },
        { name: "Terms of Service", href: "/terms" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Disclaimer", href: "/disclaimer" },
        { name: "Accessibility", href: "/accessibility" },
      ],
    },
  ];

  return (
    <footer className="bg-medical-gray-800 text-medical-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">MedInfo Platform</h3>
            <p className="text-sm">
              Comprehensive drug information for healthcare professionals
            </p>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-white mb-3">{section.title}</h4>
              <ul className="space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-medical-gray-700 mt-8 pt-8 text-center text-sm">
          <p>
            &copy; 2025 MedInfo Platform. All rights reserved. This information is for
            healthcare professionals only.
          </p>
        </div>
      </div>
    </footer>
  );
}
