import streamlit as st
 
SLIDES = [
    {
        "id": "facebook",
        "title": "Communauté Facebook Lemuria",
        "tagline": "Salama e! Rejoins 15,000+ créateurs à Madagascar",
        "description": "Partage tes créations de storyboards, pose tes questions en malagasy ou français, et collabore avec la plus grande communauté d'IA locale.",
        "gradient": "linear-gradient(135deg, #2563eb, #4338ca)",
        "icon": "📘",
        "badge": "Entraide & Partage",
    },
    {
        "id": "tiktok",
        "title": "TikTok @lemuria_ia",
        "tagline": "Des astuces IA courtes et percutantes en 60s",
        "description": "Regarde nos tutoriels vidéo rapides pour maîtriser Google Flow Beta et PikverseAI. Astuces de création visuelle adaptées aux connexions locales.",
        "gradient": "linear-gradient(135deg, #0f172a, #581c87)",
        "icon": "🎵",
        "badge": "Tutos Mada & Trends",
    },
    {
        "id": "youtube",
        "title": "Chaîne YouTube Lemuria",
        "tagline": "Formations complètes et masterclasses gratuites",
        "description": "Apprends à concevoir des films IA complets, à monétiser tes prompts avec l'e-commerce et à piloter des pipelines de génération avancés.",
        "gradient": "linear-gradient(135deg, #dc2626, #be123c)",
        "icon": "▶️",
        "badge": "Formations Officielles",
    },
    {
        "id": "instagram",
        "title": "Instagram Showcase",
        "tagline": "Le temple du prompting haute-fidélité",
        "description": "Découvre les plus beaux chefs-d'œuvre visuels inspirés de Madagascar. Copie les recettes esthétiques et partage tes rendus avec le hashtag #LemuriaIA.",
        "gradient": "linear-gradient(135deg, #db2777, #9333ea, #f97316)",
        "icon": "📷",
        "badge": "Inspiration Visuelle",
    },
    {
        "id": "telegram",
        "title": "Groupe Privé VIP Telegram",
        "tagline": "Partage de prompts secrets & Accès VIP",
        "description": "Sois le premier informé de l'accès aux bêtas privées, reçois des codes promos exclusifs et échange directement avec le staff de Lemuria.",
        "gradient": "linear-gradient(135deg, #06b6d4, #2563eb)",
        "icon": "✈️",
        "badge": "Accès Secret VIP",
    },
]
 
DEFAULT_URLS = {
    "facebook": "#",
    "tiktok": "#",
    "youtube": "#",
    "instagram": "#",
    "telegram": "#",
}
 
 
def render_carousel(carousel_items, on_track_click):
    """
    Équivalent de <Carousel carouselItems onTrackClick />
 
    Args:
        carousel_items: liste de dicts {"id", "url", ...} venant des settings admin
        on_track_click: fonction(partner_id) -> None
    """
    if "carousel_index" not in st.session_state:
        st.session_state.carousel_index = 0
 
    # Table de correspondance id -> url configurée par l'admin
    url_map = {item["id"]: item["url"] for item in (carousel_items or []) if "id" in item}
 
    idx = st.session_state.carousel_index
    slide = SLIDES[idx]
    target_url = url_map.get(slide["id"], DEFAULT_URLS.get(slide["id"], "#"))
 
    st.markdown(
        """
        <div style="text-align:center; margin: 24px 0 16px 0;">
            <p style="font-size:12px; font-weight:700; color:#2563eb; text-transform:uppercase;
                      letter-spacing:0.05em;">Réseaux Lemuria Madagascar</p>
            <p style="font-size:18px; font-weight:800; color:#0f172a; margin-top:4px;">
                Propulsez vos compétences en rejoignant notre écosystème
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )
 
    st.markdown(
        f"""
        <div style="border-radius:24px; overflow:hidden; background:white; box-shadow:0 20px 25px -5px rgba(0,0,0,0.08);
                    padding: 32px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:24px;">
            <div style="flex:1; min-width:260px; text-align:left;">
                <span style="display:inline-flex; align-items:center; border-radius:9999px; background:#f1f5f9;
                             padding:4px 12px; font-size:12px; font-weight:600; color:#1e293b;">{slide['badge']}</span>
                <h2 style="font-size:26px; font-weight:800; color:#0f172a; margin:12px 0 4px 0;">{slide['title']}</h2>
                <p style="font-size:14px; font-weight:600; color:#2563eb; margin:0 0 8px 0;">{slide['tagline']}</p>
                <p style="font-size:13px; color:#64748b; max-width:520px;">{slide['description']}</p>
            </div>
            <a href="{target_url}" target="_blank" rel="noopener noreferrer"
               style="text-decoration:none; width:240px; height:150px; border-radius:16px; background:{slide['gradient']};
                      display:flex; flex-direction:column; align-items:center; justify-content:center; color:white;
                      position:relative; box-shadow:0 10px 15px -3px rgba(0,0,0,0.15);">
                <span style="font-size:40px; margin-bottom:8px;">{slide['icon']}</span>
                <span style="font-size:11px; font-family:monospace; opacity:0.9;">Rejoindre maintenant ↗</span>
            </a>
        </div>
        """,
        unsafe_allow_html=True,
    )
 
    # Boutons de navigation + indicateurs (remplace les flèches ChevronLeft/Right et les dots)
    nav_col1, dots_col, nav_col2 = st.columns([1, 6, 1])
    with nav_col1:
        if st.button("◀", key="carousel_prev_btn", use_container_width=True):
            st.session_state.carousel_index = (idx - 1) % len(SLIDES)
            st.rerun()
    with dots_col:
        dot_cols = st.columns(len(SLIDES))
        for i, dot_col in enumerate(dot_cols):
            with dot_col:
                label = "●" if i == idx else "○"
                if st.button(label, key=f"carousel_dot_{i}", use_container_width=True):
                    st.session_state.carousel_index = i
                    st.rerun()
    with nav_col2:
        if st.button("▶", key="carousel_next_btn", use_container_width=True):
            st.session_state.carousel_index = (idx + 1) % len(SLIDES)
            st.rerun()
 
    # Enregistre le clic si on clique sur le lien (approximation : on ne peut pas
    # intercepter le clic sur un <a> HTML natif côté serveur Streamlit ; le tracking
    # précis nécessiterait un composant custom. Pour l'instant le clic ouvre bien le
    # lien, mais le track_event ne se déclenche pas automatiquement dessus.)
