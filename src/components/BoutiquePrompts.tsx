import streamlit as st
 
PACKS = [
    {
        "id": "pack-ecommerce",
        "title": "Pack E-Commerce Mada",
        "tagline": "Vendez vos produits locaux comme des grandes marques",
        "description": "Des recettes visuelles précises pour photographier virtuellement vos produits (Artisanat en raphia, huiles essentielles, poivre sauvage, vanille de Sambava) avec des décors luxueux.",
        "price": "25 000 Ar",
        "discounted": "12 500 Ar",
        "features": [
            "40+ Prompts Midjourney & Flux premium",
            "Décors de studio luxueux adaptés au Mobile",
            "Optimisé pour l'artisanat & produits locaux",
            "Guide d'incrustation gratuit",
        ],
        "badge": "Best Seller 🇲🇬",
    },
    {
        "id": "pack-cinema",
        "title": "Pack Storyboard & Cinéma IA",
        "tagline": "Produisez vos storyboards de films en 10 minutes",
        "description": "Générez des visuels cinématographiques ultra-réalistes de Madagascar : scènes de rue à Antananarivo, forêts humides de l'Est, paysages côtiers du Grand Sud.",
        "price": "35 000 Ar",
        "discounted": "17 500 Ar",
        "features": [
            "50+ Prompts cinématographiques (cadrages, objectifs)",
            "Directives de lumières (golden hour mada, brumes)",
            "Pack de transitions d'animation vidéo",
            "Exemples de storyboards publicitaires réels",
        ],
        "badge": "Recommandé Agences",
    },
]
 
 
def render_boutique_prompts(promo_code, promo_discount, on_track_click):
    """
    Équivalent de <BoutiquePrompts promoCode promoDiscount onTrackClick />
 
    Args:
        promo_code: str, ex "LEMURIA2026"
        promo_discount: str, ex "-50% & Accès VIP"
        on_track_click: fonction(partner_id) -> None
    """
    st.markdown('<div id="boutique"></div>', unsafe_allow_html=True)
 
    st.markdown(
        """
        <div style="display:flex; align-items:center; gap:12px; margin: 32px 0 24px 0;
                    border-bottom:1px solid #1e293b; padding-bottom:16px;">
            <div style="height:40px; width:40px; border-radius:12px; background:rgba(59,130,246,0.10);
                        color:#60a5fa; border:1px solid rgba(59,130,246,0.20); display:flex;
                        align-items:center; justify-content:center; font-size:20px;">🛍️</div>
            <div>
                <h2 style="font-size:20px; font-weight:800; color:white; margin:0;">
                    Boutique de Prompts & Promotions Lemuria
                </h2>
                <p style="font-size:12px; color:#94a3b8; margin:2px 0 0 0;">
                    Des ressources premium adaptées aux créateurs et entrepreneurs malgaches.
                </p>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
 
    packs_col, promo_col = st.columns([2, 1], gap="large")
 
    with packs_col:
        st.markdown(
            '<p style="font-size:13px; font-weight:700; color:#64748b; text-transform:uppercase; '
            'letter-spacing:0.05em; margin-bottom:16px;">Packs Locaux Disponibles</p>',
            unsafe_allow_html=True,
        )
        pack_cols = st.columns(2)
        for pack, col in zip(PACKS, pack_cols):
            with col:
                features_html = "".join(
                    f'<li style="display:flex; gap:6px; font-size:12px; color:#cbd5e1; margin-bottom:6px;">'
                    f'<span style="color:#60a5fa;">✓</span><span>{feat}</span></li>'
                    for feat in pack["features"]
                )
                st.markdown(
                    f"""
                    <div style="border-radius:16px; border:1px solid #1e293b; background:rgba(15,23,42,0.4);
                                padding:24px; position:relative; height:100%;">
                        <span style="position:absolute; top:16px; right:16px; background:rgba(59,130,246,0.10);
                                     color:#60a5fa; font-size:10px; font-weight:700; padding:2px 8px;
                                     border-radius:9999px; border:1px solid rgba(59,130,246,0.20);">{pack['badge']}</span>
                        <h4 style="font-size:16px; font-weight:800; color:white; margin:0 0 4px 0;">{pack['title']}</h4>
                        <p style="font-size:12px; font-weight:600; color:#94a3b8; margin:0 0 12px 0;">{pack['tagline']}</p>
                        <p style="font-size:12px; color:#cbd5e1; margin:0 0 16px 0; line-height:1.6;">{pack['description']}</p>
                        <ul style="list-style:none; padding:0; margin:0 0 16px 0;">{features_html}</ul>
                        <div style="display:flex; align-items:baseline; gap:8px; border-top:1px solid #1e293b;
                                    padding-top:12px; margin-bottom:16px;">
                            <span style="font-size:13px; text-decoration:line-through; color:#64748b;">{pack['price']}</span>
                            <span style="font-size:18px; font-weight:800; color:white;">{pack['discounted']}</span>
                            <span style="font-size:10px; font-weight:700; color:#60a5fa; background:rgba(59,130,246,0.10);
                                         border:1px solid rgba(59,130,246,0.20); padding:2px 6px; border-radius:4px;">
                                -50% avec CODE
                            </span>
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
                if st.button("Obtenir ce Pack", key=f"buy_btn_{pack['id']}", use_container_width=True):
                    on_track_click("boutique_buy_click")
                    st.success(
                        f"🇲🇬 Salama! Merci pour votre intérêt pour le « {pack['title']} ». "
                        f"Lemuria Hub est gratuit, et ce pack de prompts sera bientôt disponible "
                        f"en téléchargement direct en monnaie locale (MGA / Mobile Money). "
                        f"Utilisez votre code promo {promo_code} pour obtenir vos -50% !"
                    )
 
    with promo_col:
        st.markdown(
            f"""
            <div style="border-radius:24px; background:linear-gradient(135deg, #2563eb, #3730a3); color:white;
                        padding:28px; height:100%; min-height:280px; display:flex; flex-direction:column;
                        justify-content:space-between; box-shadow:0 25px 50px -12px rgba(30,58,138,0.3);">
                <div>
                    <p style="font-size:11px; font-weight:800; color:#bfdbfe; text-transform:uppercase;
                              letter-spacing:0.1em; margin:0 0 12px 0;">🏷️ Offre du Mois Lemuria</p>
                    <h4 style="font-size:24px; font-weight:900; margin:0 0 4px 0;">{promo_discount}</h4>
                    <p style="font-size:12px; color:#dbeafe; margin:0 0 16px 0;">
                        Sur tous les packs premium et les formations privées de l'écosystème IA Lemuria.
                    </p>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        st.caption("Code actif à copier :")
        st.code(promo_code, language=None)
 
        st.markdown(
            """
            <div style="margin-top:16px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.1);">
                <p style="font-size:12px; font-weight:600; color:#374151;">🏆 Accès Privilège VIP inclus</p>
                <p style="font-size:11px; color:#6b7280; line-height:1.6;">
                    Profitez d'un accès VIP prioritaire sur nos serveurs de rendu d'images de Madagascar
                    pour vos projets professionnels.
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )
