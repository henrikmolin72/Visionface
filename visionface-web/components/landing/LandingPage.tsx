'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Philosophy from '@/components/landing/Philosophy';
import Protocol from '@/components/landing/Protocol';
import Membership from '@/components/landing/Membership';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
    const rootRef = useRef<HTMLDivElement>(null);
    const [compactNavbar, setCompactNavbar] = useState(false);
    const router = useRouter();

    const handlePrimaryAction = useCallback(() => {
        router.push('/main/scan');
    }, [router]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        gsap.registerPlugin(ScrollTrigger);

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const supportsHover = window.matchMedia('(hover: hover)').matches;
        const isMobile = window.matchMedia('(max-width: 900px)').matches;

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: root,
                start: 120,
                end: 'bottom top',
                onToggle: ({ isActive }) => setCompactNavbar(isActive),
            });

            if (prefersReducedMotion) return;

            gsap.from('.vf-nav-shell', {
                y: -24,
                autoAlpha: 0,
                duration: 0.6,
                ease: 'power3.out',
            });

            gsap.from('.vf-hero-reveal', {
                autoAlpha: 0,
                y: 30,
                duration: 0.72,
                stagger: 0.1,
                ease: 'power3.out',
                delay: 0.08,
            });

            gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element, index) => {
                if (element.classList.contains('vf-hero-reveal')) return;

                gsap.fromTo(
                    element,
                    { autoAlpha: 0, y: 38 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.8,
                        delay: Math.min(index * 0.02, 0.16),
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: element,
                            start: 'top 90%',
                            once: true,
                        },
                    },
                );
            });

            const heroBackground = root.querySelector<HTMLElement>('[data-hero-bg]');
            if (heroBackground) {
                gsap.to(heroBackground, {
                    yPercent: 14,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '#hero',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true,
                    },
                });
            }

            const philosophyTexture = root.querySelector<HTMLElement>('[data-philosophy-parallax]');
            if (philosophyTexture) {
                gsap.to(philosophyTexture, {
                    yPercent: -14,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '#philosophy',
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    },
                });
            }

            const cards = gsap.utils.toArray<HTMLElement>('.vf-protocol-card');
            cards.forEach((card, index) => {
                if (index >= cards.length - 1) return;
                const nextCard = cards[index + 1];
                const scaleStep = isMobile ? 0.012 : 0.022;
                const blurAmount = isMobile ? 0.35 : 0.65;

                gsap.to(card, {
                    scale: 1 - (index + 1) * scaleStep,
                    filter: `blur(${blurAmount}px)`,
                    transformOrigin: '50% 0%',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: nextCard,
                        start: 'top 78%',
                        end: 'top 42%',
                        scrub: true,
                    },
                });
            });
        }, root);

        const cleanupMagnetics: Array<() => void> = [];
        if (!prefersReducedMotion && supportsHover) {
            const magneticElements = Array.from(root.querySelectorAll<HTMLElement>('.vf-magnetic'));
            for (const element of magneticElements) {
                const onMove = (event: PointerEvent) => {
                    const rect = element.getBoundingClientRect();
                    const x = (event.clientX - rect.left) / rect.width - 0.5;
                    const y = (event.clientY - rect.top) / rect.height - 0.5;

                    gsap.to(element, {
                        x: x * 12,
                        y: y * 8,
                        duration: 0.35,
                        ease: 'power3.out',
                    });
                };

                const onLeave = () => {
                    gsap.to(element, {
                        x: 0,
                        y: 0,
                        duration: 0.55,
                        ease: 'power3.out',
                    });
                };

                element.addEventListener('pointermove', onMove);
                element.addEventListener('pointerleave', onLeave);
                element.addEventListener('pointerup', onLeave);

                cleanupMagnetics.push(() => {
                    element.removeEventListener('pointermove', onMove);
                    element.removeEventListener('pointerleave', onLeave);
                    element.removeEventListener('pointerup', onLeave);
                });
            }
        }

        return () => {
            for (const cleanup of cleanupMagnetics) cleanup();
            ctx.revert();
        };
    }, []);

    return (
        <div ref={rootRef} className="vf-landing min-h-screen">
            <Navbar compact={compactNavbar} onPrimaryAction={handlePrimaryAction} />
            <Hero onPrimaryAction={handlePrimaryAction} />
            <main className="vf-main">
                <Features />
                <Philosophy />
                <Protocol />
                <Membership />
            </main>
            <Footer />
        </div>
    );
}
