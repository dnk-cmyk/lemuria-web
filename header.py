import streamlit as st
 
ADMIN_EMAIL = "admin@lemuria.mg"
 
 
def _inject_header_css():
    st.markdown(
        """
        <style>
        .lemuria-header {
            position: sticky;
            top: 0;
            z-index: 40;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 4px;
            border-bottom: 1px solid #1e293b;
            background: rgba(2, 6, 23, 0.85);
            backdrop-filter: blur(8px);
            margin-bottom: 8px;
        }
        .lemuria-logo {
            display: flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
        }
        .lemuria-logo-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 40px;
            width: 40px;
            border-radius: 12px;
            background: #2563eb;
            color: white;
            font-size: 18px;
            box-shadow: 0 10px 15px -3px rgba(59,130,246,0.20);
        }
        .lemuria-logo-text {
            font-size: 20px;
            font-weight: 800;
            color: white;
            letter-spacing: -0.02em;
            margin-left: 4px;
        }
        .lemuria-logo-badge {
            font-size: 10px;
            font-family: monospace;
            font-weight: 600;
            color: #60a5fa;
            background: rgba(59,130,246,0.10);
            padding: 2px 6px;
            border-radius: 9999px;
            margin-left: 4px;
            text-transform: uppercase;
        }
        .lemuria-nav {
            display: flex;
            align-items: center;
            gap: 24px;
        }
        .lemuria-nav a {
            font-size: 14px;
            font-weight: 500;
            color: #cbd5e1;
            text-decoration: none;
        }
        .lemuria-nav a:hover {
            color: #60a5fa;
        }
        .lemuria-nav .lemuria-ecommerce-link {
            font-weight: 700;
            color: #60a5fa;
            background: rgba(59,130,246,0.10);
            padding: 6px 12px;
            border-radius: 12px;
            border: 1px solid rgba(59,130,246,0.20);
        }
        @media (max-width: 768px) {
            .lemuria-nav { display: none; }
        }
        </style>
        """,
        unsafe_allow_html=True,
    )
 
 
def render_header(current_user, on_login, on_logout, on_open_admin, ecommerce_url=None):
    """
    Équivalent de <Header currentUser onLogin onLogout onOpenAdmin ecommerceUrl />
 
    Args:
        current_user: dict {"email", "name", "avatar"} ou None
        on_login: fonction(email, name) -> None (équivalent handleLogin)
        on_logout: fonction() -> None (équivalent handleLogout)
        on_open_admin: fonction() -> None (équivalent onOpenAdmin, doit passer show_admin à True)
        ecommerce_url: str optionnel, URL de la boutique externe
    """
    _inject_header_css()
 
    is_admin = bool(current_user and current_user.get("email") == ADMIN_EMAIL)
    ecom_url = ecommerce_url or "https://boutique.lemuria.mg"
 
    # NB : l'ancre id="hero" ciblée par le logo est posée dans streamlit_app.py,
    # au début de la section Hero (pas ici, pour éviter un id HTML dupliqué).
    st.markdown(
        f"""
        <div class="lemuria-header">
            <a href="#hero" class="lemuria-logo">
                <span class="lemuria-logo-icon">✨</span>
                <span class="lemuria-logo-text">LEMURIA<span class="lemuria-logo-badge">Hub IA</span></span>
            </a>
            <nav class="lemuria-nav">
                <a href="#workspace">Outils IA</a>
                <a href="#boutique">Boutique</a>
                <a href="#blog">Blog Tech</a>
                <a href="#boutique">Offres du Mois</a>
                <a href="{ecom_url}" target="_blank" rel="noopener noreferrer" class="lemuria-ecommerce-link">E-commerce ↗</a>
            </nav>
        </div>
        """,
        unsafe_allow_html=True,
    )
 
    # Zone d'actions : bouton admin, profil / connexion (colonnes natives Streamlit,
    # alignées à droite pour se rapprocher du header-actions React)
    spacer_col, admin_col, account_col = st.columns([6, 2, 2])
 
    with admin_col:
        if is_admin:
            if st.button("🛡️ Dashboard Admin", key="header_admin_btn", use_container_width=True):
                on_open_admin()
                st.rerun()
 
    with account_col:
        if current_user:
            with st.popover(f"👤 {current_user['name']}", use_container_width=True):
                st.caption(f"Connecté en tant que\n\n**{current_user['email']}**")
                if st.button("🚪 Déconnexion", key="header_logout_btn", use_container_width=True):
                    on_logout()
                    st.rerun()
        else:
            with st.popover("🔑 Connexion Google", use_container_width=True):
                st.caption("Simuler Google Sign-In")
                if st.button("Prince R. — Compte client", key="login_client_btn", use_container_width=True):
                    on_login("princerakotondrasamba@gmail.com", "Prince Rakotondrasamba")
                    st.rerun()
                if st.button("🛡️ Admin Lemuria", key="login_admin_btn", use_container_width=True):
                    on_login(ADMIN_EMAIL, "Masoivoho Lemuria")
                    st.rerun()
