import React from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, ShieldCheck, Cpu, MessageSquare, CheckCircle2, ArrowRight, Link2, MapPin, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

// New Decorative Components
import ElectricBackground from '../components/ElectricBackground';
import ElectricParticles from '../components/ElectricParticles';
import WorkflowEnergyLine from '../components/WorkflowEnergyLine';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-white">
        <ElectricBackground variant="hero" />
        <ElectricParticles />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-blue-800 text-xs font-bold mb-6 badge-dual-glow badge-dual-border">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-gray-600 font-semibold">Anurag University's Official Lost & Found Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            Lost something on campus? <br className="hidden sm:inline" />
            <span className="gradient-text-hero relative">
              Search. Verify. Connect. Recover.
              {/* Very subtle text glow behind */}
              <span className="absolute inset-0 gradient-text-hero blur-xl opacity-30" aria-hidden="true">
                Search. Verify. Connect. Recover.
              </span>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 font-normal leading-relaxed relative z-10">
            LostLink securely connects Anurag University students with items they have lost or found. No spam. No leaked phone numbers. Pure intelligent returns.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16 relative z-10">
            <Link
              to={isAuthenticated ? "/search" : "/login"}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl gradient-cta-primary text-white font-bold text-base electric-glow-dual flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 group"
            >
              <Search className="w-5 h-5 stroke-[2.5]" />
              Find My Item
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to={isAuthenticated ? "/report-found" : "/login"}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-base border border-blue-200 electric-glow-blue flex items-center justify-center gap-2.5 transition-all"
            >
              <PlusCircle className="w-5 h-5 text-blue-600 stroke-[2.5]" />
              Report Found Item
            </Link>
          </div>

          {/* Trust Indicators Grid */}
          <div className="relative z-10">
            <ElectricBackground variant="features" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 relative z-10">
              <div className="p-4 rounded-2xl feature-card-electric flex flex-col items-center">
                <span className="text-2xl mb-1 relative inline-block">
                  🎓
                  <div className="absolute inset-0 bg-blue-400 blur-xl opacity-30 mix-blend-screen rounded-full -z-10"></div>
                </span>
                <span className="text-sm font-bold text-gray-900">University Only</span>
                <span className="text-xs text-gray-500">@anurag.edu.in accounts</span>
              </div>
              <div className="p-4 rounded-2xl feature-card-electric flex flex-col items-center">
                <span className="text-2xl mb-1 relative inline-block">
                  🔐
                  <div className="absolute inset-0 bg-coral-400 blur-xl opacity-30 mix-blend-screen rounded-full -z-10" style={{ backgroundColor: '#fb7185' }}></div>
                </span>
                <span className="text-sm font-bold text-gray-900">Secure Verification</span>
                <span className="text-xs text-gray-500">Secret answer checks</span>
              </div>
              <div className="p-4 rounded-2xl feature-card-electric flex flex-col items-center">
                <span className="text-2xl mb-1 relative inline-block">
                  🤖
                  <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-30 mix-blend-screen rounded-full -z-10"></div>
                </span>
                <span className="text-sm font-bold text-gray-900">Smart Matching</span>
                <span className="text-xs text-gray-500">Instant % similarity</span>
              </div>
              <div className="p-4 rounded-2xl feature-card-electric flex flex-col items-center">
                <span className="text-2xl mb-1 relative inline-block">
                  💬
                  <div className="absolute inset-0 blur-xl opacity-30 mix-blend-screen rounded-full -z-10" style={{ backgroundColor: '#f43f5e' }}></div>
                </span>
                <span className="text-sm font-bold text-gray-900">Private Chat</span>
                <span className="text-xs text-gray-500">Verification gated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white relative overflow-hidden">
        <ElectricBackground variant="workflow" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 relative">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Workflow</h2>
            <p className="text-3xl font-extrabold text-gray-900">How LostLink Works</p>
            <p className="text-gray-600 mt-2">A simple 5-step lifecycle designed for Anurag University students.</p>
          </div>

          <div className="relative">
            <WorkflowEnergyLine />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl workflow-card-electric flex flex-col items-center text-center relative group">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-black text-lg flex items-center justify-center mb-4 badge-glow-blue transition-all duration-300">
                  1
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">Search</h3>
                <p className="text-xs text-gray-500">Search active found posts by brand, category, and campus location.</p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl workflow-card-electric flex flex-col items-center text-center relative group">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-black text-lg flex items-center justify-center mb-4 badge-glow-blue transition-all duration-300">
                  2
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">Match</h3>
                <p className="text-xs text-gray-500">Smart engine scores item similarity (e.g. 92% HIGH MATCH).</p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl workflow-card-electric flex flex-col items-center text-center relative group">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-black text-lg flex items-center justify-center mb-4 badge-glow-blue transition-all duration-300">
                  3
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">Verify</h3>
                <p className="text-xs text-gray-500">Answer private verification questions set by the finder.</p>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-2xl workflow-card-electric flex flex-col items-center text-center relative group">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-black text-lg flex items-center justify-center mb-4 badge-glow-blue transition-all duration-300">
                  4
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">Connect</h3>
                <p className="text-xs text-gray-500">Once verified, 1-on-1 private chat unlocks automatically.</p>
              </div>

              {/* Step 5 - Recover (Coral Accent) */}
              <div className="p-6 rounded-2xl workflow-card-recover flex flex-col items-center text-center relative group">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 font-black text-lg flex items-center justify-center mb-4 badge-glow-coral transition-all duration-300">
                  5
                </div>
                <h3 className="text-base font-bold text-rose-900 mb-1 group-hover:text-rose-600 transition-colors">Recover</h3>
                <p className="text-xs text-gray-600">Meet safely on campus, return item, and mark DELIVERED.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why LostLink Section */}
      <section id="why-lostlink" className="py-20 bg-gray-50 relative overflow-hidden">
        <ElectricBackground variant="why" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest relative z-10">The Problem We Solve</span>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-2 mb-6 relative z-10">
                No more buried WhatsApp messages or fake claimers.
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 relative z-10">
                College WhatsApp groups get flooded with lost item notices that get buried in minutes. Finders receive messages from random people claiming items without proof.
              </p>
              
              <ul className="space-y-3 relative z-10">
                <li className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Zero Public Contact Leakage:</strong> Phone numbers are never published.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Secret Ownership Checks:</strong> Claimants must know details only the owner knows.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Automated Missing Watcher:</strong> Notifies you the moment a matching item is posted.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl demo-card-electric relative">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold badge-glow-blue">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900">Black Noise Smartwatch</h4>
                  <p className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-rose-500">92% HIGH MATCH</p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 text-xs font-semibold text-emerald-900 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Ownership Verified: Secret Answer matched ("Batman wallpaper")</span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-xs text-gray-600 space-y-2">
                <div className="flex justify-start">
                  <span className="bg-white border px-3 py-2 rounded-xl text-gray-800 font-medium shadow-sm">Hi! I lost this watch in Central Library.</span>
                </div>
                <div className="flex justify-end">
                  <span className="bg-blue-600 text-white px-3 py-2 rounded-xl font-medium shadow-sm">Ownership verified! Let's meet at Library entrance.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
