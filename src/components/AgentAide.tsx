import streamlit as st
import requests
from datetime import datetime
 
API_BASE = "http://localhost:5000"  # à synchroniser avec streamlit_app.py
 
 
def _now():
    return datetime.now().strftime("%H:%M")
 
 
def _init_messages():
    if "maki_messages" not in st.session_state:
        st.session_state.maki_messages = [
            {
                "sender": "maki",
                "text": (
                    "Salama e! 🐒✨ Je suis Maki, ton conseiller Chibi 3D en vidéos virales "
                    "de Madagascar ! Je suis un as pour capter l'attention de l'audience locale "
                    "et internationale en moins de 3 secondes."
                ),
                "time": _now(),
            },
            {
                "sender": "maki",
                "text": (
                    "Besoin d'un Hook en béton pour ton storyboard ? Ou des conseils pour choisir "
                    "le meilleur ratio et style ? Pose-moi tes questions, je suis là pour propulser "
                    "tes Shorts et TikTok !"
                ),
                "time": _now(),
            },
        ]
 
 
def _send_message(text: str):
    st.session_state.maki_messages.append({"sender": "user", "text": text, "time": _now()})
    try:
        res = requests.post(
            f"{API_BASE}/api/chat-assistant",
            json={
                "message": text,
                "history": [
                    {"sender": m["sender"], "text": m["text"]} for m in st.session_state.maki_messages
                ],
            },
            timeout=15,
        )
        if res.ok:
            reply = res.json().get("text", "")
        else:
            raise Exception("Chat response failed")
        st.session_state.maki_messages.append({"sender": "maki", "text": reply, "time": _now()})
    except Exception as e:
        print(f"Chat error: {e}")  # équivalent console.error
        st.session_state.maki_messages.append(
            {
                "sender": "maki",
                "text": "Maki a glissé sur une branche de baobab ! 🐒🍂 Peux-tu réessayer dans un instant ?",
                "time": _now(),
            }
        )
 
 
def render_agent_aide():
    """Équivalent de <AgentAide /> — assistant chat flottant."""
    _init_messages()
 
    with st.popover("🐒 Aide Maki", use_container_width=False):
        st.markdown(
            """
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                <span style="font-weight:800; font-size:14px;">Maki</span>
                <span style="font-size:9px; font-weight:800; color:#d97706; background:rgba(217,119,6,0.10);
                             padding:1px 6px; border-radius:9999px; text-transform:uppercase;">Coach 3D</span>
            </div>
            <p style="font-size:10px; color:#94a3b8; margin:0 0 12px 0;">
                🟢 En ligne • Expert Shorts Viraux
            </p>
            """,
            unsafe_allow_html=True,
        )
 
        chat_box = st.container(height=320)
        with chat_box:
            for msg in st.session_state.maki_messages:
                is_user = msg["sender"] == "user"
                align = "flex-end" if is_user else "flex-start"
                bubble_color = "#2563eb" if is_user else "#1e293b"
                text_color = "white" if is_user else "#f1f5f9"
                st.markdown(
                    f"""
                    <div style="display:flex; justify-content:{align}; margin-bottom:8px;">
                        <div style="max-width:80%; border-radius:16px; background:{bubble_color};
                                    color:{text_color}; padding:8px 12px; font-size:12px;">
                            <p style="margin:0; white-space:pre-line;">{msg['text']}</p>
                            <span style="font-size:8px; opacity:0.7; display:block; text-align:right; margin-top:4px;">
                                {msg['time']}
                            </span>
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
 
        # Suggestions rapides (équivalent des boutons "Hooks Viraux / Conseils Styles / Sujet Madagascar")
        suggestion_cols = st.columns(3)
        suggestions = [
            ("🔥 Hooks Viraux", "Donne-moi 3 idées de hooks viraux"),
            ("🎨 Conseils Styles", "Quel style d'image choisir pour un short ?"),
            ("🌴 Sujet Madagascar", "Idée de vidéo sur la nature de Madagascar"),
        ]
        for col, (label, question) in zip(suggestion_cols, suggestions):
            with col:
                if st.button(label, key=f"maki_suggestion_{label}", use_container_width=True):
                    _send_message(question)
                    st.rerun()
 
        # Formulaire d'envoi de message
        with st.form(key="maki_chat_form", clear_on_submit=True):
            user_input = st.text_input("Écrivez à Maki...", key="maki_input", label_visibility="collapsed")
            submitted = st.form_submit_button("Envoyer ✈️", use_container_width=True)
            if submitted and user_input.strip():
                _send_message(user_input.strip())
                st.rerun()
