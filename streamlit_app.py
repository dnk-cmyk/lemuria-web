import streamlit as st
from google import genai
from google.genai import types
from PIL import Image
import os

# --- 1. CONFIGURATION DE LA PAGE & STYLE (Bleu, Blanc, Noir) ---
st.set_page_config(
    page_title="Lemuria - Studio Mode & Top Model",
    page_icon="🚀",
    layout="wide"
)

# Style CSS Épuré & Minimaliste
st.markdown("""
<style>
    .stApp { background-color: #FFFFFF; color: #0F172A; }
    h1, h2, h3 { color: #0F172A; font-family: 'Inter', sans-serif; }
    
    .stButton>button {
        background-color: #0052FF !important;
        color: white !important;
        border-radius: 8px !important;
        border: none !important;
        font-weight: 600 !important;
    }
    
    .card {
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 16px;
        background-color: #F8F9FA;
        margin-bottom: 12px;
    }
    .badge-promo {
        background-color: #0052FF;
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

# --- 2. SECRETS & CONNEXION GOOGLE AI STUDIO ---
API_KEY = st.secrets.get("GEMINI_API_KEY", os.getenv("GEMINI_API_KEY"))
ADMIN_EMAIL = st.secrets.get("ADMIN_EMAIL", "votre-email@gmail.com")

if not API_KEY:
    st.error("⚠️ Clé API Google AI Studio introuvable. Veuillez l'ajouter dans les Secrets Streamlit.")
    st.stop()

client = genai.Client(api_key=API_KEY)

# Analytics Backend
if "stats" not in st.session_state:
    st.session_state.stats = {"storyboards": 0, "prompts": 0, "top_models": 0, "clics_affiliations": 0}

if "code_promo" not in st.session_state:
    st.session_state.code_promo = "LEMURIA2026"

SYSTEM_INSTRUCTIONS = """
Tu es Lemuria, l'assistant IA studio photo et vidéo de Madagascar.
Ton rôle est d'analyser l'image source (produit ou selfie) pour découper finement ses attributs visuels (matière, style, couleur, cadrage).
Ensuite, génère :
1. Le Prompt D'Entrée (Input) : Description analytique du produit/sujet en Anglais.
2. Le Prompt De Sortie (Output - Top Model) : Prompt haute-fidélité en Anglais pour mettre en situation le produit/modèle dans une scène de mode haute couture ou lifestyle.
"""

# --- 3. EN-TÊTE & ACCÈS BÊTA ---
col_logo, col_auth = st.columns([3, 1])
with col_logo:
    st.title("🚀 LEMURIA")
    st.caption("Le Hub IA 100% gratuit • Studio Top Model • Google Flow Beta • PikverseAI")

with col_auth:
    user_email_input = st.text_input("Accès Admin / Google", placeholder="votre-email@gmail.com")

# PANEL ADMIN
is_admin = (user_email_input.strip().lower() == ADMIN_EMAIL.strip().lower())
if is_admin:
    st.success("🔓 Mode Admin Actif")
    with st.expander("📊 Tableau de bord Analytics (Privé)"):
        st.json(st.session_state.stats)
        nouveau_code = st.text_input("Modifier Code Promo :", value=st.session_state.code_promo)
        if st.button("Sauvegarder"):
            st.session_state.code_promo = nouveau_code
            st.toast("Code mis à jour !")

st.divider()

# --- 4. CARROUSEL 5 RÉSEAUX SOCIAUX ---
st.subheader("🌐 Rejoignez la communauté Lemuria")
cols_rs = st.columns(5)
socials = [
    {"name": "Facebook", "url": "https://facebook.com", "icon": "📘"},
    {"name": "TikTok", "url": "https://tiktok.com", "icon": "🎵"},
    {"name": "YouTube", "url": "https://youtube.com", "icon": "🔴"},
    {"name": "Instagram", "url": "https://instagram.com", "icon": "📸"},
    {"name": "Telegram VIP", "url": "https://t.me", "icon": "✈️"}
]
for idx, col in enumerate(cols_rs):
    s = socials[idx]
    with col:
        if st.button(f"{s['icon']} {s['name']}", key=f"rs_{idx}"):
            st.session_state.stats["clics_affiliations"] += 1
            st.markdown(f"[Accéder à {s['name']}]({s['url']})")

st.divider()

# --- 5. STUDIO D'EXPÉRIENCE UTILISATEUR ---
st.subheader("🎨 Fonctionnalités & Expérience Utilisateur")

tab_model, tab_sb, tab_shop = st.tabs(["💃 Créer mon Top Model", "🎬 Storyboard Video", "🛒 Boutique & Code Promo"])

# MODE : CRÉER MON TOP MODEL
with tab_model:
    st.write("### Mode Créer mon top model")
    st.info("Sélectionnez votre mode d'importation dans le studio pour générer votre mise en situation haute-fidélité.")
    
    option_mode = st.radio("Choisissez une option :", ["Option 1 — Uploader mon produit", "Option 2 — Prendre un selfie"], horizontal=True)
    
    image_source = None
    
    if option_mode == "Option 1 — Uploader mon produit":
        file_upload = st.file_uploader("Glissez-déposez ou importez une image de produit", type=["png", "jpg", "jpeg", "webp"])
        if file_upload:
            image_source = Image.open(file_upload)
            
    elif option_mode == "Option 2 — Prendre un selfie":
        st.write("Activez la caméra frontale pour prendre votre selfie de manière sécurisée.")
        camera_photo = st.camera_input("Prenez votre photo")
        if camera_photo:
            image_source = Image.open(camera_photo)

    # GÉNÉRATION ET RENDU HAUTE FIDÉLITÉ
    if image_source is not None:
        st.write("---")
        if st.button("✨ Lancer la Génération & Rendu Haute-Fidélité"):
            st.session_state.stats["top_models"] += 1
            
            with st.spinner("Analyse Gemini en cours... Découpage des attributs visuels..."):
                # Appel API Gemini 2.5 Flash
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=[image_source, "Analyse cette image pour générer le prompt Input (analyse) et le prompt Output (mise en situation Top Model Haute Couture)"],
                    config=types.GenerateContentConfig(system_instruction=SYSTEM_INSTRUCTIONS)
                )
                
                st.subheader("🖼️ Rendu & Prompts Générés")
                
                # Affichage côte à côte Image 1 (Input) et Image 2 (Output / Analyse)
                col_in, col_out = st.columns(2)
                
                with col_in:
                    st.write("**Image 1 (Input - Produit/Selfie)**")
                    st.image(image_source, use_container_width=True)
                    st.write("**Prompt d'entrée (Analyse Input) :**")
                    st.code(f"Input attributes analysis: Product & Style detected from image", language="markdown")
                
                with col_out:
                    st.write("**Image 2 (Output - Concept Top Model)**")
                    st.image(image_source, caption="Aperçu source projeté", use_container_width=True)
                    st.write("**Prompt de sortie (Rendu Haute Couture Output) :**")
                    st.code(response.text, language="markdown")

                # ASTUCES & REDIRECTIONS PARTENAIRES
                st.write("---")
                st.warning("💡 **Astuce :** Copier les prompts dans votre bloc note.")
                
                st.write("#### 🎥 Créer ma vidéo sur Google Flow Beta ou PikverseAI :")
                col_btn1, col_btn2 = st.columns(2)
                
                with col_btn1:
                    st.markdown("""
                    <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.labs.whisk" target="_blank">
                        <button style="width:100%; background-color:#0052FF; color:white; padding:12px; border-radius:8px; border:none; font-weight:bold; cursor:pointer;">
                            🚀 Ouvrir Google Flow Beta
                        </button>
                    </a>
                    """, unsafe_allow_html=True)
                    
                with col_btn2:
                    st.markdown("""
                    <a href="https://bit.ly/piksverse" target="_blank">
                        <button style="width:100%; background-color:#0F172A; color:white; padding:12px; border-radius:8px; border:none; font-weight:bold; cursor:pointer;">
                            ✨ Ouvrir PikverseAI
                        </button>
                    </a>
                    """, unsafe_allow_html=True)

# TAB STORYBOARD
with tab_sb:
    st.write("### Générateur de Storyboard")
    sb_file = st.file_uploader("Image de référence pour vidéo", type=["png", "jpg", "jpeg", "webp"], key="sb_file")
    if sb_file and st.button("Créer le Storyboard"):
        st.session_state.stats["storyboards"] += 1
        img_sb = Image.open(sb_file)
        with st.spinner("Génération du storyboard..."):
            res = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[img_sb, "Génère un storyboard en 4 scènes pour vidéo avec prompts en Anglais."],
                config=types.GenerateContentConfig(system_instruction=SYSTEM_INSTRUCTIONS)
            )
            st.write(res.text)

# TAB BOUTIQUE & PROMO
with tab_shop:
    col_b, col_p = st.columns(2)
    with col_b:
        st.write("### 🛒 Boutique de Prompts")
        st.markdown("* Pack Top Model E-Commerce\n* Pack Storyboard Cinéma\n* Pack Réseaux Sociaux")
    with col_p:
        st.write("### 🏷️ Code Promo du Mois")
        st.markdown(f"""
        <div class="card" style="text-align: center;">
            <h2>Code : <span class="badge-promo">{st.session_state.code_promo}</span></h2>
            <p>-50% sur l'accès VIP Lemuria Telegram.</p>
        </div>
        """, unsafe_allow_html=True)
