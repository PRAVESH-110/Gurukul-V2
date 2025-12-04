'use client';

import React, { useEffect, useRef } from 'react';

const CursorDotsAnimation = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const dotsRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const initDots = () => {
            // High density: more dots
            const dotCount = Math.floor((window.innerWidth * window.innerHeight) / 4000);
            dotsRef.current = [];
            for (let i = 0; i < dotCount; i++) {
                dotsRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.5 + 1, // Smaller dots for high density
                    baseX: Math.random() * canvas.width,
                    baseY: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    density: (Math.random() * 20) + 10,
                    baseOpacity: 0 // Invisible by default
                });
            }
        };

        const drawDots = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < dotsRef.current.length; i++) {
                let dot = dotsRef.current[i];
                // Only draw if visible
                if (dot.opacity > 0.01) {
                    ctx.fillStyle = dot.color;
                    ctx.beginPath();
                    ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        };

        const updateDots = () => {
            for (let i = 0; i < dotsRef.current.length; i++) {
                let dot = dotsRef.current[i];

                // 1. Constant Movement
                dot.baseX += dot.vx;
                dot.baseY += dot.vy;

                if (dot.baseX < 0) dot.baseX = canvas.width;
                if (dot.baseX > canvas.width) dot.baseX = 0;
                if (dot.baseY < 0) dot.baseY = canvas.height;
                if (dot.baseY > canvas.height) dot.baseY = 0;

                // 2. Interaction & Opacity
                let dx = mouseRef.current.x - dot.baseX;
                let dy = mouseRef.current.y - dot.baseY;
                let distance = Math.sqrt(dx * dx + dy * dy);

                // Visibility Radius (approx 100px diameter area of high visibility, fading out)
                const visibleRadius = 150;
                let opacity = 0;

                if (distance < visibleRadius) {
                    // Quadratic falloff for smoother "decreasing density" look
                    opacity = 1 - Math.pow(distance / visibleRadius, 2);
                    opacity = Math.max(0, opacity);
                }

                dot.opacity = opacity;
                dot.color = `rgba(0, 0, 0, ${opacity})`;

                // Interaction Movement (subtle pull)
                if (distance < visibleRadius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (visibleRadius - distance) / visibleRadius;

                    const moveX = forceDirectionX * force * dot.density * 2;
                    const moveY = forceDirectionY * force * dot.density * 2;

                    dot.x = dot.baseX + moveX;
                    dot.y = dot.baseY + moveY;
                } else {
                    dot.x = dot.baseX;
                    dot.y = dot.baseY;
                }
            }
        };

        const animate = () => {
            drawDots();
            updateDots();
            animationFrameId = requestAnimationFrame(animate);
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initDots();
        };

        const handleMouseMove = (event) => {
            mouseRef.current.x = event.x;
            mouseRef.current.y = event.y;
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);

        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.6 }}
        />
    );
};

export default CursorDotsAnimation;

