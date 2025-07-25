'use client'

import { FAQSection as FAQ } from '@/lib/content-generation'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { HelpCircle } from 'lucide-react'

interface FAQSectionProps {
  faqs: FAQ[]
  drugName: string
}

const categoryColors: Record<FAQ['category'], string> = {
  'dosing': 'bg-gray-100 text-gray-800 border-gray-200',
  'safety': 'bg-red-100 text-red-800 border-red-200',
  'usage': 'bg-green-100 text-green-800 border-green-200',
  'side-effects': 'bg-orange-100 text-orange-800 border-orange-200',
  'storage': 'bg-purple-100 text-purple-800 border-purple-200'
}

const categoryLabels: Record<FAQ['category'], string> = {
  'dosing': 'Dosing',
  'safety': 'Safety',
  'usage': 'Usage', 
  'side-effects': 'Side Effects',
  'storage': 'Storage'
}

export default function FAQSection({ faqs, drugName }: FAQSectionProps) {
  if (faqs.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
        <h3 className="text-base sm:text-lg font-semibold card-title-responsive">Frequently Asked Questions</h3>
      </div>
      
      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`faq-${index}`}
            className="border border-gray-200 rounded-lg px-3 sm:px-4"
          >
            <AccordionTrigger className="text-left hover:no-underline py-3 sm:py-4">
              <div className="flex items-start gap-2 sm:gap-3 w-full">
                <Badge 
                  variant="outline" 
                  className={`${categoryColors[faq.category]} text-xs flex-shrink-0 mt-1`}
                >
                  {categoryLabels[faq.category]}
                </Badge>
                <span className="font-medium text-sm sm:text-base card-title-responsive">{faq.question}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-gray-700 pt-2 pl-12 sm:pl-16 text-sm sm:text-base">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p>
          <strong>Note:</strong> This information is for educational purposes only and does not replace professional medical advice. 
          Always consult your healthcare provider about {drugName} and your specific medical condition.
        </p>
      </div>
    </div>
  )
}