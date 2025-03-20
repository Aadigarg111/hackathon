import React, { useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider } from "../../lib/AuthContext";
import { useAuth } from "../../lib/AuthContext";
import Login from "../Login";
import Register from "../Register";
import Dashboard from "../Dashboard";
import Challenges from "../Challenges";
import ProtectedRoute from "../../components/ProtectedRoute";
import { CheckIcon, GithubIcon } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/ui/card";
import { Logo } from "../../components/Logo";

// Enhance global fetch for debugging
const enhanceFetch = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    console.log('📡 Fetch Request:', args[0], args[1] || {});
    
    try {
      const response = await originalFetch.apply(this, args);
      
      // Clone the response so we can read the body
      const responseClone = response.clone();
      
      // Log response information
      console.log('📡 Fetch Response:', {
        url: args[0],
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const data = await responseClone.json();
          console.log('📡 Response JSON:', data);
        } catch (error) {
          console.error('📡 Error parsing JSON response:', error);
        }
      }
      
      return response;
    } catch (error) {
      console.error('📡 Fetch Error:', error, 'Request:', args[0]);
      throw error;
    }
  };
};

// Main Frame component
export const Frame = (): JSX.Element => {
  // Set up enhanced fetch for debugging
  useEffect(() => {
    enhanceFetch();
    console.log('📡 Enhanced fetch API for debugging');
  }, []);
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/challenges" 
            element={
              <ProtectedRoute>
                <Challenges />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// Home page component
const HomePage = (): JSX.Element => {
  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        // Calculate mouse position percentage
        const mouseX = (clientX / innerWidth - 0.5) * 2; // -1 to 1
        const mouseY = (clientY / innerHeight - 0.5) * 2; // -1 to 1

        // Apply parallax effect to hero section
        if (heroRef.current) {
          heroRef.current.style.transform = `
            perspective(1000px)
            rotateX(${mouseY * -2}deg)
            rotateY(${mouseX * 2}deg)
            translateZ(50px)
          `;
        }

        // Update all buttons with 3D effect
        const buttons = Array.from(containerRef.current.querySelectorAll('button, a')) as HTMLElement[];
        buttons.forEach(button => {
          const rect = button.getBoundingClientRect();
          const x = clientX - rect.left;
          const y = clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            button.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05) translateZ(20px)`;
          } else {
            button.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0)';
          }
        });
      }
    };

    const handleTilt = (e: MouseEvent, card: HTMLDivElement, wrapper: HTMLDivElement) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `
        perspective(1000px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg) 
        scale3d(1.02, 1.02, 1.02)
        translateZ(30px)
      `;
      
      // Enhanced highlight effect
      const glareX = ((x - centerX) / centerX) * 100 + 50;
      const glareY = ((y - centerY) / centerY) * 100 + 50;
      wrapper.style.setProperty('--mouse-x', `${glareX}%`);
      wrapper.style.setProperty('--mouse-y', `${glareY}%`);
    };

    const handleMouseLeave = (card: HTMLDivElement) => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0) scale3d(1, 1, 1)';
      card.style.transition = 'all 0.5s ease-out';
    };

    const handleMouseEnter = (card: HTMLDivElement) => {
      card.style.transition = 'all 0.1s ease-out';
    };

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    
    cardRefs.current.forEach((cardRef) => {
      if (cardRef) {
        const wrapper = cardRef.parentElement as HTMLDivElement;
        cardRef.addEventListener('mousemove', (e) => handleTilt(e, cardRef, wrapper));
        cardRef.addEventListener('mouseleave', () => handleMouseLeave(cardRef));
        cardRef.addEventListener('mouseenter', () => handleMouseEnter(cardRef));
      }
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cardRefs.current.forEach((cardRef) => {
        if (cardRef) {
          const wrapper = cardRef.parentElement as HTMLDivElement;
          cardRef.removeEventListener('mousemove', (e) => handleTilt(e, cardRef, wrapper));
          cardRef.removeEventListener('mouseleave', () => handleMouseLeave(cardRef));
          cardRef.removeEventListener('mouseenter', () => handleMouseEnter(cardRef));
        }
      });
    };
  }, []);

  // Pricing plan data
  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      popular: false,
      description: "Basic features for solo coders",
      features: [
        "Deadline Extension",
        "Extra reward on task completion",
        "Some Stake amount will be credited if failed.",
        "Automated peer group joining",
      ],
      buttonText: "Get Started",
      buttonVariant: "secondary" as const,
    },
    {
      name: "Pro",
      price: "$12",
      period: "/month",
      popular: true,
      description: "Everything you need to stay motivated",
      features: [
        "Deadline Extension",
        "Extra reward on task completion",
        "Some Stake amount will be credited if failed.",
        "Automated peer group joining",
      ],
      buttonText: "Go Pro",
      buttonVariant: "default" as const,
    },
  ];

  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-black perspective-1000 preserve-3d">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />
      
      <header className="relative flex items-center justify-between w-full h-[72px] px-4 animate-fadeIn z-50">
        <Logo />
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/challenges">
                <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 transform-gpu hover:translate-z-20">
                  Challenges
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 transform-gpu hover:translate-z-20">
                  Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-white transition-all duration-300 hover:text-purple-400 transform-gpu hover:translate-z-20">
                  Log In
                </Button>
              </Link>

              <button
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    const response = await fetch('http://localhost:5000/api/auth/debug');
                    if (!response.ok) {
                      throw new Error('Server error');
                    }
                    const data = await response.json();
                    
                    if (data.githubConfigured) {
                      // Store current URL for redirect after login
                      localStorage.setItem('returnUrl', window.location.href);
                      // Redirect to GitHub OAuth flow
                      window.location.href = 'http://localhost:5000/api/auth/github';
                    } else {
                      console.error('GitHub auth not configured');
                      alert('GitHub login is temporarily unavailable. Please use email login.');
                    }
                  } catch (error) {
                    console.error('Failed to check GitHub configuration:', error);
                    alert('Cannot connect to the server. Please try again later.');
                  }
                }}
                className="flex items-center gap-2 bg-[#24292e] hover:bg-[#2f363d] px-4 py-2 rounded-md text-white transition-all duration-300 hover:translate-y-[-2px] transform-gpu hover:translate-z-20"
              >
                <GithubIcon className="w-5 h-5" />
                <span className="text-[14px] font-medium">Continue with GitHub</span>
              </button>
            </>
          )}
        </div>
      </header>

      <section 
        ref={heroRef} 
        className="relative flex flex-col items-center justify-center w-full pt-16 pb-24 text-center animate-slideUp transition-transform duration-300 ease-out transform-gpu preserve-3d z-30"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/5 via-transparent to-purple-900/5 pointer-events-none" />
        
        <h1 className="relative font-bold text-purple-600 text-[58.5px] leading-[60px] [font-family:'Inter',Helvetica] animate-fadeIn transform-gpu translate-z-50 animate-float">
          Stake Your Code.
        </h1>

        <h2 className="relative mt-4 font-bold text-purple-600 text-[47.2px] leading-[48px] [font-family:'Inter',Helvetica] animate-fadeIn animation-delay-200 transform-gpu translate-z-40">
          Level Up Your Career.
        </h2>

        <p className="relative max-w-[628px] mt-8 text-gray-400 text-[14.9px] leading-6 animate-fadeIn animation-delay-300 transform-gpu translate-z-30">
          Join a community of developers who bet on themselves. Create coding
          challenges, stake
          <br />
          crypto, and earn rewards for consistent progress.
        </p>

        <div className="relative flex gap-4 mt-12 animate-fadeIn animation-delay-400 transform-gpu translate-z-20">
          {user ? (
            <>
              <Link to="/challenges">
                <Button className="h-12 px-8 text-[17px] bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 transform-gpu shadow-[0_8px_16px_rgba(147,51,234,0.2)] hover:shadow-[0_12px_24px_rgba(147,51,234,0.3)] hover:translate-z-30">
                  View Challenges
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button className="h-12 px-8 text-[17px] bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 transform-gpu shadow-[0_8px_16px_rgba(147,51,234,0.2)] hover:shadow-[0_12px_24px_rgba(147,51,234,0.3)] hover:translate-z-30">
                  Go to Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <Link to="/register">
              <Button className="h-12 px-8 text-[17px] bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 transform-gpu shadow-[0_8px_16px_rgba(147,51,234,0.2)] hover:shadow-[0_12px_24px_rgba(147,51,234,0.3)] hover:translate-z-30">
                Create Account
              </Button>
            </Link>
          )}
        </div>
      </section>

      <section className="w-full bg-gray-950 py-16">
        <div className="flex flex-col items-center max-w-6xl mx-auto px-4">
          <h2 className="font-bold text-purple-600 text-[35.7px] leading-10 mb-6 [font-family:'Inter',Helvetica] animate-fadeIn">
            Choose Your Plan
          </h2>

          <p className="text-gray-400 text-[14.8px] leading-6 mb-16 max-w-[656px] text-center animate-fadeIn animation-delay-100">
            Select a plan that works for you and supercharge your coding consistency with accountability
          </p>

          <div className="flex flex-wrap justify-center gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative group animate-fadeIn animation-delay-${(index + 2) * 100}`}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-purple-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(147,51,234,0.1),transparent_40%)]" />
                <Card
                  ref={el => cardRefs.current[index] = el}
                  className={`relative w-[340px] ${
                    plan.popular ? "bg-[#1a1625]" : "bg-[#111827]"
                  } border transition-all duration-500 ${
                    plan.popular 
                      ? "border-purple-500/40 after:absolute after:inset-0 after:rounded-xl after:shadow-[0_10px_70px_rgba(147,51,234,0.35),0_15px_100px_rgba(147,51,234,0.25)] after:-z-10" 
                      : "border-gray-800/40"
                  } rounded-xl overflow-hidden will-change-transform hover:shadow-[0_25px_90px_rgba(147,51,234,0.25),0_35px_130px_rgba(147,51,234,0.2)] hover:translate-y-[-8px]`}
                  style={{
                    transformStyle: 'preserve-3d',
                    boxShadow: plan.popular 
                      ? '0 8px 30px rgba(147,51,234,0.2), 0 12px 50px rgba(147,51,234,0.15), inset 0 1px 1px rgba(255,255,255,0.1), inset 0 -1px 1px rgba(0,0,0,0.1)' 
                      : '0 8px 20px rgba(0,0,0,0.15), 0 12px 40px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.05), inset 0 -1px 1px rgba(0,0,0,0.05)'
                  }}
                >
                  {plan.popular && (
                    <>
                      <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-purple-500/40 via-purple-500/20 to-transparent blur-md" />
                      <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-b from-purple-500/30 via-purple-500/15 to-transparent" />
                      <Badge className="absolute top-4 right-4 px-3 py-1 bg-purple-600 text-white text-xs font-semibold z-10 shadow-[0_4px_15px_rgba(147,51,234,0.4)] rotate-[2deg]">
                        POPULAR
                      </Badge>
                    </>
                  )}

                  <CardHeader className="text-center pt-8 pb-6 px-6">
                    <h3 className="text-white text-2xl font-bold mb-4">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-white text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-400 text-sm">{plan.period}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-4">
                      {plan.description}
                    </p>
                  </CardHeader>

                  <CardContent className="px-6 pb-8">
                    <ul className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full ${
                            plan.popular ? "bg-purple-500/30 shadow-[0_2px_8px_rgba(147,51,234,0.25)]" : "bg-gray-800"
                          } flex items-center justify-center`}>
                            {plan.popular ? (
                              <CheckIcon className="w-3.5 h-3.5 text-purple-400" />
                            ) : (
                              <div className="w-2.5 h-0.5 bg-gray-600" />
                            )}
                          </div>
                          <span className="text-gray-300 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="px-6 pb-8">
                    <Button
                      variant={plan.buttonVariant}
                      className={`w-full py-6 text-base font-semibold transition-all duration-300 ${
                        plan.popular
                          ? "bg-purple-600 hover:bg-purple-700 text-white shadow-[0_8px_25px_rgba(147,51,234,0.3)] hover:shadow-[0_12px_30px_rgba(147,51,234,0.4)] hover:translate-y-[-2px]"
                          : "bg-gray-800/50 hover:bg-gray-700 text-white hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:translate-y-[-2px]"
                      }`}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="w-full py-8 border-t border-gray-800 text-center animate-fadeIn">
        <p className="text-gray-500 text-[14.9px]">
          © 2025 Code Stake. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
