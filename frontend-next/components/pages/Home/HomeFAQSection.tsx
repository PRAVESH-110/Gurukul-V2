'use client';
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/UI/accordion';

const faqs = [
  {
    id: 'item-1',
    question: 'What is Gurukul?',
    answer:
      'Gurukul is an all-in-one learning and community platform providing high-quality courses, interactive discussion hubs, and video resources for students and creators to connect and grow together.',
  },
  {
    id: 'item-2',
    question: 'What do I need to start creating on Gurukul?',
    answer:
      'Anyone with valuable skills or knowledge can become a creator. You do not need an existing audience—Gurukul gives you the video hosting, syllabus builder, and community tools to grow your followers from scratch.',
  },
  {
    id: 'item-3',
    question: 'How much does it cost to create and publish courses?',
    answer:
      'Publishing and hosting your courses is free to begin. We believe in empowering instructors without upfront roadblocks, allowing you to monetize your content and earn as your student base expands.',
  },
  {
    id: 'item-4',
    question: 'Are courses self-paced or live sessions?',
    answer:
      'Gurukul supports both self-paced on-demand video lessons and scheduled community events. You can learn on your own schedule and join live events hosted by course mentors.',
  },
  {
    id: 'item-5',
    question: 'How do community discussions and mentor interactions work?',
    answer:
      'Every course is backed by its own dedicated community forum where students ask questions, submit feedback, collaborate on projects, and communicate directly with educators in real-time.',
  },
  {
    id: 'item-6',
    question: 'How and when do creators receive payouts?',
    answer:
      'Creators have full access to an intuitive analytics dashboard tracking enrollment and earnings. Payouts are handled seamlessly and securely straight to your linked account.',
  },
];

const HomeFAQSection = () => {
  return (
    <section className="faq flex-1 flex flex-col p-6 sm:p-8 bg-transparent h-full overflow-hidden">
      <div className="mb-4 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Everything you need to know about Gurukul.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <Accordion type="single" collapsible className="w-full space-y-2" defaultValue="item-1">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="border-b border-gray-100 py-1">
              <AccordionTrigger className="text-base sm:text-lg font-semibold text-gray-800 hover:text-gray-900 cursor-default hover:no-underline py-3.5 transition-colors text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-600 leading-relaxed pb-4 pt-1">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default HomeFAQSection;
