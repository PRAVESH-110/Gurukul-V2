"use client";

import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";

/**
 * WarmupLoader — shown during the first server request on Render free tier.
 * Matches the Gurukul platform's clean blue/white educational theme.
 *
 * @param {string} label - Optional label override (default: "Signing in...")
 */
export default function WarmupLoader({ label = "Signing in..." }) {
    const [messageIndex, setMessageIndex] = useState(0);

    const messages = [
        "Connecting to server...",
        "First request may take 30–60 seconds...",
        "Our servers are warming up...",
        "Almost there, hang tight...",
    ];

    useEffect(() => {
        // Cycle through messages at increasing intervals
        const delays = [3000, 6000, 10000];
        const timers = [];
        let accumulated = 0;

        delays.forEach((delay, i) => {
            accumulated += delay;
            const t = setTimeout(() => {
                setMessageIndex((prev) => Math.min(prev + 1, messages.length - 1));
            }, accumulated);
            timers.push(t);
        });

        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center gap-3 py-2">
            {/* Spinner ring with Gurukul blue */}
            <div className="relative w-10 h-10">
                {/* Outer track */}
                <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
                {/* Spinning arc */}
                <div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin"
                    style={{ animationDuration: "0.9s" }}
                />
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary-400" />
                </div>
            </div>

            {/* Primary label (e.g. "Signing in...") */}
            <p className="text-sm font-semibold text-gray-700">{label}</p>

            {/* Cycling warmup message */}
            <div className="h-5 overflow-hidden relative w-full text-center">
                <p
                    key={messageIndex}
                    className="text-xs text-gray-400 animate-fade-in"
                >
                    {messages[messageIndex]}
                </p>
            </div>
        </div>
    );
}
