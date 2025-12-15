"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Fullscreen, Loader2 } from "lucide-react";

import { Shield, Users, Package, FileText, ArrowRight, Play, CheckCircle, Sparkles } from 'lucide-react';

// Use the exact URL format from your working example
const COGNITO_DOMAIN = "https://ap-southeast-2meh3b79jl.auth.ap-southeast-2.amazoncognito.com";
const CLIENT_ID = "28b17niuo2gsbe5g3ajtv3mc4b";

// IMPORTANT: Use EXACTLY the same redirect URI that's configured in Cognito
const REDIRECT_URI = "http://localhost:3000/officials/residentinformation/list";

// For local development, you need to add this URL to your Cognito App Client settings
// OR create a separate App Client for local development

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<any>(null);

  // Step 1: Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errorParam = params.get("error");

    if (errorParam) {
      setError(`Authentication failed: ${errorParam}`);
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    if (code) {
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
      
      // Exchange code for tokens
      const exchangeCodeForTokens = async () => {
        setIsLoading(true);
        try {
          const body = new URLSearchParams({
            grant_type: "authorization_code",
            client_id: CLIENT_ID,
            code: code,
            redirect_uri: REDIRECT_URI,
          });

          const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          setTokens(data);
          console.log("Authentication successful!", data);
          
          // Store tokens (in production, use httpOnly cookies)
          localStorage.setItem("cognito_tokens", JSON.stringify(data));
          
          // Redirect to your application's dashboard
          // You might want to change this based on your needs
          window.location.href = "/dashboard";
          
        } catch (err: any) {
          console.error("Token exchange error:", err);
          setError(err.message || "Failed to complete authentication");
        } finally {
          setIsLoading(false);
        }
      };

      exchangeCodeForTokens();
    }
  }, []);

  // Check for existing tokens
  useEffect(() => {
    const storedTokens = localStorage.getItem("cognito_tokens");
    if (storedTokens) {
      try {
        setTokens(JSON.parse(storedTokens));
      } catch (err) {
        console.error("Failed to parse stored tokens:", err);
        localStorage.removeItem("cognito_tokens");
      }
    }
  }, []);

  // Login function - using the exact format from your working URL
  const handleLogin = useCallback(() => {
    setIsLoading(true);
    setError(null);

    // Construct the login URL exactly as your working example
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      scope: "email openid phone",  // Note: Using space instead of + for proper encoding
      redirect_uri: REDIRECT_URI,
    });

    const loginUrl = `${COGNITO_DOMAIN}/login?${params.toString()}`;
    
    console.log("Redirecting to:", loginUrl);
    window.location.href = loginUrl;
  }, []);

  // Alternative using oauth2/authorize endpoint (more standard)
  const handleLoginAlt = useCallback(() => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      scope: "email openid phone",
      redirect_uri: REDIRECT_URI,
    });

    const loginUrl = `${COGNITO_DOMAIN}/oauth2/authorize?${params.toString()}`;
    
    console.log("Redirecting to (OAuth2):", loginUrl);
    window.location.href = loginUrl;
  }, []);

  // Logout function
  const handleLogout = useCallback(() => {
    setTokens(null);
    localStorage.removeItem("cognito_tokens");
    
    // Optional: Redirect to Cognito logout
    const logoutParams = new URLSearchParams({
      client_id: CLIENT_ID,
      logout_uri: window.location.origin,
    });
    
    const logoutUrl = `${COGNITO_DOMAIN}/logout?${logoutParams.toString()}`;
    window.location.href = logoutUrl;
  }, []);

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      {/* NAVBAR */}
      <nav className="w-full border-b border-white/10 backdrop-blur bg-black/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/logob.png"
              alt="Logo"
              width={70}
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-semibold">iBarangay</span>
          </div>

          <div className="hidden md:flex gap-8 text-sm text-gray-300">
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Services</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
          </div>

          {tokens ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-green-400">Authenticated</span>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Login | Signup
            </Button>
          )}
        </div>
      </nav>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-28 pb-60">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-600 to-purple-700 animate-gradient-slow blur-2xl opacity-100"> 
          <Image
              src="/barangay.jpg"
              alt="Barangay"
              width={800}
              height={380}
              className="justify center w-full h-full"
            />
        </div>

        <div className="relative text-center max-w-3xl mx-auto px-6">
          <div className="px-4 py-1 mx-auto mb-4 bg-white/10 rounded-full w-max text-xs text-blue-200">
            NEW • Introducing iBarangay System
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            The barangay is <br /> your service center.
          </h1>

          <p className="text-gray-300 mt-6 text-lg max-w-xl mx-auto">
            A smarter way to manage records, documents, incidents, and community services — all in one digital system.
          </p>

          {tokens && (
            <div className="mt-10">
              <a 
                href="/officials/dashboard"
                className="inline-block px-8 py-6 text-lg rounded-xl bg-green-600 hover:bg-green-700 transition-colors font-medium"
              >
                Go to Dashboard →
              </a>
            </div>
          )}
        </div>

        {/* FLOATING CARDS */}
        <div className="relative max-w-5xl mx-auto mt-24 px-6">
          {/* Resident Profile Card */}
          <Card className="absolute top-10 -left-6 w-48 bg-white/10 border-white/20 backdrop-blur-xl text-white shadow-lg">
            <CardContent className="p-4 text-sm">
              <p className="opacity-75 mb-1">Resident Profile</p>
              <p className="font-medium text-white">Mark Santos</p>
              <p className="text-xs mt-2 text-gray-300">Zone 3, Mabuhay St.</p>
            </CardContent>
          </Card>

          {/* Notification Card */}
          <Card className="absolute -bottom-30 right-109 w-52 bg-yellow-500/20 border-yellow-500/30 backdrop-blur-xl text-yellow-200 shadow-lg">
            <CardContent className="p-4 text-sm">
              <p className="font-medium">New Issue</p>
              <p className="text-xs mt-1">Filed 1 min ago</p>
            </CardContent>
          </Card>

          {/* Certificate Request Card */}
          <Card className="absolute top-12 -right-8 w-56 bg-white/10 border-white/20 backdrop-blur-xl text-white shadow-lg">
            <CardContent className="p-4 text-sm">
              <p className="font-medium">Barangay Certificate</p>
              <p className="text-xs text-gray-300 mt-1">Request submitted</p>
            </CardContent>
          </Card>

          <Card className="absolute bottom-10 -left-15 w-56 bg-white/10 border-white/20 backdrop-blur-xl text-white shadow-lg">
            <CardContent className="p-4 text-sm">
              <p className="font-medium">Barangay Certificate</p>
              <p className="text-xs text-gray-300 mt-1">Request denied</p>
            </CardContent>
          </Card>

          {/* Notification Card */}
          <Card className="absolute -bottom-6 right-12 w-52 bg-yellow-500/20 border-yellow-500/30 backdrop-blur-xl text-yellow-200 shadow-lg">
            <CardContent className="p-4 text-sm">
              <p className="font-medium">New Incident Report</p>
              <p className="text-xs mt-1">Filed 2 mins ago</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">Everything you need</h2>
            <p className="text-xl text-gray-400">All-in-one barangay management solution</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Resident Management',
                description: 'Track residents, families, and vulnerable sectors with QR codes',
                color: 'from-blue-600 to-blue-700'
              },
              {
                icon: Package,
                title: 'Property & Inventory',
                description: 'Manage equipment, borrowing, and maintenance records',
                color: 'from-green-600 to-green-700'
              },
              {
                icon: Shield,
                title: 'Peace & Order',
                description: 'Handle incidents, violations, and mediation cases',
                color: 'from-orange-600 to-orange-700'
              },
              {
                icon: FileText,
                title: 'Certificate System',
                description: 'Generate official documents and clearances instantly',
                color: 'from-purple-600 to-purple-700'
              },
              {
                icon: CheckCircle,
                title: 'Real-time Analytics',
                description: 'Track metrics and generate insightful reports',
                color: 'from-pink-600 to-pink-700'
              },
              {
                icon: Sparkles,
                title: 'Modern Interface',
                description: 'Clean, intuitive design for efficient operations',
                color: 'from-indigo-600 to-indigo-700'
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors group">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <p className="text-5xl md:text-6xl mb-3 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">10K+</p>
              <p className="text-gray-400">Residents Managed</p>
            </div>
            <div>
              <p className="text-5xl md:text-6xl mb-3 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">5K+</p>
              <p className="text-gray-400">Certificates Issued</p>
            </div>
            <div>
              <p className="text-5xl md:text-6xl mb-3 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">99.9%</p>
              <p className="text-gray-400">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="mb-4 text-sm text-gray-400">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-500 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-500 hover:text-white transition-colors">Modules</a></li>
                <li><a href="#" className="text-gray-500 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm text-gray-400">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-500 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-500 hover:text-white transition-colors">Guides</a></li>
                <li><a href="#" className="text-gray-500 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm text-gray-400">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-500 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-500 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-500 hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm text-gray-400">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-500 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-500 hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="text-gray-500 hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-15 h-15 bg-transparent rounded-lg flex items-center justify-center">
                  <Image
                src="/logob.png"
                alt="Logo"
                width={100}
                height={100}
                className="object-contain"
              />
              </div>
              <span className="text-gray-400">iBarangay</span>
            </div>
            <p className="text-sm text-gray-500">&copy; 2025 iBarangay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}