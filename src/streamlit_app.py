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
render_agent_aide()
