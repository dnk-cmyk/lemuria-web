import streamlit as st
import requests
 
from components.header import render_header
from components.carousel import render_carousel
from components.workspace import render_workspace
from components.boutique_prompts import render_boutique_prompts
from components.admin_dashboard import render_admin_dashboard
from components.agent_aide import render_agent_aide
 
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
# HANDLERS RESTANTS
# ============================================================
def open_admin():
    """Équivalent de onOpenAdmin={() => setShowAdmin(true)}"""
    st.session_state.show_admin = True
 
 
def close_admin():
    """Équivalent de onClose={() => setShowAdmin(false)}"""
    st.session_state.show_admin = False
 
 
def render_blog_ia(articles):
    """TODO: remplacer par la conversion réelle de components/BlogIA.tsx — dernier composant manquant."""
    st.warning("⚠️ BlogIA : en attente du code source de components/BlogIA.tsx")
 
 
def render_agent_aide():
    """TODO: remplacer par la conversion réelle de components/AgentAide.tsx"""
    pass  # widget flottant, à faire une fois le code reçu
 
 
# ============================================================
# HEADER
# ============================================================
render_header(
    st.session_state.current_user,
    handle_login,
    handle_logout,
    open_admin,
    settings.get("ecommerceUrl"),
)
 
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
 
    st.markdown(
        """
        <div style="display:flex; gap:16px; margin: 8px 0 24px 0; flex-wrap:wrap;">
            <a href="#workspace" style="display:inline-flex; align-items:center; gap:8px;
               border-radius:12px; background:#2563eb; padding:12px 24px; font-size:14px;
               font-weight:800; color:white; text-decoration:none; box-shadow:0 10px 15px -3px rgba(59,130,246,0.20);">
                🚀 Lancer un Storyboard →
            </a>
            <a href="#boutique" style="display:inline-flex; align-items:center;
               border-radius:12px; border:1px solid #1e293b; background:#0f172a; padding:12px 24px;
               font-size:14px; font-weight:800; color:#cbd5e1; text-decoration:none;">
                Boutique de Prompts
            </a>
        </div>
        """,
        unsafe_allow_html=True,
    )
 
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
render_carousel(settings.get("carousel", []), lambda pid: track_event("affiliate_click", pid))
 
# ============================================================
# SECTION 3 : WORKSPACE interactif (moteurs Gemini vision)
# ============================================================
default_partners = {"google_flow": True, "pikverse": True, "midjourney_flux": True}
render_workspace(
    st.session_state.current_user,
    settings.get("partners", default_partners),
    track_event,
)
 
# ============================================================
# SECTION 4 : BOUTIQUE DE PROMPTS & promo du mois
# ============================================================
render_boutique_prompts(
    settings.get("promoCode", "LEMURIA2026"),
    settings.get("promoDiscount", "-50% & Accès VIP"),
    lambda pid: track_event("boutique_click", pid),
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
    render_admin_dashboard(close_admin, fetch_settings)
 
# ============================================================
# AGENT AIDE (assistant flottant)
# ============================================================
render_agent_aide()
