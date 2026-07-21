import React, { useState, useEffect } from "react";
import { X, Shield, Activity, Save, RefreshCw, Power, Check, Info, TrendingUp, Users, ShoppingBag, ExternalLink, Newspaper } from "lucide-react";
import { AdminSettings, AnalyticsData, BlogPost } from "../types";

interface AdminDashboardProps {
  onClose: () => void;
  onSettingsChange: () => void;
}

export default function AdminDashboard({ onClose, onSettingsChange }: AdminDashboardProps) {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  // Form Fields
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");
  const [carouselUrls, setCarouselUrls] = useState<{ [key: string]: string }>({});
  const [partnerToggles, setPartnerToggles] = useState({
    google_flow: true,
    pikverse: true,
    midjourney_flux: true
  });
  const [backendInstructions, setBackendInstructions] = useState("");
  const [ecommerceUrl, setEcommerceUrl] = useState("");
  const [blogArticles, setBlogArticles] = useState<BlogPost[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/analytics")
      ]);

      const settingsData: AdminSettings = await settingsRes.json();
      const analyticsData: AnalyticsData = await analyticsRes.json();

      setSettings(settingsData);
      setAnalytics(analyticsData);

      // Populate form fields
      setPromoCode(settingsData.promoCode);
      setPromoDiscount(settingsData.promoDiscount);
      setPartnerToggles(settingsData.partners);
      setBackendInstructions(settingsData.backendInstructions || "");
      setEcommerceUrl(settingsData.ecommerceUrl || "");
      setBlogArticles(settingsData.blogArticles || []);
      
      const urls: { [key: string]: string } = {};
      settingsData.carousel.forEach(item => {
        urls[item.id] = item.url;
      });
      setCarouselUrls(urls);

    } catch (error) {
      console.error("Error loading admin dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePartner = async (partnerKey: keyof typeof partnerToggles) => {
    const updatedToggles = {
      ...partnerToggles,
      [partnerKey]: !partnerToggles[partnerKey]
    };
    setPartnerToggles(updatedToggles);

    // Auto save toggles for instant action reactivity
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partners: updatedToggles })
      });
      onSettingsChange();
      triggerToast();
    } catch (error) {
      console.error("Error saving partner toggles:", error);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    
    // Construct updated carousel array
    const updatedCarousel = settings.carousel.map(item => ({
      ...item,
      url: carouselUrls[item.id] || item.url
    }));

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoCode,
          promoDiscount,
          carousel: updatedCarousel,
          partners: partnerToggles,
          backendInstructions,
          ecommerceUrl,
          blogArticles
        })
      });

      if (res.ok) {
        onSettingsChange();
        triggerToast();
      }
    } catch (error) {
      console.error("Error saving admin settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const triggerToast = () => {
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  return (
    <div id="admin-dashboard-overlay" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-end animate-fade-in">
      <div 
        id="admin-dashboard-container"
        className="w-full max-w-4xl h-full bg-slate-900 border-l border-slate-800 flex flex-col text-slate-100 shadow-2xl p-6 sm:p-8 overflow-y-auto"
      >
        
        {/* Header Dashboard */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Tableau de Bord Administrateur</h1>
              <p className="text-xs text-slate-400">Lemuria Hub IA Madagascar • Masoivoho Panel</p>
            </div>
          </div>
          <button 
            id="close-admin-btn"
            onClick={onClose}
            className="rounded-xl p-2 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all text-slate-400"
            title="Fermer le panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic Success Notification */}
        {successToast && (
          <div id="admin-success-toast" className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-400 flex items-center gap-3 text-xs sm:text-sm animate-bounce">
            <Check className="h-5 w-5 flex-shrink-0 bg-emerald-500 text-slate-900 rounded-full p-0.5" />
            <span><strong>Succès !</strong> Configuration de Lemuria mise à jour en temps réel avec succès.</span>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-xs text-slate-400">Récupération des métriques et configurations...</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Row 1: Analytics Counters */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-blue-500" />
                <span>Mesures de Trafic et Conversions (Temps Réel)</span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Stats 1 */}
                <div id="stat-gen" className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Générations Totales</span>
                  <span className="text-2xl font-black text-white mt-1 block">
                    {(analytics?.metrics.storyboard_gen || 0) + (analytics?.metrics.image_to_prompt || 0) + (analytics?.metrics.pikverse_anim || 0)}
                  </span>
                  <span className="text-[9px] text-emerald-400 mt-1 block flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3 inline" /> +14% cette semaine
                  </span>
                </div>
                {/* Stats 2 */}
                <div id="stat-aff-flow" className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Clics Cible Flow</span>
                  <span className="text-2xl font-black text-blue-400 mt-1 block">
                    {analytics?.metrics.affiliate_click_flow || 0}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1 block">Lien ref/flow</span>
                </div>
                {/* Stats 3 */}
                <div id="stat-aff-pik" className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Clics ref/pikverse</span>
                  <span className="text-2xl font-black text-purple-400 mt-1 block">
                    {analytics?.metrics.affiliate_click_pikverse || 0}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1 block">Lien ref/pikverse</span>
                </div>
                {/* Stats 4 */}
                <div id="stat-copie" className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Prompts Copiés</span>
                  <span className="text-2xl font-black text-amber-400 mt-1 block">
                    {analytics?.metrics.prompt_copied || 0}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1 block">Copiés par clipboard</span>
                </div>
              </div>

              {/* Boutique specific secondary row */}
              <div className="grid grid-cols-2 gap-4">
                <div id="stat-boutique-view" className="bg-slate-800/40 border border-slate-800 rounded-2xl p-3 flex justify-between items-center px-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="text-[11px] text-slate-300 font-medium">Vues Boutique</span>
                  </div>
                  <span className="text-base font-bold text-slate-200">{analytics?.metrics.boutique_view || 0}</span>
                </div>
                <div id="stat-boutique-clicks" className="bg-slate-800/40 border border-slate-800 rounded-2xl p-3 flex justify-between items-center px-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-slate-400" />
                    <span className="text-[11px] text-slate-300 font-medium">Clics d'achat pack</span>
                  </div>
                  <span className="text-base font-bold text-slate-200">{analytics?.metrics.boutique_buy_click || 0}</span>
                </div>
              </div>
            </div>

            {/* Row 2: API switches & Promotion Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* API Switches Form Card */}
              <div className="bg-slate-800/30 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Power className="h-4 w-4 text-blue-500" />
                  <span>Statut des API Partenaires</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Désactivez temporairement un service partenaire pour basculer automatiquement l'inférence vers le système local de secours.
                </p>

                <div className="space-y-3 pt-2">
                  {/* Switch 1 */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <span className="text-xs font-bold block text-white">Google Flow Beta Router</span>
                      <span className="text-[10px] text-slate-400">Séquences de storyboards vidéo</span>
                    </div>
                    <button
                      id="toggle-flow-api"
                      onClick={() => handleTogglePartner("google_flow")}
                      className={`h-6 w-11 rounded-full relative p-0.5 transition-colors ${partnerToggles.google_flow ? "bg-blue-600" : "bg-slate-700"}`}
                    >
                      <span className={`h-5 w-5 bg-white rounded-full block transition-transform ${partnerToggles.google_flow ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                  
                  {/* Switch 2 */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <span className="text-xs font-bold block text-white">PikverseAI Engine</span>
                      <span className="text-[10px] text-slate-400">Générateur d'animations Pika</span>
                    </div>
                    <button
                      id="toggle-pikverse-api"
                      onClick={() => handleTogglePartner("pikverse")}
                      className={`h-6 w-11 rounded-full relative p-0.5 transition-colors ${partnerToggles.pikverse ? "bg-blue-600" : "bg-slate-700"}`}
                    >
                      <span className={`h-5 w-5 bg-white rounded-full block transition-transform ${partnerToggles.pikverse ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>

                  {/* Switch 3 */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <span className="text-xs font-bold block text-white">Flux / Midjourney Pro Router</span>
                      <span className="text-[10px] text-slate-400">Traducteur d'image-to-prompt master</span>
                    </div>
                    <button
                      id="toggle-flux-api"
                      onClick={() => handleTogglePartner("midjourney_flux")}
                      className={`h-6 w-11 rounded-full relative p-0.5 transition-colors ${partnerToggles.midjourney_flux ? "bg-blue-600" : "bg-slate-700"}`}
                    >
                      <span className={`h-5 w-5 bg-white rounded-full block transition-transform ${partnerToggles.midjourney_flux ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Promo Code Form */}
              <div className="bg-slate-800/30 border border-slate-800 rounded-3xl p-5">
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Save className="h-4 w-4 text-blue-500" />
                    <span>Contenu Dynamique & Promo</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Éditez le code promotionnel mensuel qui s'affichera instantanément dans la boutique pour tous les visiteurs.
                  </p>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Code Promo du Mois</label>
                      <input
                        id="admin-promo-code-input"
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-xs text-white outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avantages & Réduction</label>
                      <input
                        id="admin-promo-discount-input"
                        type="text"
                        value={promoDiscount}
                        onChange={(e) => setPromoDiscount(e.target.value)}
                        className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-xs text-white outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    id="save-promo-settings-btn"
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-xl bg-blue-600 text-xs font-bold py-2.5 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>{saving ? "Enregistrement..." : "Appliquer les Modifications"}</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Row: Backend Instructions & E-commerce Configuration */}
            <div className="bg-slate-800/30 border border-slate-800 rounded-3xl p-5">
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Configuration Backend IA & E-commerce</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Définissez les instructions de scripts et structures que le modèle IA suivra en tâche de fond, ainsi que le lien externe de redirection de l'onglet E-commerce.
                </p>

                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Instructions Système / Directives Prompting Backend
                    </label>
                    <textarea
                      id="admin-backend-instructions-input"
                      rows={3}
                      value={backendInstructions}
                      onChange={(e) => setBackendInstructions(e.target.value)}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-xs text-white outline-none focus:border-blue-500 font-mono"
                      placeholder="Ex: Vous êtes Lemuria AI, un assistant spécialisé..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      URL de redirection E-commerce externe
                    </label>
                    <input
                      id="admin-ecommerce-url-input"
                      type="url"
                      value={ecommerceUrl}
                      onChange={(e) => setEcommerceUrl(e.target.value)}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-xs text-white font-mono outline-none focus:border-blue-500"
                      placeholder="https://..."
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    id="save-backend-settings-btn"
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-blue-600 text-xs font-bold px-6 py-2.5 hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>{saving ? "Enregistrement..." : "Appliquer IA & E-commerce"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Row 3: Edit Carousel URLs */}
            <div className="bg-slate-800/30 border border-slate-800 rounded-3xl p-5">
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                  <span>Gestion des URLs d'affiliation (Carrousel)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Définissez les adresses cibles vers lesquelles les utilisateurs sont redirigés en cliquant sur les 5 slides du carrousel d'accueil.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {settings?.carousel.map(item => (
                    <div key={item.id}>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.name}</label>
                      <input
                        id={`admin-url-${item.id}`}
                        type="url"
                        value={carouselUrls[item.id] || ""}
                        onChange={(e) => setCarouselUrls({ ...carouselUrls, [item.id]: e.target.value })}
                        className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-xs text-white font-mono outline-none focus:border-blue-500"
                        placeholder="https://..."
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    id="save-carousel-settings-btn"
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-blue-600 text-xs font-bold px-6 py-2.5 hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Check className="h-4 w-4" />
                    <span>{saving ? "Sauvegarde..." : "Enregistrer les Liens"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Row 4: Edit Blog articles */}
            <div className="bg-slate-800/30 border border-slate-800 rounded-3xl p-5">
              <form onSubmit={handleSaveSettings} className="space-y-5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Newspaper className="h-4 w-4 text-blue-500" />
                  <span>Gestion du Blog d'Actualité IA & Tech</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Modifiez les articles de blog. Chaque article peut avoir son propre titre, description, image d'illustration et lien partenaire d'affiliation externe.
                </p>

                <div className="space-y-6 pt-1">
                  {blogArticles.map((article, index) => (
                    <div key={article.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-blue-400">Article #{index + 1}</span>
                        <span className="text-[9px] font-mono text-slate-500">{article.id}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Title input */}
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Titre de l'article</label>
                          <input
                            type="text"
                            value={article.title}
                            onChange={(e) => {
                              const updated = [...blogArticles];
                              updated[index] = { ...article, title: e.target.value };
                              setBlogArticles(updated);
                            }}
                            className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-xs text-white outline-none focus:border-blue-500"
                            required
                          />
                        </div>

                        {/* Description input */}
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description / Résumé</label>
                          <textarea
                            rows={2}
                            value={article.description}
                            onChange={(e) => {
                              const updated = [...blogArticles];
                              updated[index] = { ...article, description: e.target.value };
                              setBlogArticles(updated);
                            }}
                            className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-xs text-white outline-none focus:border-blue-500 leading-relaxed"
                            required
                          />
                        </div>

                        {/* Image URL input */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">URL de l'image (Illustration)</label>
                          <input
                            type="url"
                            value={article.imageUrl}
                            onChange={(e) => {
                              const updated = [...blogArticles];
                              updated[index] = { ...article, imageUrl: e.target.value };
                              setBlogArticles(updated);
                            }}
                            className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-xs text-white font-mono outline-none focus:border-blue-500"
                            placeholder="https://images.unsplash.com/..."
                            required
                          />
                        </div>

                        {/* Partner URL input */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lien Partenaire (Redirection)</label>
                          <input
                            type="url"
                            value={article.partnerUrl}
                            onChange={(e) => {
                              const updated = [...blogArticles];
                              updated[index] = { ...article, partnerUrl: e.target.value };
                              setBlogArticles(updated);
                            }}
                            className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-xs text-white font-mono outline-none focus:border-blue-500"
                            placeholder="https://..."
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    id="save-blog-settings-btn"
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-blue-600 text-xs font-bold px-6 py-2.5 hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Check className="h-4 w-4" />
                    <span>{saving ? "Sauvegarde..." : "Enregistrer les Articles"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Row 4: Live logs console */}
            <div className="bg-slate-850/60 border border-slate-800/80 rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-emerald-500" />
                <span>Console des Événements Récents (Log Analytics)</span>
              </h4>
              
              <div id="logs-console" className="rounded-2xl border border-slate-800 bg-slate-950 p-4 h-48 overflow-y-auto font-mono text-[10px] text-slate-300 space-y-2">
                {analytics?.logs.map((log, index) => {
                  let eventColor = "text-sky-400";
                  if (log.event_type.includes("click") || log.event_type.includes("buy")) eventColor = "text-yellow-400";
                  else if (log.event_type === "prompt_copied") eventColor = "text-purple-400";

                  return (
                    <div key={index} className="flex justify-between hover:bg-slate-900/50 p-1 rounded">
                      <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className={`font-semibold ${eventColor}`}>{log.event_type.toUpperCase()}</span>
                      <span className="text-blue-400">{log.partner_id.toUpperCase()}</span>
                      <span className="text-slate-400 truncate max-w-[120px]" title={log.user_id}>{log.user_id}</span>
                    </div>
                  );
                })}
                {(!analytics?.logs || analytics.logs.length === 0) && (
                  <p className="text-xs text-slate-500 text-center py-8">Aucun événement enregistré pour le moment.</p>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
