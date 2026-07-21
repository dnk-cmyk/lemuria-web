"""
LEMURIA — Le Hub IA de Madagascar
Conversion Streamlit de App.tsx (React)

STRUCTURE:
  - App.tsx (ce fichier) -> streamlit_app.py
  - components/Header.tsx -> components/header.py       (EN ATTENTE du code source)
  - components/Carousel.tsx -> components/carousel.py    (EN ATTENTE du code source)
  - components/Workspace.tsx -> components/workspace.py  (EN ATTENTE du code source)
  - components/BoutiquePrompts.tsx -> components/boutique_prompts.py  (EN ATTENTE)
  - components/BlogIA.tsx -> components/blog_ia.py       (EN ATTENTE)
  - components/AdminDashboard.tsx -> components/admin_dashboard.py   (EN ATTENTE)
  - components/AgentAide.tsx -> components/agent_aide.py (EN ATTENTE)
  - types.ts -> types.py (EN ATTENTE)

Envoyez-moi chaque composant listé "EN ATTENTE" pour que je le convertisse
et le branche ici (les fonctions stub ci-dessous sont prêtes à être remplacées).
"""

import streamlit as st
import requests

# ============================================================
# CONFIGURATION DE LA PAGE (équivalent des balises <head>/meta)
# ============================================================
st.set_page_config(
    page_title="LEMURIA — Hub IA de Madagascar",
    page_icon="✨",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# URL du backend Express existant. À adapter selon où il tourne réellement
# (localhost en dev, ou l'URL publique en prod). Si vous préférez que toute
# la logique backend passe aussi en Python, dites-le-moi et on la réécrit ici.
API_BASE = "http://localhost:5000"


# ============================================================
# THEME / CSS — reproduit l'esthétique Tailwind sombre de l'original
# (bg #030712, accents bleus, cards slate-900/950)
# ============================================================
st.markdown(
    """
    <style>
    .stApp {
        background-color: #030712;
        color: #f1f5f9;
    }
    #MainMenu, footer, header {visibility: hidden;}

    .lemuria-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border-radius: 9999px;
        background: rgba(59,130,246,0.10);
        padding: 4px 12px;
        font-size: 12px;
        font-weight: 700;
        color: #60a5fa;
        border: 1px solid rgba(59,130,246,0.20);
    }
    .lemuria-hero-title {
        font-size: 44px;
        font-weight: 900;
        color: white;
        line-height: 1.05;
        letter-spacing: -0.02em;
        margin: 16px 0;
    }
    .lemuria-hero-text {
        font-size: 17px;
        color: #94a3b8;
        font-weight: 500;
        max-width: 640px;
        line-height: 1.6;
    }
    .lemuria-stat-label {
        font-size: 11px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        font-family: monospace;
        display: block;
    }
    .lemuria-stat-value {
        font-size: 14px;
        font-weight: 800;
        color: #cbd5e1;
    }
    .lemuria-card {
        position: relative;
        border-radius: 24px;
        background: linear-gradient(to top right, #0f172a, #020617);
        padding: 24px;
        border: 1px solid rgba(30,41,59,0.8);
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        height: 380px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .lemuria-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 10px;
        font-family: monospace;
        background: rgba(255,255,255,0.10);
        padding: 2px 10px;
        border-radius: 9999px;
    }
    .lemuria-footer {
        background: #030712;
        color: #94a3b8;
        padding: 40px 0;
        border-top: 1px solid #0f172a;
        text-align: center;
        margin-top: 60px;
    }
    div.stButton > button {
        border-radius: 12px;
        font-weight: 800;
        font-size: 14px;
        padding: 10px 24px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


# ============================================================
# ÉTAT DE SESSION — équivalent des useState React
# ============================================================
if "current_user" not in st.session_state:
    st.session_state.current_user = None  # {"email":..., "name":..., "avatar":...}
if "settings" not in st.session_state:
    st.session_state.settings = None
if "show_admin" not in st.session_state:
    st.session_state.show_admin = False


# ============================================================
# HANDLERS — équivalents des fonctions dans App.tsx
# ============================================================
def fetch_settings():
    """Équivalent de fetchSettings() / useEffect au montage."""
    try:
        res = requests.get(f"{API_BASE}/api/admin/settings", timeout=5)
        if res.ok:
            st.session_state.settings = res.json()
    except Exception as e:
        print(f"Error fetching settings: {e}")  # équivalent console.error


def handle_login(email: str, name: str):
    """Équivalent de handleLogin()."""
    avatar = (
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"
        if email == "admin@lemuria.mg"
        else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
    )
    st.session_state.current_user = {"email": email, "name": name, "avatar": avatar}


def handle_logout():
    """Équivalent de handleLogout()."""
    st.session_state.current_user = None
    st.session_state.show_admin = False


def track_event(event_type: str, partner_id: str):
    """Équivalent de trackEvent() — log silencieux vers le backend."""
    try:
        requests.post(
            f"{API_BASE}/api/analytics/log",
            json={
                "event_type": event_type,
                "partner_id": partner_id,
                "user_id": st.session_state.current_user["email"]
                if st.session_state.current_user
                else "anon_mada",
            },
            timeout=5,
        )
    except Exception as e:
        print(f"Telemetry log failed: {e}")  # équivalent console.warn


# Chargement initial des settings (équivalent du useEffect au montage)
if st.session_state.settings is None:
    fetch_settings()

settings = st.session_state.settings or {}


# ============================================================
# STUBS DES COMPOSANTS — à remplacer une fois le code source reçu
# ============================================================
def render_header():
    """TODO: remplacer par la conversion réelle de components/Header.tsx"""
    st.warning("⚠️ Header : en attente du code source de components/Header.tsx")


def render_carousel(carousel_items):
    """TODO: remplacer par la conversion réelle de components/Carousel.tsx"""
    st.warning("⚠️ Carousel : en attente du code source de components/Carousel.tsx")


def render_workspace(current_user, active_partners):
    """TODO: remplacer par la conversion réelle de components/Workspace.tsx"""
    st.warning("⚠️ Workspace : en attente du code source de components/Workspace.tsx")


def render_boutique_prompts(promo_code, promo_discount):
    """TODO: remplacer par la conversion réelle de components/BoutiquePrompts.tsx"""
    st.warning("⚠️ BoutiquePrompts : en attente du code source de components/BoutiquePrompts.tsx")


def render_blog_ia(articles):
    """TODO: remplacer par la conversion réelle de components/BlogIA.tsx"""
    st.warning("⚠️ BlogIA : en attente du code source de components/BlogIA.tsx")


def render_admin_dashboard():
    """TODO: remplacer par la conversion réelle de components/AdminDashboard.tsx"""
    st.warning("⚠️ AdminDashboard : en attente du code source de components/AdminDashboard.tsx")
    if st.button("Fermer l'admin", key="close_admin"):
        st.session_state.show_admin = False
        st.rerun()


def render_agent_aide():
    """TODO: remplacer par la conversion réelle de components/AgentAide.tsx"""
    pass  # widget flottant, à faire une fois le code reçu


# ============================================================
# HEADER
# ============================================================
render_header()

# ============================================================
# SECTION 1 : HERO
# ============================================================
st.markdown('<div id="hero"></div>', unsafe_allow_html=True)

hero_col1, hero_col2 = st.columns([7, 5], gap="large")

with hero_col1:
    st.markdown(
        """
        <div class="lemuria-badge">⚡ Hub Central d'IA gratuit à Madagascar</div>
        <div class="lemuria-hero-title">LEMURIA : Le Hub IA de Madagascar.</div>
        <p class="lemuria-hero-text">
            Générez vos storyboards, transformez vos images en prompts exploitables et accédez
            aux meilleures IA partenaires en un seul endroit. Conçu pour propulser les créateurs,
            indépendants et entrepreneurs locaux.
        </p>
        """,
        unsafe_allow_html=True,
    )

    cta_col1, cta_col2 = st.columns([1, 1])
    with cta_col1:
        if st.button("🚀 Lancer un Storyboard", key="hero_cta_workspace", type="primary"):
            st.session_state.scroll_target = "workspace"
    with cta_col2:
        if st.button("Boutique de Prompts", key="hero_cta_boutique"):
            st.session_state.scroll_target = "boutique"

    st.markdown("<hr style='border-color:#0f172a; margin-top:24px;'>", unsafe_allow_html=True)
    stat_col1, stat_col2, stat_col3 = st.columns(3)
    with stat_col1:
        st.markdown(
            '<span class="lemuria-stat-label">Inférence</span>'
            '<span class="lemuria-stat-value">100% Gratuite</span>',
            unsafe_allow_html=True,
        )
    with stat_col2:
        st.markdown(
            '<span class="lemuria-stat-label">Modèle</span>'
            '<span class="lemuria-stat-value">Gemini 3.5 Flash</span>',
            unsafe_allow_html=True,
        )
    with stat_col3:
        st.markdown(
            '<span class="lemuria-stat-label">Communauté</span>'
            '<span class="lemuria-stat-value">Madagascar IA</span>',
            unsafe_allow_html=True,
        )

with hero_col2:
    st.markdown(
        """
        <div class="lemuria-card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <span class="lemuria-status-pill">🟢 SYSTEM STATUS ONLINE</span>
                <span style="color:#60a5fa;">▤</span>
            </div>
            <div>
                <div style="height:48px; width:48px; border-radius:12px; background:rgba(59,130,246,0.20);
                            color:#60a5fa; border:1px solid rgba(59,130,246,0.30); display:flex;
                            align-items:center; justify-content:center; font-size:22px; margin-bottom:12px;">✨</div>
                <h3 style="font-size:20px; font-weight:700; color:white; margin:0 0 8px 0;">
                    Optimisation Multi-Modèle
                </h3>
                <p style="font-size:12px; color:#94a3b8; line-height:1.6;">
                    L'intelligence de Lemuria traduit vos concepts d'images en découpages scéniques
                    pour Google Flow Beta et PikverseAI en quelques secondes.
                </p>
            </div>
            <div style="border-top:1px solid rgba(255,255,255,0.05); padding-top:12px;
                        display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:10px; font-family:monospace; color:#64748b;">PROMPT ROUTER MADA v2.4</span>
                <span style="color:#475569;">🌐</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

# ============================================================
# SECTION 2 : CAROUSEL des réseaux sociaux malgaches
# ============================================================
render_carousel(settings.get("carousel", []))

# ============================================================
# SECTION 3 : WORKSPACE interactif (moteurs Gemini vision)
# ============================================================
default_partners = {"google_flow": True, "pikverse": True, "midjourney_flux": True}
render_workspace(
    st.session_state.current_user,
    settings.get("partners", default_partners),
)

# ============================================================
# SECTION 4 : BOUTIQUE DE PROMPTS & promo du mois
# ============================================================
st.markdown('<div id="boutique"></div>', unsafe_allow_html=True)
render_boutique_prompts(
    settings.get("promoCode", "LEMURIA2026"),
    settings.get("promoDiscount", "-50% & Accès VIP"),
)

# ============================================================
# SECTION 5 : BLOG D'ACTUALITÉ IA & TECH
# ============================================================
st.markdown('<div id="blog"></div>', unsafe_allow_html=True)
render_blog_ia(settings.get("blogArticles", []))

# ============================================================
# FOOTER
# ============================================================
st.markdown(
    """
    <div class="lemuria-footer">
        <div style="font-size:18px; font-weight:800; color:white;">✨ LEMURIA</div>
        <p style="font-size:12px; color:#64748b; max-width:400px; margin:8px auto;">
            Plateforme d'IA centralisée, épurée et gratuite, conçue comme le hub de référence
            pour les créateurs de Madagascar.
        </p>
        <p style="font-size:12px;">Hub IA Lemuria © 2026. Tous droits réservés. Service 100% Gratuit.</p>
        <p style="font-size:10px; font-family:monospace; color:#475569;">
            Masoivoho Lemuria • Tananarive, Madagascar
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

# ============================================================
# ADMIN DASHBOARD (rendu conditionnel, équivalent {showAdmin && <AdminDashboard/>})
# ============================================================
if st.session_state.show_admin:
    st.divider()
    render_admin_dashboard()

# ============================================================
# AGENT AIDE (assistant flottant)
# ============================================================
render_agent_aide()      : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80";
    
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
      
      { "Header component" }
      <Header 
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenAdmin={() => setShowAdmin(true)}
        onScrollTo={handleScrollToSection}
        ecommerceUrl={settings?.ecommerceUrl}
      />

      { "Main Container" }
      <main className="flex-grow">
        
        { "Section 1: Hero Banner" }
        <section id="hero" className="relative py-12 sm:py-20 overflow-hidden bg-slate-950/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {" Hero Text Content" ("7 Columns") }
              <div className="lg:col-span-7 space-y-6 text-left">
                
                {"Micro badge" }
                <div id="hero-badge" className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
                  <Zap className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
                  "<span>Hub Central d'IA gratuit à Madagascar</span>"
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                  LEMURIA : Le Hub IA de Madagascar.
                </h1>

                <p className="text-base sm:text-lg text-slate-400 font-medium max-w-xl leading-relaxed">
                  "Générez vos storyboards, transformez vos images en prompts exploitables et accédez aux meilleures IA partenaires en un seul endroit. Conçu pour propulser les créateurs, indépendants et entrepreneurs locaux."
                </p>

                { "Call to action buttons" }
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

                { "Local Mada feature points" }
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

              { "Hero Graphic Card" ("5 Columns") }
              <div className="lg:col-span-5 flex justify-center">
                <div id="hero-feature-illustration-card" className="relative h-72 w-72 sm:h-96 sm:w-96 rounded-3xl bg-gradient-to-tr from-slate-900 to-slate-950 p-6 flex flex-col justify-between text-white shadow-2xl border border-slate-800/80 overflow-hidden group">
                  { Decorative mesh }
                  <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all duration-700" />
                  <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all duration-700" />

                  { "Header info" }
                  <div className="flex justify-between items-start relative z-10">
                    <span className="flex items-center gap-1.5 text-[10px] font-mono bg-white/10 px-2.5 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      SYSTEM STATUS ONLINE
                    </span>
                    <Layers className="h-5 w-5 text-blue-400" />
                  </div>

                  { "Central design" }
                  <div className="space-y-3 relative z-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">Optimisation Multi-Modèle</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      "L'intelligence de Lemuria traduit vos concepts d'images en découpages scéniques pour Google Flow Beta et PikverseAI en quelques secondes."
                    </p>
                  </div>

                  { "Attribution card footer" }
                  <div className="border-t border-white/5 pt-3 text-left relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">PROMPT ROUTER MADA v2.4</span>
                    <Globe className="h-4 w-4 text-slate-600" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        { "Section 2": "Carousel of Madagascar social networks" }
        <Carousel 
          carouselItems={settings?.carousel || []} 
          onTrackClick={(id) => trackEvent("affiliate_click", id)}
        />

        { "Section 3": "Espace de travail interactif (Workspace with Gemini vision engine" }
        <Workspace 
          currentUser={currentUser} 
          activePartners={settings?.partners || { google_flow: true, pikverse: true, midjourney_flux: true }}
          onTrackEvent={trackEvent}
        />

        { "Section 4": "Boutique de Prompts & Promotion du mois" }
        <div id="boutique">
          <BoutiquePrompts 
            promoCode={settings?.promoCode || "LEMURIA2026"}
            promoDiscount={settings?.promoDiscount || "-50% & Accès VIP"}
            onTrackClick={(partnerId) => trackEvent("boutique_click", partnerId)}
          />
        </div>

        { "Section 5": "Blog d'Actualité IA & Tech" }
        <div id="blog">
          <BlogIA 
            articles={settings?.blogArticles || []}
            onTrackClick={(articleId) => trackEvent("blog_click", articleId)}
          />
        </div>

      </main>

      { "Footer Section" }
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
              "Plateforme d'IA centralisée, épurée et gratuite, conçue comme le hub de référence pour les créateurs de Madagascar."
            </p>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <p className="text-xs">
              "Hub IA Lemuria © 2026. Tous droits réservés. Service 100% Gratuit."
            </p>
            <p className="text-[10px] font-mono text-slate-600">
              "Masoivoho Lemuria • Tananarive, Madagascar"
            </p>
          </div>

        </div>
      </footer>

      { "Overlay Admin Dashboard" }
      {showAdmin && (
        <AdminDashboard 
          onClose={() => setShowAdmin(false)}
          onSettingsChange={fetchSettings}
        />
      )}

      { "Active Agent Chibi Assistant" }
      <AgentAide />

    </div>
  );
}
