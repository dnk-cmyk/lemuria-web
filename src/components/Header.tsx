import React, { useState } from "react";
import { Sparkles, Shield, LogIn, LogOut, User, Menu, X, ExternalLink } from "lucide-react";

interface HeaderProps {
  currentUser: { email: string; name: string; avatar: string } | null;
  onLogin: (email: string, name: string) => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onScrollTo: (sectionId: string) => void;
  ecommerceUrl?: string;
}

export default function Header({
  currentUser,
  onLogin,
  onLogout,
  onOpenAdmin,
  onScrollTo,
  ecommerceUrl,
}: HeaderProps) {
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSimulatedLogin = (email: string, name: string) => {
    onLogin(email, name);
    setShowLoginMenu(false);
    setMobileMenuOpen(false);
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md text-slate-100">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo & Platform Name */}
        <div id="lemuria-logo-container" className="flex items-center gap-2 cursor-pointer" onClick={() => onScrollTo("hero")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="font-sans text-xl font-extrabold tracking-tight text-white">
              LEMURIA
            </span>
            <span className="ml-1 text-[10px] font-mono font-medium text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              Hub IA
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav id="desktop-nav" className="hidden md:flex items-center gap-8">
          <button
            id="nav-link-outils"
            onClick={() => onScrollTo("workspace")}
            className="font-sans text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors"
          >
            Outils IA
          </button>
          <button
            id="nav-link-boutique"
            onClick={() => onScrollTo("boutique")}
            className="font-sans text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors"
          >
            Boutique
          </button>
          <button
            id="nav-link-blog"
            onClick={() => onScrollTo("blog")}
            className="font-sans text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors"
          >
            Blog Tech
          </button>
          <button
            id="nav-link-promos"
            onClick={() => onScrollTo("boutique")}
            className="font-sans text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors"
          >
            Offres du Mois
          </button>
          <a
            id="nav-link-ecommerce"
            href={ecommerceUrl || "https://boutique.lemuria.mg"}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20"
          >
            <span>E-commerce</span>
            <ExternalLink className="h-3 w-3 inline" />
          </a>
        </nav>

        {/* Action Buttons (Admin & Google Login) */}
        <div id="header-actions" className="hidden md:flex items-center gap-3">
          {currentUser?.email === "admin@lemuria.mg" && (
            <button
              id="admin-dashboard-btn"
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 border border-slate-800 transition-all shadow-sm"
            >
              <Shield className="h-4 w-4 text-blue-400" />
              <span>📊 Dashboard Admin</span>
            </button>
          )}

          {currentUser ? (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowLoginMenu(!showLoginMenu)}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 p-1.5 pr-3 hover:bg-slate-850 transition-all"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-7 w-7 rounded-full object-cover border border-slate-750 shadow-sm"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-200 leading-tight">{currentUser.name}</p>
                  <p className="text-[9px] font-mono text-slate-450 leading-none">{currentUser.email}</p>
                </div>
              </button>

              {showLoginMenu && (
                <div id="user-dropdown-menu" className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-xl ring-1 ring-black/5 animate-fade-in z-50 text-slate-200">
                  <div className="px-3 py-2 border-b border-slate-850 mb-1">
                    <p className="text-xs text-slate-400">Connecté en tant que</p>
                    <p className="text-xs font-bold text-slate-350 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    id="dropdown-logout-btn"
                    onClick={() => {
                      onLogout();
                      setShowLoginMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <button
                id="login-trigger-btn"
                onClick={() => setShowLoginMenu(!showLoginMenu)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10"
              >
                <LogIn className="h-4 w-4" />
                <span>Connexion Google</span>
              </button>

              {showLoginMenu && (
                <div id="login-accounts-menu" className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-xl ring-1 ring-black/5 z-50 text-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider px-2">Simuler Google Sign-In</h4>
                  <div className="space-y-1.5">
                    <button
                      id="login-client-account-btn"
                      onClick={() => handleSimulatedLogin("princerakotondrasamba@gmail.com", "Prince Rakotondrasamba")}
                      className="flex w-full items-center gap-2 rounded-xl border border-slate-800 bg-slate-850 p-2 text-left hover:bg-slate-800 transition-colors"
                    >
                      <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="Avatar regular" className="h-8 w-8 rounded-full" />
                      <div>
                        <p className="text-xs font-bold text-slate-200">Prince R.</p>
                        <p className="text-[10px] font-mono text-slate-400">princerakotondrasamba@gmail.com</p>
                      </div>
                    </button>
                    <button
                      id="login-admin-account-btn"
                      onClick={() => handleSimulatedLogin("admin@lemuria.mg", "Masoivoho Lemuria")}
                      className="flex w-full items-center gap-2 rounded-xl border border-blue-900/30 bg-blue-950/40 p-2 text-left hover:bg-blue-950/70 transition-colors"
                    >
                      <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80" alt="Avatar admin" className="h-8 w-8 rounded-full border border-blue-550" />
                      <div>
                        <p className="text-xs font-bold text-blue-300 flex items-center gap-1">
                          Admin Lemuria <Shield className="h-3 w-3 text-blue-400 inline" />
                        </p>
                        <p className="text-[10px] font-mono text-blue-400 font-semibold">admin@lemuria.mg</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden gap-2">
          {currentUser?.email === "admin@lemuria.mg" && (
            <button
              id="mobile-admin-btn"
              onClick={onOpenAdmin}
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all border border-slate-800 shadow-sm"
              title="Dashboard Admin"
            >
              <Shield className="h-4 w-4 text-blue-400" />
            </button>
          )}
          <button
            id="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-1.5 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 space-y-3 shadow-lg text-slate-100">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                onScrollTo("workspace");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left font-sans text-sm font-semibold text-slate-300 py-2 hover:text-blue-400"
            >
              Outils IA
            </button>
            <button
              onClick={() => {
                onScrollTo("boutique");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left font-sans text-sm font-semibold text-slate-300 py-2 hover:text-blue-400"
            >
              Boutique
            </button>
            <button
              onClick={() => {
                onScrollTo("blog");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left font-sans text-sm font-semibold text-slate-300 py-2 hover:text-blue-400"
            >
              Blog Tech
            </button>
            <button
              onClick={() => {
                onScrollTo("boutique");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left font-sans text-sm font-semibold text-slate-300 py-2 hover:text-blue-400"
            >
              Offres du Mois
            </button>
            <a
              id="mobile-nav-link-ecommerce"
              href={ecommerceUrl || "https://boutique.lemuria.mg"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left font-sans text-sm font-bold text-blue-400 py-2 flex items-center gap-1.5"
            >
              <span>E-commerce</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="pt-4 border-t border-slate-800">
            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <img src={currentUser.avatar} alt="Profile" className="h-9 w-9 rounded-full object-cover border border-slate-800" />
                  <div>
                    <p className="text-xs font-bold text-slate-200">{currentUser.name}</p>
                    <p className="text-[10px] font-mono text-slate-450">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  id="mobile-logout-btn"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2 text-sm font-bold text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Se connecter via Google</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSimulatedLogin("princerakotondrasamba@gmail.com", "Prince Rakotondrasamba")}
                    className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-200">Prince R.</span>
                    <span className="text-[8px] font-mono text-slate-400">Client Mada</span>
                  </button>
                  <button
                    onClick={() => handleSimulatedLogin("admin@lemuria.mg", "Masoivoho Lemuria")}
                    className="flex flex-col items-center justify-center p-2 rounded-xl border border-blue-900 bg-blue-950/40 hover:bg-blue-950/60 transition-colors"
                  >
                    <span className="text-xs font-bold text-blue-300">Admin</span>
                    <span className="text-[8px] font-mono text-blue-400">admin@lemuria.mg</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
