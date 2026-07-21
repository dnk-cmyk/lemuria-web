import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Facebook, Video, Youtube, Instagram, Send, ExternalLink } from "lucide-react";
import { CarouselItem } from "../types";

interface CarouselProps {
  carouselItems: CarouselItem[];
  onTrackClick: (partnerId: string) => void;
}

export default function Carousel({ carouselItems, onTrackClick }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Content for each of the 5 social slides
  const slidesContent = [
    {
      id: "facebook",
      title: "Communauté Facebook Lemuria",
      tagline: "Salama e! Rejoins 15,000+ créateurs à Madagascar",
      description: "Partage tes créations de storyboards, pose tes questions en malagasy ou français, et collabore avec la plus grande communauté d'IA locale.",
      bgColor: "from-blue-600 to-indigo-700",
      icon: Facebook,
      badge: "Entraide & Partage"
    },
    {
      id: "tiktok",
      title: "TikTok @lemuria_ia",
      tagline: "Des astuces IA courtes et percutantes en 60s",
      description: "Regarde nos tutoriels vidéo rapides pour maîtriser Google Flow Beta et PikverseAI. Astuces de création visuelle adaptées aux connexions locales.",
      bgColor: "from-slate-900 to-purple-950",
      icon: Video,
      badge: "Tutos Mada & Trends"
    },
    {
      id: "youtube",
      title: "Chaîne YouTube Lemuria",
      tagline: "Formations complètes et masterclasses gratuites",
      description: "Apprends à concevoir des films IA complets, à monétiser tes prompts avec l'e-commerce et à piloter des pipelines de génération avancés.",
      bgColor: "from-red-600 to-rose-700",
      icon: Youtube,
      badge: "Formations Officielles"
    },
    {
      id: "instagram",
      title: "Instagram Showcase",
      tagline: "Le temple du prompting haute-fidélité",
      description: "Découvre les plus beaux chefs-d'œuvre visuels inspirés de Madagascar. Copie les recettes esthétiques et partage tes rendus avec le hashtag #LemuriaIA.",
      bgColor: "from-pink-600 via-purple-600 to-orange-500",
      icon: Instagram,
      badge: "Inspiration Visuelle"
    },
    {
      id: "telegram",
      title: "Groupe Privé VIP Telegram",
      tagline: "Partage de prompts secrets & Accès VIP",
      description: "Sois le premier informé de l'accès aux bêtas privées, reçois des codes promos exclusifs et échange directement avec le staff de Lemuria.",
      bgColor: "from-cyan-500 to-blue-600",
      icon: Send,
      badge: "Accès Secret VIP"
    }
  ];

  // Autoplay functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slidesContent.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slidesContent.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slidesContent.length) % slidesContent.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slidesContent.length);
  };

  const handleSlideClick = (id: string, fallbackUrl: string) => {
    // Find matching url from settings
    const item = carouselItems.find((ci) => ci.id === id);
    const url = item ? item.url : fallbackUrl;
    
    // Log click event quietly
    onTrackClick(id);

    // Open target url
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="social-carousel-section" className="w-full py-8 bg-slate-50 border-y border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-6">
          <h3 className="font-sans text-xs font-bold text-blue-600 uppercase tracking-widest">
            Réseaux Lemuria Madagascar
          </h3>
          <p className="font-sans text-lg font-bold text-slate-800">
            Propulsez vos compétences en rejoignant notre écosystème
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl shadow-xl shadow-slate-100 bg-white">
          {/* Slides Container */}
          <div 
            className="flex transition-transform duration-700 ease-out h-[340px] sm:h-[280px]"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {slidesContent.map((slide) => {
              const IconComponent = slide.icon;
              const configItem = carouselItems.find((ci) => ci.id === slide.id);
              const targetUrl = configItem ? configItem.url : "#";

              return (
                <div 
                  key={slide.id} 
                  className="w-full flex-shrink-0 h-full p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 cursor-pointer"
                  onClick={() => handleSlideClick(slide.id, targetUrl)}
                >
                  {/* Text Details */}
                  <div className="flex-1 text-left space-y-3">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                      {slide.badge}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                      {slide.title}
                    </h2>
                    <p className="text-sm font-semibold text-blue-600">
                      {slide.tagline}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                      {slide.description}
                    </p>
                  </div>

                  {/* Graphic Card on Right */}
                  <div className={`w-full sm:w-64 h-32 sm:h-44 rounded-2xl bg-gradient-to-br ${slide.bgColor} flex flex-col items-center justify-center text-white relative shadow-md p-4 transition-transform hover:scale-[1.02]`}>
                    <IconComponent className="h-12 w-12 mb-2 drop-shadow-md" />
                    <span className="text-xs font-mono font-medium opacity-90 flex items-center gap-1">
                      Rejoindre maintenant <ExternalLink className="h-3 w-3" />
                    </span>
                    <div className="absolute bottom-2 right-2 text-[9px] font-mono opacity-40">
                      lemuria.mg/ref/{slide.id}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <button 
            id="carousel-prev-btn"
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white text-slate-700 hover:text-blue-600 transition-colors z-10"
            aria-label="Slide précédente"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            id="carousel-next-btn"
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white text-slate-700 hover:text-blue-600 transition-colors z-10"
            aria-label="Slide suivante"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Indicators / Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-y-0 -translate-x-1/2 flex gap-1.5 z-10">
            {slidesContent.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                className={`h-2 rounded-full transition-all duration-300 ${currentIndex === idx ? "w-6 bg-blue-600" : "w-2 bg-slate-200"}`}
                aria-label={`Aller au slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
