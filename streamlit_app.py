import streamlit as st
from google import genai
from google.genai import types
from PIL import Image
import os

# --- 1. CONFIGURATION DE LA PAGE & CHARTE UI SOMBRE DE LUXE ---
st.set_page_config(
    page_title="Lemuria - Studio Top Model & Video",
    page_icon="🚀",
    layout="wide"
)

# Injection CSS : Slate 950 (#020617), Émeraude (#10B981), Bleu (#0052FF), Ambre (#F59E0B)
st.markdown("""
<style>
    .stApp {
        background: radial-gradient(circle at 50% 0%, #0F172A 0%, #020617 100%) !important;
        color: #F8FAFC !important;
    }
    
    h1, h2, h3, h4, label {
        color: #F8FAFC !important;
        font-family: 'Inter', sans-serif !important;
    }

    .stCard, div[data-testid="stExpander"], div[data-testid="stVerticalBlock"] > div {
        border-radius: 16px !important;
    }
    
    .card-luxury {
        background-color: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 16px;
        backdrop-filter: blur(8px);
    }

    .stButton>button {
        background-color: #0052FF !important;
        color: #FFFFFF !important;
        border-radius: 12px !important;
        border: none !important;
        font-weight: 600 !important;
        padding: 10px 20px !important;
        transition: all 0.3s ease;
    }
    .stButton>button:hover {
        background-color: #10B981 !important;
        box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
    }

    video {
        transform: scaleX(-1) !important;
        border-radius: 16px !important;
        border: 2px solid #10B981 !important;
    }

    .box-tip {
        background-color: rgba(245, 158, 11, 0.1);
        border: 1px solid #F59E0B;
        border-radius: 16px;
        padding: 14px;
        color: #FBBF24;
        font-weight: 500;
        margin-top: 15px;
        margin-bottom: 15px;
    }
</style>
""", unsafe_allow_html=True)

# --- 2. SÉCURITÉ & CONNEXION GOOGLE AI STUDIO ---
API_KEY = st.secrets.get("GEMINI_API_KEY", os.getenv("GEMINI_API_KEY"))
ADMIN_EMAIL = st.secrets.get("ADMIN_EMAIL", "votre-email@gmail.com")

if not API_KEY:
    st.error("⚠️ Clé API Google AI Studio introuvable dans les Secrets. Veuillez la configurer.")
    st.stop()

client = genai.Client(api_key=API_KEY)

# Modèle officiel recommandé pour la vitesse et la vision
MODEL_NAME = "gemini-2.5-flash"

# Tracking Analytics Backend
if "stats" not in st.session_state:
    st.session_state.stats = {"top_models": 0, "storyboards": 0, "clics_affiliations": 0}

if "code_promo" not in st.session_state:
    st.session_state.code_promo = "LEMURIA2026"

SYSTEM_INSTRUCTIONS = """
Tu es Lemuria, l'assistant IA studio photo et vidéo de Madagascar.
Ton rôle est d'analyser l'image source (produit ou selfie) pour générer 2 prompts distincts :

1. Prompt 1 (débutant obligatoirement par '1-') : Décris avec minutie et précision la scène d'origine (sujet, posture, vêtements, arrière-plan, lumière).
2. Prompt 2 (débutant obligatoirement par '2-') : Détaille la scène finale de mise en situation haut de gamme dans un gymnase stylé et luxueux, prêt pour la création vidéo.
"""

# --- 3. EN-TÊTE & ACCÈS VIP ---
col_logo, col_auth = st.columns([3, 1])
with col_logo:
    st.title("🚀 LEMURIA")
    st.caption("Studio IA d'Élite • Top Model • Google Flow Beta • PikverseAI")

with col_auth:
    user_email_input = st.text_input("Accès Admin / Google", placeholder="votre-email@gmail.com")

# PANEL ADMIN PRIVÉ
is_admin = (user_email_input.strip().lower() == ADMIN_EMAIL.strip().lower())
if is_admin:
    st.success("🔓 Mode Admin Actif")
    with st.expander("📊 Analytics & Configuration Backend"):
        st.json(st.session_state.stats)
        nouveau_code = st.text_input("Code Promo :", value=st.session_state.code_promo)
        if st.button("Sauvegarder"):
            st.session_state.code_promo = nouveau_code
            st.toast("Code mis à jour !")

st.divider()

# --- 4. CARROUSEL DES RÉSEAUX SOCIAUX ---
st.subheader("🌐 Communauté Lemuria")
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
            st.markdown(f"[Ouvrir {s['name']}]({s['url']})")

st.divider()

# --- 5. PARCOURS UTILISATEUR ERGONOMIQUE ---
st.subheader("📸 Studio Top Model & Création")

tab_topmodel, tab_sb, tab_shop = st.tabs(["📷 Top Model", "🎬 Storyboard Vidéo", "🛒 Boutique & Code Promo"])

with tab_topmodel:
    st.markdown('<div class="card-luxury">', unsafe_allow_html=True)
    st.write("### 1. Sélection du mode de traitement")
    
    sub_mode = st.radio(
        "Mode d'importation :",
        ["📁 Uploader mon produit", "📸 Prendre un selfie"],
        horizontal=True
    )
    
    image_input = None
    
    if sub_mode == "📁 Uploader mon produit":
        uploaded_file = st.file_uploader("Glissez votre fichier (PNG, JPG, WebP)", type=["png", "jpg", "jpeg", "webp"])
        if uploaded_file:
            image_input = Image.open(uploaded_file)
            
    elif sub_mode == "📸 Prendre un selfie":
        st.write("Activez le flux vidéo frontal pour capturer votre selfie :")
        camera_photo = st.camera_input("Prendre une photo (Effet Miroir)")
        if camera_photo:
            image_input = Image.open(camera_photo)
            st.success("📸 Capture réussie !")
            
    st.markdown('</div>', unsafe_allow_html=True)

    if image_input is not None:
        st.write("---")
        if st.button("✨ Générer les Prompts Studio (Gemini)"):
            st.session_state.stats["top_models"] += 1
            
            with st.spinner("Traitement par le moteur Gemini en cours..."):
                try:
                    response = client.models.generate_content(
                        model=MODEL_NAME,
                        contents=[image_input, "Génère le Prompt 1 (débutant par 1-) et le Prompt 2 (débutant par 2-) pour la mise en situation gymnase."],
                        config=types.GenerateContentConfig(system_instruction=SYSTEM_INSTRUCTIONS)
                    )
                    
                    col_left, col_right = st.columns(2)
                    
                    with col_left:
                        st.markdown('<div class="card-luxury">', unsafe_allow_html=True)
                        st.write("#### 🖼️ Colonne Gauche (Image 1 - Input)")
                        st.image(image_input, use_container_width=True)
                        st.write("**Prompt 1- (Scène d'origine) :**")
                        st.code(response.text.split("2-")[0] if "2-" in response.text else response.text, language="markdown")
                        st.markdown('</div>', unsafe_allow_html=True)
                        
                    with col_right:
                        st.markdown('<div class="card-luxury">', unsafe_allow_html=True)
                        st.write("#### ✨ Colonne Droite (Image 2 - Output)")
                        st.image(image_input, caption="Projection Rendu Gymnase Haut de Gamme", use_container_width=True)
                        st.write("**Prompt 2- (Scène Gymnase Final) :**")
                        prompt_2_text = "2-" + response.text.split("2-")[1] if "2-" in response.text else response.text
                        st.code(prompt_2_text, language="markdown")
                        st.markdown('</div>', unsafe_allow_html=True)

                    st.markdown("""
                    <div class="box-tip">
                        💡 <b>Astuce :</b> Copiez les prompts ci-dessus dans votre bloc-notes avant d'ouvrir votre moteur vidéo.
                    </div>
                    """, unsafe_allow_html=True)
                    
                    st.write("#### 🚀 Générer la vidéo sur nos plateformes partenaires :")
                    btn_flow, btn_pik = st.columns(2)
                    
                    with btn_flow:
                        st.markdown("""
                        <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.labs.whisk" target="_blank">
                            <button style="width:100%; background-color:#0052FF; color:white; padding:12px; border-radius:12px; border:none; font-weight:bold; cursor:pointer;">
                                🚀 Ouvrir Google Flow Beta
                            </button>
                        </a>
                        """, unsafe_allow_html=True)
                        
                    with btn_pik:
                        st.markdown("""
                        <a href="https://bit.ly/piksverse" target="_blank">
                            <button style="width:100%; background-color:#10B981; color:white; padding:12px; border-radius:12px; border:none; font-weight:bold; cursor:pointer;">
                                ✨ Ouvrir PikverseAI
                            </button>
                        </a>
                        """, unsafe_allow_html=True)
                except Exception as e:
                    st.error(f"Une erreur est survenue lors du traitement par l'API : {e}")

# TAB STORYBOARD
with tab_sb:
    st.write("### 🎬 Générateur de Storyboard Video")
    sb_file = st.file_uploader("Image pour scénario vidéo", type=["png", "jpg", "jpeg", "webp"], key="sb_file")
    if sb_file and st.button("Créer le Storyboard"):
        st.session_state.stats["storyboards"] += 1
        img_sb = Image.open(sb_file)
        with st.spinner("Génération..."):
            try:
                res = client.models.generate_content(
                    model=MODEL_NAME,
                    contents=[img_sb, "Génère un storyboard vidéo détaillé en 4 scènes avec prompts en anglais."],
                    config=types.GenerateContentConfig(system_instruction=SYSTEM_INSTRUCTIONS)
                )
                st.write(res.text)
            except Exception as e:
                st.error(f"Erreur API lors de la génération du storyboard : {e}")

# TAB BOUTIQUE
with tab_shop:
    col_b, col_p = st.columns(2)
    with col_b:
        st.write("### 🛒 Packs de Prompts")
        st.markdown("* Pack Top Model E-Commerce\n* Pack Storyboard Cinéma\n* Pack Réseaux Sociaux Mada")
    with col_p:
        st.write("### 🏷️ Code Promo du Mois")
        st.markdown(f"""
        <div class="card-luxury" style="text-align: center;">
            <h2>Code : <span style="color:#10B981;">{st.session_state.code_promo}</span></h2>
            <p>-50% sur l'accès VIP Telegram Lemuria.</p>
        </div>
        """, unsafe_allow_html=True)
