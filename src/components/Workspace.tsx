import streamlit as st
import requests
 
API_BASE = "http://localhost:5000"  # à synchroniser avec streamlit_app.py
 
LOADING_STEPS = [
    "Analyse de l'image et du concept créatif...",
    "Exploration du folklore visuel de Madagascar...",
    "Ajustement du style cinématique & éclairages...",
    "Optimisation des prompts pour Google Flow Beta & PikverseAI...",
    "Finalisation du découpage séquentiel...",
]
 
MODE_LABELS = {
    "storyboard": ("🎬", "Storyboard"),
    "prompt": ("📄", "Image-to-Prompt"),
    "animation": ("🔄", "Anim Pika"),
    "topmodel": ("📷", "Top Model"),
}
 
MODE_PLACEHOLDERS = {
    "storyboard": (
        "Décrivez le scénario : Ex. Un jeune créateur à Antananarivo utilise son "
        "smartphone pour filmer un paysage de baobabs au coucher du soleil avec un "
        "style cinématographique..."
    ),
    "animation": (
        "Décrivez le mouvement souhaité pour Pika : Ex. Mouvement de caméra lent vers "
        "l'avant, vent léger dans les arbres, éclairage cinématique..."
    ),
    "topmodel": "Ex. Modèle photo professionnel portant un vêtement élégant dans un studio de mode moderne...",
    "prompt": "Décrivez l'image que vous souhaitez convertir en prompt master pour Midjourney ou Flux...",
}
 
MODE_ENDPOINTS = {
    "storyboard": "/api/generate-storyboard",
    "animation": "/api/generate-animation",
    "topmodel": "/api/generate-topmodel",
    "prompt": "/api/generate-prompt",
}
 
MODE_EVENT_TYPES = {
    "storyboard": "storyboard_gen",
    "animation": "pikverse_anim",
    "topmodel": None,  # pas de mapping analytics dédié dans le code source original
    "prompt": "image_to_prompt",
}
 
MODE_PARTNERS = {
    "storyboard": "google_flow",
    "animation": "pikverse",
    "topmodel": "midjourney_flux",
    "prompt": "midjourney_flux",
}
 
MODE_GENERATE_LABELS = {
    "storyboard": "Générer le Storyboard Video",
    "animation": "Générer le Prompt Animation",
    "topmodel": "Générer le Concept Top Model",
    "prompt": "Traduire en Prompt Master",
}
 
 
def _init_state():
    defaults = {
        "ws_mode": "storyboard",
        "ws_user_prompt": "",
        "ws_image_bytes": None,
        "ws_image_b64": None,
        "ws_aspect_ratio": "16:9",
        "ws_num_scenes": 4,
        "ws_style_preset": "Cinématique 8K",
        "ws_loading": False,
        "ws_error_msg": None,
        "ws_storyboard_result": None,
        "ws_prompt_result": None,
        "ws_animation_result": None,
        "ws_topmodel_result": None,
        "ws_topmodel_sub_option": "upload",
        "ws_show_render_options": False,
        "ws_rendered_scenes": {},
    }
    for key, val in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = val
 
 
def _clear_results():
    st.session_state.ws_storyboard_result = None
    st.session_state.ws_prompt_result = None
    st.session_state.ws_animation_result = None
    st.session_state.ws_topmodel_result = None
 
 
def _clear_image():
    st.session_state.ws_image_bytes = None
    st.session_state.ws_image_b64 = None
 
 
def _handle_generate(mode, on_track_event):
    """Équivalent de handleGenerate()."""
    if not st.session_state.ws_user_prompt.strip() and not st.session_state.ws_image_b64:
        st.session_state.ws_error_msg = "Veuillez entrer une description ou importer une image d'inspiration."
        return
 
    st.session_state.ws_error_msg = None
    st.session_state.ws_show_render_options = False
    st.session_state.ws_rendered_scenes = {}
    _clear_results()
 
    payload = {
        "prompt": st.session_state.ws_user_prompt,
        "image": st.session_state.ws_image_b64 or "",
        "aspectRatio": st.session_state.ws_aspect_ratio,
        "numScenes": st.session_state.ws_num_scenes,
        "stylePreset": st.session_state.ws_style_preset,
    }
    endpoint = MODE_ENDPOINTS[mode]
 
    with st.spinner("Génération Lemuria IA en cours... " + LOADING_STEPS[0]):
        try:
            response = requests.post(f"{API_BASE}{endpoint}", json=payload, timeout=60)
            if not response.ok:
                err_data = response.json() if response.content else {}
                raise Exception(err_data.get("error", "Échec de la génération par l'IA"))
 
            data = response.json()
 
            event_type = MODE_EVENT_TYPES[mode]
            if event_type:
                on_track_event(event_type, MODE_PARTNERS[mode])
 
            if mode == "storyboard":
                st.session_state.ws_storyboard_result = data
            elif mode == "animation":
                st.session_state.ws_animation_result = data
            elif mode == "topmodel":
                st.session_state.ws_topmodel_result = data
            else:
                st.session_state.ws_prompt_result = data
 
        except Exception as e:
            print(f"Génération error: {e}")  # équivalent console.error
            st.session_state.ws_error_msg = str(e) or "Une erreur est survenue pendant la génération. Réessayez."
 
 
def _handle_render_scene_image(scene_number, scene_prompt):
    """Équivalent de handleRenderSceneImage()."""
    try:
        res = requests.post(
            f"{API_BASE}/api/generate-scene-image",
            json={"prompt": scene_prompt, "sceneNumber": scene_number},
            timeout=30,
        )
        if res.ok:
            data = res.json()
            st.session_state.ws_rendered_scenes[scene_number] = data.get("imageUrl")
    except Exception as e:
        print(f"Error rendering scene image: {e}")  # équivalent console.error
 
 
def render_workspace(current_user, active_partners, on_track_event, on_open_auth_modal=None):
    """
    Équivalent de <Workspace currentUser onTrackEvent onOpenAuthModal />
 
    Args:
        current_user: dict {"email", "name"} ou None
        active_partners: dict des toggles partenaires (non utilisé pour l'instant
            dans le rendu, réservé pour désactiver un mode si le partenaire est off)
        on_track_event: fonction(event_type, partner_id) -> None
        on_open_auth_modal: fonction() -> None, optionnel (bug préexistant dans le
            code source : cette prop n'était jamais câblée depuis App.tsx)
    """
    _init_state()
 
    st.markdown('<div id="workspace"></div>', unsafe_allow_html=True)
 
    header_col, action_col = st.columns([4, 1])
    with header_col:
        st.markdown(
            """
            <div style="display:inline-flex; align-items:center; gap:6px; border-radius:9999px;
                        background:rgba(59,130,246,0.10); padding:4px 12px; font-size:12px;
                        font-weight:600; color:#60a5fa; border:1px solid rgba(59,130,246,0.20); margin-bottom:8px;">
                ✨ Studio d'Inférence IA Madagascar
            </div>
            <h1 style="font-size:26px; font-weight:800; color:white; margin:0;">
                Espace de Création & Storyboarding
            </h1>
            """,
            unsafe_allow_html=True,
        )
    with action_col:
        if not current_user:
            if st.button("Se Connecter", key="workspace_login_btn", use_container_width=True):
                if on_open_auth_modal:
                    on_open_auth_modal()
                else:
                    st.info("Utilisez le bouton « Connexion Google » en haut de la page pour vous connecter.")
 
    form_col, output_col = st.columns([5, 7], gap="large")
 
    with form_col:
        _render_input_form(on_track_event)
 
    with output_col:
        _render_output_panel()
 
 
def _render_input_form(on_track_event):
    with st.container(border=True):
        # 1. Sélecteur de mode
        st.markdown(
            '<p style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; '
            'margin-bottom:8px;">1. Sélectionner le Mode de Traitement</p>',
            unsafe_allow_html=True,
        )
        mode_cols = st.columns(4)
        for (mode_key, (icon, label)), col in zip(MODE_LABELS.items(), mode_cols):
            with col:
                is_active = st.session_state.ws_mode == mode_key
                if st.button(
                    f"{icon}\n{label}",
                    key=f"mode_btn_{mode_key}",
                    use_container_width=True,
                    type="primary" if is_active else "secondary",
                ):
                    st.session_state.ws_mode = mode_key
                    st.session_state.ws_error_msg = None
                    st.rerun()
 
        mode = st.session_state.ws_mode
 
        # 2. Image source
        st.markdown(
            '<p style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; '
            'margin:16px 0 8px 0;">2. Image Source</p>',
            unsafe_allow_html=True,
        )
 
        if mode == "topmodel":
            sub_col1, sub_col2 = st.columns(2)
            with sub_col1:
                if st.button("📁 Uploader mon produit", key="topmodel_upload_btn", use_container_width=True):
                    st.session_state.ws_topmodel_sub_option = "upload"
                    st.rerun()
            with sub_col2:
                if st.button("📸 Prendre un selfie", key="topmodel_selfie_btn", use_container_width=True):
                    st.session_state.ws_topmodel_sub_option = "selfie"
                    st.rerun()
 
        if mode == "topmodel" and st.session_state.ws_topmodel_sub_option == "selfie":
            photo = st.camera_input("Photo selfie", label_visibility="collapsed", key="ws_camera")
            if photo is not None:
                st.session_state.ws_image_bytes = photo.getvalue()
                import base64
                st.session_state.ws_image_b64 = base64.b64encode(photo.getvalue()).decode("utf-8")
        else:
            if st.session_state.ws_image_bytes:
                st.image(st.session_state.ws_image_bytes, use_container_width=True)
                if st.button("Effacer l'image", key="clear_image_btn"):
                    _clear_image()
                    st.rerun()
            else:
                uploaded = st.file_uploader(
                    "Glissez une image ou cliquez pour parcourir (PNG, JPG, WEBP jusqu'à 10MB)",
                    type=["png", "jpg", "jpeg", "webp"],
                    key="ws_file_uploader",
                )
                if uploaded is not None:
                    import base64
                    img_bytes = uploaded.getvalue()
                    st.session_state.ws_image_bytes = img_bytes
                    st.session_state.ws_image_b64 = base64.b64encode(img_bytes).decode("utf-8")
                    st.rerun()
 
        # 3. Description du concept
        st.markdown(
            '<p style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; '
            'margin:16px 0 8px 0;">3. Description du Concept / Histoire</p>',
            unsafe_allow_html=True,
        )
        st.session_state.ws_user_prompt = st.text_area(
            "Description",
            value=st.session_state.ws_user_prompt,
            placeholder=MODE_PLACEHOLDERS[mode],
            height=110,
            label_visibility="collapsed",
            key="ws_prompt_textarea",
        )
 
        # Options avancées (storyboard uniquement)
        if mode == "storyboard":
            ratio_col, scenes_col, style_col = st.columns(3)
            with ratio_col:
                st.session_state.ws_aspect_ratio = st.selectbox(
                    "Ratio",
                    ["16:9", "9:16", "1:1"],
                    index=["16:9", "9:16", "1:1"].index(st.session_state.ws_aspect_ratio),
                    format_func=lambda r: {"16:9": "16:9 (YouTube)", "9:16": "9:16 (TikTok/Shorts)", "1:1": "1:1 (Instagram)"}[r],
                )
            with scenes_col:
                st.session_state.ws_num_scenes = st.selectbox(
                    "Nb Scènes",
                    [3, 4, 6],
                    index=[3, 4, 6].index(st.session_state.ws_num_scenes),
                    format_func=lambda n: f"{n} Scènes",
                )
            with style_col:
                styles = ["Cinématique 8K", "Cyberpunk Mada", "Aquarelle Nature", "Documentaire HD"]
                st.session_state.ws_style_preset = st.selectbox(
                    "Style Visuel", styles, index=styles.index(st.session_state.ws_style_preset)
                )
 
        # Bouton de génération
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button(
            f"✨ {MODE_GENERATE_LABELS[mode]}",
            key="generate_action_btn",
            use_container_width=True,
            type="primary",
            disabled=st.session_state.ws_loading,
        ):
            _handle_generate(mode, on_track_event)
            st.rerun()
 
        if st.session_state.ws_error_msg:
            st.error(st.session_state.ws_error_msg, icon="⚠️")
 
 
def _render_output_panel():
    with st.container(border=True):
        header_col, engine_col = st.columns([3, 2])
        with header_col:
            st.markdown(
                '<p style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase;">'
                'Résultat Inférence IA</p>',
                unsafe_allow_html=True,
            )
        with engine_col:
            st.markdown(
                '<p style="font-size:10px; font-family:monospace; color:#64748b; text-align:right;">'
                'Engine: Gemini Flash 2.5 • Lemuria Core</p>',
                unsafe_allow_html=True,
            )
        st.divider()
 
        storyboard = st.session_state.ws_storyboard_result
        prompt_res = st.session_state.ws_prompt_result
        animation = st.session_state.ws_animation_result
        topmodel = st.session_state.ws_topmodel_result
 
        has_result = storyboard or prompt_res or animation or topmodel
 
        # État vide par défaut
        if not has_result:
            st.markdown(
                """
                <div style="text-align:center; padding: 48px 16px;">
                    <div style="font-size:32px; margin-bottom:12px;">🎬</div>
                    <h3 style="font-size:15px; font-weight:800; color:#cbd5e1;">
                        Prêt à générer votre contenu visuel
                    </h3>
                    <p style="font-size:12px; color:#64748b; max-width:400px; margin:8px auto;">
                        Remplissez la description ou uploadez une image à gauche, puis cliquez sur le
                        bouton de génération pour obtenir vos prompts et découpages optimisés.
                    </p>
                </div>
                """,
                unsafe_allow_html=True,
            )
 
        # --- Résultat Storyboard ---
        if storyboard:
            st.markdown(f"**{storyboard.get('title', '')}**")
            st.caption(storyboard.get("summary", ""))
            st.markdown("---")
 
            for scene in storyboard.get("scenes", []):
                scene_num = scene.get("sceneNumber")
                with st.container(border=True):
                    st.markdown(
                        f":blue-background[SCÈNE {scene_num} • {scene.get('cameraAngle', '')}]"
                    )
                    st.code(scene.get("visualPrompt", ""), language=None)
                    st.caption(f"🎬 Action : {scene.get('actionDescription', '')}")
 
                    rendered = st.session_state.ws_rendered_scenes.get(scene_num)
                    if rendered:
                        st.image(rendered, use_container_width=True)
                    elif st.session_state.ws_show_render_options:
                        if st.button(
                            f"✨ Aperçu Visuel IA Scène {scene_num}",
                            key=f"render_scene_{scene_num}",
                        ):
                            with st.spinner("Génération visuelle..."):
                                _handle_render_scene_image(scene_num, scene.get("visualPrompt", ""))
                            st.rerun()
 
            if not st.session_state.ws_show_render_options:
                if st.button("✨ Activer le Rendu d'Aperçu Visuel des Scènes", key="enable_render_options"):
                    st.session_state.ws_show_render_options = True
                    st.rerun()
 
            st.markdown("---")
            all_prompts = "\n\n".join(s.get("visualPrompt", "") for s in storyboard.get("scenes", []))
            copy_col, flow_col, pik_col = st.columns(3)
            with copy_col:
                if st.button("📋 Copier Tous les Prompts", key="copy_all_prompts", use_container_width=True):
                    st.session_state.on_track_event_pending = ("prompt_copied", "google_flow")
                    st.code(all_prompts, language=None)
            with flow_col:
                st.link_button(
                    "Google Flow Beta ↗",
                    "https://play.google.com/store/apps/details?id=com.google.android.apps.labs.whisk",
                    use_container_width=True,
                )
            with pik_col:
                st.link_button("PikverseAI ↗", "https://bit.ly/piksverse", use_container_width=True)
 
        # --- Résultat Top Model ---
        if topmodel:
            st.markdown("**Concept de Mode & Campagne IA**")
            st.markdown(f"*\u201c{topmodel.get('summary', '')}\u201d*")
            st.markdown("---")
 
            in_col, out_col = st.columns(2)
            with in_col:
                st.markdown(":blue-background[📸 Image 1 (Input)]")
                if st.session_state.ws_image_bytes:
                    st.image(st.session_state.ws_image_bytes, use_container_width=True)
                else:
                    st.caption("Aucune image source fournie")
                st.code(topmodel.get("prompt1", ""), language=None)
            with out_col:
                st.markdown(":green-background[✨ Image 2 (Output)]")
                st.image(
                    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
                    use_container_width=True,
                )
                st.code(topmodel.get("prompt2", ""), language=None)
 
            st.info("💡 Astuce : Copier les prompts dans votre bloc note")
            tm_flow_col, tm_pik_col = st.columns(2)
            with tm_flow_col:
                st.link_button(
                    "Google Flow Beta ↗",
                    "https://play.google.com/store/apps/details?id=com.google.android.apps.labs.whisk",
                    use_container_width=True,
                )
            with tm_pik_col:
                st.link_button("PikverseAI ↗", "https://bit.ly/piksverse", use_container_width=True)
 
        # --- Résultat Image -> Prompt Master ---
        if prompt_res:
            st.markdown("**Analyse Visuelle & Prompt Récupéré**")
            st.code(prompt_res.get("generatedPrompt", ""), language=None)
 
            st.markdown(":blue-background[Éléments Stylistiques Identifiés :]")
            keywords = prompt_res.get("styleKeywords", [])
            st.markdown(" ".join(f"`#{kw}`" for kw in keywords))
 
        # --- Résultat Animation ---
        if animation:
            st.markdown(":green-background[Prompt d'Animation Pika / PikverseAI]")
            st.code(animation.get("animationPrompt", ""), language=None)
 
            st.markdown("**Paramètres Caméra Recommandés :**")
            st.markdown(f"`{animation.get('cameraMotion', '')}`")
 
            st.link_button("Lancer sur PikverseAI ↗", "https://bit.ly/piksverse", use_container_width=True)
 
        st.markdown(
            '<p style="font-size:10px; color:#475569; text-align:center; margin-top:24px; '
            'border-top:1px solid #1e293b; padding-top:12px;">'
            'Lemuria AI • Traitement ultra-rapide optimisé pour les réseaux 3G/4G/5G Madagascar</p>',
            unsafe_allow_html=True,
        )
