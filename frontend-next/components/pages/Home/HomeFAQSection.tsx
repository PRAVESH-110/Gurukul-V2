'use client';
import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/UI/accordion";

const HomeFAQSection = () => {
    return (
        <section className="faq p-20 relative mb-10 font-sm w-[60%] border rounded-xl border-2 bg-gray-100">
            <h1 className="text-2xl font-bold mb-6">FAQ&apos;S</h1>
            <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue="item-1"
            >
                <AccordionItem value="item-1">
                    <AccordionTrigger>What is Gurukul?</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                        <p>
                            Gurukul is a platform that provides online courses and resources for students to learn and grow.
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>What do I need to start creating on Gurukul</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                        <p>
                            If you already have an existing audience, you can start creating on Gurukul by creating a course and adding your content.
                        </p>
                        <p>
                            Even if you dont have an already existing audience, you can start creating on Gurukul and build your audience over time.
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>How much does it cost to start creating on Gurukul?</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                        <p>
                            You will need to pay a very minimal amount to get started on Gurukul.
                        </p>
                        <p>
                            As your audience and the courses grow, you will need to based on the course you create.
                            Courses are still free to create and publish initially
                        </p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </section>
    );
};

export default HomeFAQSection;
