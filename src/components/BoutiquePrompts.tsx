import React, { useState } from "react";
import { ShoppingBag, Tag, Copy, Check, Sparkles, Award, ExternalLink } from "lucide-react";

interface BoutiquePromptsProps {
  promoCode: string;
  promoDiscount: string;
  onTrackClick: (partnerId: string) => void;
}

export default function BoutiquePrompts({ promoCode, promoDiscount, onTrackClick }: BoutiquePromptsProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopiedCode(true);
    onTrackClick("boutique_promo_copy");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleBuyClick = (packName: string) => {
    onTrackClick("boutique_buy_click");
    alert(`🇲🇬 Salama! Merci pour votre intérêt pour le "${packName}". Lemuria Hub est gratuit, et ce pack de prompts sera bientôt disponible en téléchargement direct en monnaie locale (MGA / Mobile Money). Utilisez votre code promo ${promoCode} pour obtenir vos -50%!`);
  };

  const packs = [
    {
      id: "pack-ecommerce",
      title: "Pack E-Commerce Mada",
      tagline: "Vendez vos produits locaux comme des grandes marques",
      description: "Des recettes visuelles précises pour photographier virtuellement vos produits (Artisanat en raphia, huiles essentielles, poivre sauvage, vanille de Sambava) avec des décors luxueux.",
      price: "25 000 Ar",
      discounted: "12 500 Ar",
      features: [
        "40+ Prompts Midjourney & Flux premium",
        "Décors de studio luxueux adaptés au Mobile",
        "Optimisé pour l'artisanat & produits locaux",
        "Guide d'incrustation gratuit"
      ],
      badge: "Best Seller 🇲🇬"
    },
    {
      id: "pack-cinema",
      title: "Pack Storyboard & Cinéma IA",
      tagline: "Produisez vos storyboards de films en 10 minutes",
      description: "Générez des visuels cinématographiques ultra-réalistes de Madagascar : scènes de rue à Antananarivo, forêts humides de l'Est, paysages côtiers du Grand Sud.",
      price: "35 000 Ar",
      discounted: "17 500 Ar",
      features: [
        "50+ Prompts cinématographiques (cadrages, objectifs)",
        "Directives de lumières (golden hour mada, brumes)",
        "Pack de transitions d'animation vidéo",
        "Exemples de storyboards publicitaires réels"
      ],
      badge: "Recommandé Agences"
    }
  ];

  return (
    <section id="boutique-promos-section" className="py-16 bg-[#030712] border-t border-slate-900 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="flex items-center gap-3 mb-8 border-b border-slate-850 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShoppingBag className="h-5.5 w-5.5" />
          </div>
          <div>
            <h2 className="font-sans text-xl font-extrabold text-white tracking-tight">
              Boutique de Prompts & Promotions Lemuria
            </h2>
            <p className="text-xs text-slate-400">
              Des ressources premium adaptées aux créateurs et entrepreneurs malgaches.
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Prompt Packs (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Packs Locaux Disponibles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packs.map((pack) => (
                <div 
                  key={pack.id} 
                  id={pack.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between hover:border-blue-500/30 hover:bg-slate-900/80 transition-all duration-300 shadow-xl relative group"
                >
                  {/* Badge */}
                  <span className="absolute top-4 right-4 bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/20">
                    {pack.badge}
                  </span>

                  <div>
                    <h4 className="text-lg font-extrabold text-white leading-tight mb-1 group-hover:text-blue-400 transition-colors">
                      {pack.title}
                    </h4>
                    <p className="text-xs font-semibold text-slate-400 mb-3">
                      {pack.tagline}
                    </p>
                    <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                      {pack.description}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {pack.features.map((feat, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    {/* Price Tag */}
                    <div className="flex items-baseline gap-2 mb-4 border-t border-slate-800 pt-3">
                      <span className="text-sm line-through text-slate-500">{pack.price}</span>
                      <span className="text-xl font-extrabold text-white">{pack.discounted}</span>
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                        -50% avec CODE
                      </span>
                    </div>

                    <button 
                      id={`buy-btn-${pack.id}`}
                      onClick={() => handleBuyClick(pack.title)}
                      className="w-full rounded-xl bg-blue-600 py-2.5 text-center text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/10 cursor-pointer"
                    >
                      Obtenir ce Pack
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code Promo of the Month (1 Column) */}
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-850 text-white p-6 sm:p-8 flex flex-col justify-between shadow-2xl shadow-blue-900/10 relative overflow-hidden h-full min-h-[320px]">
            
            {/* Visual Decoration */}
            <div className="absolute -right-10 -bottom-10 h-36 w-36 rounded-full bg-white/5 blur-xl pointer-events-none" />
            <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-blue-500/20 blur-xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-200" />
                <span className="text-xs font-mono font-extrabold tracking-widest text-blue-200 uppercase">
                  OFFRE DU MOIS LEMURIA
                </span>
              </div>

              <div>
                <h4 className="text-2xl font-black tracking-tight leading-tight">
                  {promoDiscount}
                </h4>
                <p className="text-xs text-blue-100 mt-1">
                  Sur tous les packs premium et les formations privées de l'écosystème IA Lemuria.
                </p>
              </div>

              {/* Promo Code Box */}
              <div className="rounded-2xl bg-white/10 border border-white/10 p-4 text-center relative group">
                <span className="text-[10px] text-blue-200 block uppercase font-mono font-bold tracking-wider mb-1">
                  Code Actif à Copier :
                </span>
                <span className="text-2xl font-mono font-black tracking-widest text-white select-all">
                  {promoCode}
                </span>

                <button
                  id="copy-promo-code-btn"
                  onClick={handleCopyCode}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow cursor-pointer"
                  title="Copier le code"
                >
                  {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 mt-6 text-center sm:text-left space-y-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-300" />
                <span className="text-xs font-semibold text-blue-100">
                  Accès Privilège VIP inclus
                </span>
              </div>
              <p className="text-[11px] text-blue-200 leading-relaxed">
                Profitez d'un accès VIP prioritaire sur nos serveurs de rendu d'images de Madagascar pour vos projets professionnels.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
