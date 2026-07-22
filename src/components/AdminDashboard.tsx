import streamlit as st
import requests
 
API_BASE = "http://localhost:5000"  # à synchroniser avec streamlit_app.py
 
DEFAULT_PARTNER_TOGGLES = {"google_flow": True, "pikverse": True, "midjourney_flux": True}
 
 
def _fetch_admin_data():
    """Équivalent de fetchData()."""
    try:
        settings_res = requests.get(f"{API_BASE}/api/admin/settings", timeout=10)
        analytics_res = requests.get(f"{API_BASE}/api/admin/analytics", timeout=10)
        settings_data = settings_res.json() if settings_res.ok else {}
        analytics_data = analytics_res.json() if analytics_res.ok else {}
        return settings_data, analytics_data
    except Exception as e:
        print(f"Error loading admin dashboard data: {e}")  # équivalent console.error
        return {}, {}
 
 
def _save_settings(payload: dict) -> bool:
    """Équivalent de la partie POST partagée par handleSaveSettings / handleTogglePartner."""
    try:
        res = requests.post(f"{API_BASE}/api/admin/settings", json=payload, timeout=10)
        return res.ok
    except Exception as e:
        print(f"Error saving admin settings: {e}")  # équivalent console.error
        return False
 
 
def render_admin_dashboard(on_close, on_settings_change):
    """
    Équivalent de <AdminDashboard onClose onSettingsChange />
 
    Args:
        on_close: fonction() -> None (doit mettre show_admin à False)
        on_settings_change: fonction() -> None (équivalent fetchSettings() dans App.tsx)
    """
    # Chargement initial (équivalent du useEffect(fetchData, []))
    if "admin_settings" not in st.session_state or "admin_analytics" not in st.session_state:
        with st.spinner("Récupération des métriques et configurations..."):
            settings, analytics = _fetch_admin_data()
        st.session_state.admin_settings = settings
        st.session_state.admin_analytics = analytics
        st.session_state.admin_partner_toggles = settings.get("partners", DEFAULT_PARTNER_TOGGLES)
        st.session_state.admin_blog_articles = settings.get("blogArticles", [])
        carousel_urls = {}
        for item in settings.get("carousel", []):
            carousel_urls[item["id"]] = item.get("url", "")
        st.session_state.admin_carousel_urls = carousel_urls
 
    settings = st.session_state.admin_settings
    analytics = st.session_state.admin_analytics
 
    # Header du dashboard
    header_col, close_col = st.columns([8, 1])
    with header_col:
        st.markdown(
            """
            <div style="display:flex; align-items:center; gap:12px;">
                <div style="height:48px; width:48px; border-radius:16px; background:rgba(37,99,235,0.10);
                            color:#3b82f6; border:1px solid rgba(59,130,246,0.20); display:flex;
                            align-items:center; justify-content:center; font-size:22px;">🛡️</div>
                <div>
                    <h1 style="font-size:20px; font-weight:800; margin:0;">Tableau de Bord Administrateur</h1>
                    <p style="font-size:12px; color:#94a3b8; margin:2px 0 0 0;">
                        Lemuria Hub IA Madagascar • Masoivoho Panel
                    </p>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with close_col:
        if st.button("✕", key="close_admin_btn"):
            on_close()
            st.rerun()
 
    st.divider()
 
    # --- Row 1 : Compteurs analytics ---
    st.markdown("##### 📊 Mesures de Trafic et Conversions (Temps Réel)")
    metrics = analytics.get("metrics", {})
    stat_cols = st.columns(4)
    total_gen = (
        metrics.get("storyboard_gen", 0)
        + metrics.get("image_to_prompt", 0)
        + metrics.get("pikverse_anim", 0)
    )
    with stat_cols[0]:
        st.metric("Générations Totales", total_gen)
    with stat_cols[1]:
        st.metric("Clics Cible Flow", metrics.get("affiliate_click_flow", 0))
    with stat_cols[2]:
        st.metric("Clics ref/pikverse", metrics.get("affiliate_click_pikverse", 0))
    with stat_cols[3]:
        st.metric("Prompts Copiés", metrics.get("prompt_copied", 0))
 
    stat_cols2 = st.columns(2)
    with stat_cols2[0]:
        st.metric("👥 Vues Boutique", metrics.get("boutique_view", 0))
    with stat_cols2[1]:
        st.metric("🛍️ Clics d'achat pack", metrics.get("boutique_buy_click", 0))
 
    st.divider()
 
    # --- Row 2 : Switches API + Promo ---
    switches_col, promo_form_col = st.columns(2)
 
    with switches_col:
        st.markdown("##### ⚡ Statut des API Partenaires")
        st.caption(
            "Désactivez temporairement un service partenaire pour basculer automatiquement "
            "l'inférence vers le système local de secours."
        )
        toggles = st.session_state.admin_partner_toggles
 
        partner_labels = {
            "google_flow": ("Google Flow Beta Router", "Séquences de storyboards vidéo"),
            "pikverse": ("PikverseAI Engine", "Générateur d'animations Pika"),
            "midjourney_flux": ("Flux / Midjourney Pro Router", "Traducteur d'image-to-prompt master"),
        }
        for key, (label, sublabel) in partner_labels.items():
            new_val = st.toggle(f"**{label}**  \n:gray[{sublabel}]", value=toggles.get(key, True), key=f"toggle_{key}")
            if new_val != toggles.get(key, True):
                toggles[key] = new_val
                st.session_state.admin_partner_toggles = toggles
                if _save_settings({"partners": toggles}):
                    on_settings_change()
                    st.toast("Configuration mise à jour !", icon="✅")
                st.rerun()
 
    with promo_form_col:
        st.markdown("##### 💾 Contenu Dynamique & Promo")
        st.caption(
            "Éditez le code promotionnel mensuel qui s'affichera instantanément dans la "
            "boutique pour tous les visiteurs."
        )
        with st.form("promo_form"):
            promo_code = st.text_input("Code Promo du Mois", value=settings.get("promoCode", "")).upper()
            promo_discount = st.text_input("Avantages & Réduction", value=settings.get("promoDiscount", ""))
            if st.form_submit_button("✅ Appliquer les Modifications", use_container_width=True):
                settings["promoCode"] = promo_code
                settings["promoDiscount"] = promo_discount
                if _save_settings(
                    {
                        "promoCode": promo_code,
                        "promoDiscount": promo_discount,
                        "carousel": settings.get("carousel", []),
                        "partners": st.session_state.admin_partner_toggles,
                        "backendInstructions": settings.get("backendInstructions", ""),
                        "ecommerceUrl": settings.get("ecommerceUrl", ""),
                        "blogArticles": st.session_state.admin_blog_articles,
                    }
                ):
                    st.session_state.admin_settings = settings
                    on_settings_change()
                    st.toast("Configuration mise à jour !", icon="✅")
 
    st.divider()
 
    # --- Row 3 : Backend Instructions & E-commerce ---
    st.markdown("##### 🛡️ Configuration Backend IA & E-commerce")
    st.caption(
        "Définissez les instructions de scripts et structures que le modèle IA suivra en "
        "tâche de fond, ainsi que le lien externe de redirection de l'onglet E-commerce."
    )
    with st.form("backend_ecommerce_form"):
        backend_instructions = st.text_area(
            "Instructions Système / Directives Prompting Backend",
            value=settings.get("backendInstructions", ""),
            placeholder="Ex: Vous êtes Lemuria AI, un assistant spécialisé...",
            height=100,
        )
        ecommerce_url = st.text_input(
            "URL de redirection E-commerce externe",
            value=settings.get("ecommerceUrl", ""),
            placeholder="https://...",
        )
        if st.form_submit_button("✅ Appliquer IA & E-commerce", use_container_width=True):
            settings["backendInstructions"] = backend_instructions
            settings["ecommerceUrl"] = ecommerce_url
            if _save_settings(
                {
                    "promoCode": settings.get("promoCode", ""),
                    "promoDiscount": settings.get("promoDiscount", ""),
                    "carousel": settings.get("carousel", []),
                    "partners": st.session_state.admin_partner_toggles,
                    "backendInstructions": backend_instructions,
                    "ecommerceUrl": ecommerce_url,
                    "blogArticles": st.session_state.admin_blog_articles,
                }
            ):
                st.session_state.admin_settings = settings
                on_settings_change()
                st.toast("Configuration mise à jour !", icon="✅")
 
    st.divider()
 
    # --- Row 4 : URLs du carrousel ---
    st.markdown("##### 🔗 Gestion des URLs d'affiliation (Carrousel)")
    st.caption(
        "Définissez les adresses cibles vers lesquelles les utilisateurs sont redirigés en "
        "cliquant sur les 5 slides du carrousel d'accueil."
    )
    with st.form("carousel_form"):
        carousel_urls = st.session_state.admin_carousel_urls
        for item in settings.get("carousel", []):
            carousel_urls[item["id"]] = st.text_input(
                item.get("name", item["id"]),
                value=carousel_urls.get(item["id"], item.get("url", "")),
                placeholder="https://...",
                key=f"carousel_url_{item['id']}",
            )
        if st.form_submit_button("✅ Enregistrer les Liens", use_container_width=True):
            updated_carousel = [
                {**item, "url": carousel_urls.get(item["id"], item.get("url", ""))}
                for item in settings.get("carousel", [])
            ]
            settings["carousel"] = updated_carousel
            st.session_state.admin_carousel_urls = carousel_urls
            if _save_settings(
                {
                    "promoCode": settings.get("promoCode", ""),
                    "promoDiscount": settings.get("promoDiscount", ""),
                    "carousel": updated_carousel,
                    "partners": st.session_state.admin_partner_toggles,
                    "backendInstructions": settings.get("backendInstructions", ""),
                    "ecommerceUrl": settings.get("ecommerceUrl", ""),
                    "blogArticles": st.session_state.admin_blog_articles,
                }
            ):
                st.session_state.admin_settings = settings
                on_settings_change()
                st.toast("Configuration mise à jour !", icon="✅")
 
    st.divider()
 
    # --- Row 5 : Articles de blog ---
    st.markdown("##### 📰 Gestion du Blog d'Actualité IA & Tech")
    st.caption(
        "Modifiez les articles de blog. Chaque article peut avoir son propre titre, "
        "description, image d'illustration et lien partenaire d'affiliation externe."
    )
    with st.form("blog_form"):
        blog_articles = st.session_state.admin_blog_articles
        updated_articles = []
        for i, article in enumerate(blog_articles):
            st.markdown(f"**Article #{i + 1}**  \n:gray[{article.get('id', '')}]")
            title = st.text_input("Titre de l'article", value=article.get("title", ""), key=f"blog_title_{i}")
            description = st.text_area(
                "Description / Résumé", value=article.get("description", ""), key=f"blog_desc_{i}", height=70
            )
            col_a, col_b = st.columns(2)
            with col_a:
                image_url = st.text_input(
                    "URL de l'image (Illustration)",
                    value=article.get("imageUrl", ""),
                    placeholder="https://images.unsplash.com/...",
                    key=f"blog_img_{i}",
                )
            with col_b:
                partner_url = st.text_input(
                    "Lien Partenaire (Redirection)",
                    value=article.get("partnerUrl", ""),
                    placeholder="https://...",
                    key=f"blog_partner_{i}",
                )
            updated_articles.append(
                {**article, "title": title, "description": description, "imageUrl": image_url, "partnerUrl": partner_url}
            )
            st.markdown("---")
 
        if st.form_submit_button("✅ Enregistrer les Articles", use_container_width=True):
            st.session_state.admin_blog_articles = updated_articles
            settings["blogArticles"] = updated_articles
            if _save_settings(
                {
                    "promoCode": settings.get("promoCode", ""),
                    "promoDiscount": settings.get("promoDiscount", ""),
                    "carousel": settings.get("carousel", []),
                    "partners": st.session_state.admin_partner_toggles,
                    "backendInstructions": settings.get("backendInstructions", ""),
                    "ecommerceUrl": settings.get("ecommerceUrl", ""),
                    "blogArticles": updated_articles,
                }
            ):
                st.session_state.admin_settings = settings
                on_settings_change()
                st.toast("Configuration mise à jour !", icon="✅")
 
    st.divider()
 
    # --- Row 6 : Console de logs ---
    st.markdown("##### 📡 Console des Événements Récents (Log Analytics)")
    logs = analytics.get("logs", [])
    if logs:
        log_lines = []
        for log in logs:
            event_type = log.get("event_type", "")
            timestamp = log.get("timestamp", "")
            partner_id = log.get("partner_id", "")
            user_id = log.get("user_id", "")
            log_lines.append(f"{timestamp}  {event_type.upper():<20}  {partner_id.upper():<15}  {user_id}")
        st.code("\n".join(log_lines), language=None)
    else:
        st.caption("Aucun événement enregistré pour le moment.")
