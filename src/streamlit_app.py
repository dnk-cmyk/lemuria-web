import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Carousel from "./components/Carousel";
import Workspace from "./components/Workspace";
import BoutiquePrompts from "./components/BoutiquePrompts";
import BlogIA from "./components/BlogIA";
import AdminDashboard from "./components/AdminDashboard";
import AgentAide from "./components/AgentAide";
import { AdminSettings } from "./types";
import { Sparkles, ArrowRight, ShieldAlert, Zap, Globe, Layers } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; avatar: string } | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  // Fetch settings dynamically from the Express backend
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLogin = (email: string, name: string) => {
    const avatar = email === "admin@lemuria.mg" 
      ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"
      : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80";
    
    setCurrentUser({ email, name, avatar });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowAdmin(false);
  };

  // Log user tracking events quietly to the backend logger
  const trackEvent = async (eventType: string, partnerId: string) => {
    try {
      await fetch("/api/analytics/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: eventType,
          partner_id: partnerId,
          user_id: currentUser?.email || "anon_mada"
        })
      });
    } catch (error) {
      console.warn("Telemetry log failed:", error);
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    if (sectionId === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div id="lemuria-root" className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-200">
      
      {/* Header component */}
      <Header 
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenAdmin={() => setShowAdmin(true)}
        onScrollTo={handleScrollToSection}
        ecommerceUrl={settings?.ecommerceUrl}
      />

      {/* Main Container */}
      <main className="flex-grow">
        
        {/* Section 1: Hero Banner */}
        <section id="hero" className="relative py-12 sm:py-20 overflow-hidden bg-slate-950/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Hero Text Content (7 Columns) */}
              <div className="lg:col-span-7 space-y-6 text-left">
                
                {/* Micro badge */}
                <div id="hero-badge" className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
                  <Zap className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
                  "<span>Hub Central d'IA gratuit à Madagascar</span>"
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                  LEMURIA : Le Hub IA de Madagascar.
                </h1>

                <p className="text-base sm:text-lg text-slate-400 font-medium max-w-xl leading-relaxed">
                  Générez vos storyboards, transformez vos images en prompts exploitables et accédez aux meilleures IA partenaires en un seul endroit. Conçu pour propulser les créateurs, indépendants et entrepreneurs locaux.
                </p>

                {/* Call to action buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    id="hero-cta-workspace"
                    onClick={() => handleScrollToSection("workspace")}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <span>Lancer un Storyboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    id="hero-cta-boutique"
                    onClick={() => handleScrollToSection("boutique")}
                    className="rounded-xl border border-slate-850 bg-slate-900 px-6 py-3 text-sm font-extrabold text-slate-300 hover:bg-slate-850 transition-colors"
                  >
                    Boutique de Prompts
                  </button>
                </div>

                {/* Local Mada feature points */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-900">
                  <div>
                    <span className="text-xs font-bold text-slate-500 block uppercase font-mono">Inférence</span>
                    <span className="text-sm font-extrabold text-slate-300">100% Gratuite</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 block uppercase font-mono">Modèle</span>
                    <span className="text-sm font-extrabold text-slate-300">Gemini 3.5 Flash</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 block uppercase font-mono">Communauté</span>
                    <span className="text-sm font-extrabold text-slate-300">Madagascar IA</span>
                  </div>
                </div>

              </div>

              {/* Hero Graphic Card (5 Columns) */}
              <div className="lg:col-span-5 flex justify-center">
                <div id="hero-feature-illustration-card" className="relative h-72 w-72 sm:h-96 sm:w-96 rounded-3xl bg-gradient-to-tr from-slate-900 to-slate-950 p-6 flex flex-col justify-between text-white shadow-2xl border border-slate-800/80 overflow-hidden group">
                  {/* Decorative mesh */}
                  <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all duration-700" />
                  <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all duration-700" />

                  {/* Header info */}
                  <div className="flex justify-between items-start relative z-10">
                    <span className="flex items-center gap-1.5 text-[10px] font-mono bg-white/10 px-2.5 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      SYSTEM STATUS ONLINE
                    </span>
                    <Layers className="h-5 w-5 text-blue-400" />
                  </div>

                  {/* Central design */}
                  <div className="space-y-3 relative z-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">Optimisation Multi-Modèle</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      L'intelligence de Lemuria traduit vos concepts d'images en découpages scéniques pour Google Flow Beta et PikverseAI en quelques secondes.
                    </p>
                  </div>

                  {/* Attribution card footer */}
                  <div className="border-t border-white/5 pt-3 text-left relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">PROMPT ROUTER MADA v2.4</span>
                    <Globe className="h-4 w-4 text-slate-600" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 2: Carousel of Madagascar social networks */}
        <Carousel 
          carouselItems={settings?.carousel || []} 
          onTrackClick={(id) => trackEvent("affiliate_click", id)}
        />

        {/* Section 3: Espace de travail interactif (Workspace with Gemini vision engines) */}
        <Workspace 
          currentUser={currentUser} 
          activePartners={settings?.partners || { google_flow: true, pikverse: true, midjourney_flux: true }}
          onTrackEvent={trackEvent}
        />

        {/* Section 4: Boutique de Prompts & Promotion du mois */}
        <div id="boutique">
          <BoutiquePrompts 
            promoCode={settings?.promoCode || "LEMURIA2026"}
            promoDiscount={settings?.promoDiscount || "-50% & Accès VIP"}
            onTrackClick={(partnerId) => trackEvent("boutique_click", partnerId)}
          />
        </div>

        {/* Section 5: Blog d'Actualité IA & Tech */}
        <div id="blog">
          <BlogIA 
            articles={settings?.blogArticles || []}
            onTrackClick={(articleId) => trackEvent("blog_click", articleId)}
          />
        </div>

      </main>

      {/* Footer Section */}
      <footer id="main-footer" className="bg-slate-950 text-slate-450 py-10 border-t border-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left space-y-6 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span className="font-sans text-base font-extrabold tracking-tight text-white">
                LEMURIA
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Plateforme d'IA centralisée, épurée et gratuite, conçue comme le hub de référence pour les créateurs de Madagascar.
            </p>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <p className="text-xs">
              Hub IA Lemuria © 2026. Tous droits réservés. Service 100% Gratuit.
            </p>
            <p className="text-[10px] font-mono text-slate-600">
              Masoivoho Lemuria • Tananarive, Madagascar
            </p>
          </div>

        </div>
      </footer>

      {/* Overlay Admin Dashboard */}
      {showAdmin && (
        <AdminDashboard 
          onClose={() => setShowAdmin(false)}
          onSettingsChange={fetchSettings}
        />
      )}

      {/* Active Agent Chibi Assistant */}
      <AgentAide />

    </div>
  );
}
