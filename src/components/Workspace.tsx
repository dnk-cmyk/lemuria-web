import React, { useState, useRef } from "react";
import { Upload, Sparkles, Copy, Check, Play, ExternalLink, Video, FileText, Sliders, RefreshCw, AlertTriangle } from "lucide-react";
import { WorkspaceMode, StoryboardResult, PromptResult, AnimationResult } from "../types";

interface WorkspaceProps {
  currentUser: { email: string; name: string } | null;
  activePartners: { google_flow: boolean; pikverse: boolean; midjourney_flux: boolean };
  onTrackEvent: (eventType: string, partnerId: string) => void;
}

export default function Workspace({ currentUser, activePartners, onTrackEvent }: WorkspaceProps) {
  const [mode, setMode] = useState<WorkspaceMode>("storyboard");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Operation Results
  const [storyboardResult, setStoryboardResult] = useState<StoryboardResult | null>(null);
  const [promptResult, setPromptResult] = useState<PromptResult | null>(null);
  const [animationResult, setAnimationResult] = useState<AnimationResult | null>(null);

  // Copy clipboards status states
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedMaster, setCopiedMaster] = useState(false);

  // Scene Image Rendering State
  const [showRenderOptions, setShowRenderOptions] = useState(false);
  const [imageStyle, setImageStyle] = useState<"realistic" | "cartoon_3d" | "anime" | "epic_cinematic" | "concept_art">("epic_cinematic");
  const [imageRatio, setImageRatio] = useState<"16:9" | "9:16" | "1:1">("9:16");
  const [renderedImages, setRenderedImages] = useState<{ [sceneNumber: number]: string }>({});
  const [renderingSceneNum, setRenderingSceneNum] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multi-step Madagascar themed loading messages
  const loadingSteps = [
    { fr: "Lecture et compression de l'image de Madagascar...", mg: "Mamaky sy mampihena ny haben'ny sary..." },
    { fr: "Envoi sécurisé à l'IA Gemini de Lemuria...", mg: "Mandefa ny sary any amin'ny Gemini..." },
    { fr: "Analyse des textures, visages et de l'éclairage...", mg: "Manadihady ny hazavana sy ny endrika..." },
    { fr: "Rédaction créative du découpage cinématique en cours...", mg: "Manoratra ny script sy ny prompt..." },
    { fr: "Génération finale de vos prompts haute-fidélité... Kely sisa e!", mg: "Mamita ny asa... Kely sisa e!" }
  ];

  const triggerLoaderAnimation = () => {
    setLoadingStep(0);
    const intervals = [1000, 2500, 4500, 7000, 9500];
    intervals.forEach((ms, idx) => {
      setTimeout(() => {
        if (loading) setLoadingStep(idx);
      }, ms);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Veuillez sélectionner uniquement des images (PNG, JPEG, WebP).");
      return;
    }
    setImageFile(file);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCopyText = (text: string, index: number | null) => {
    navigator.clipboard.writeText(text);
    onTrackEvent("prompt_copied", mode === "storyboard" ? "google_flow" : (mode === "animation" ? "pikverse" : "midjourney_flux"));
    if (index !== null) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      setCopiedMaster(true);
      setTimeout(() => setCopiedMaster(false), 2000);
    }
  };

  const handleLaunchAPI = async () => {
    setLoading(true);
    setErrorMsg(null);
    triggerLoaderAnimation();

    // Reset previous states
    setStoryboardResult(null);
    setPromptResult(null);
    setAnimationResult(null);

    // Extract base64 image data if present
    let base64Image = "";
    let mimeType = "";
    if (imagePreview) {
      const parts = imagePreview.split(",");
      if (parts.length > 1) {
        base64Image = parts[1];
        const match = parts[0].match(/data:(.*?);base64/);
        mimeType = match ? match[1] : "image/jpeg";
      }
    }

    const endpoint = mode === "storyboard" 
      ? "/api/generate-storyboard" 
      : (mode === "animation" ? "/api/generate-animation" : "/api/generate-prompt");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          mimeType: mimeType,
          prompt: customPrompt,
          userId: currentUser?.email || "anon_mada"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Une erreur s'est produite lors de la génération.");
      }

      const data = await response.json();

      if (mode === "storyboard") setStoryboardResult(data);
      else if (mode === "animation") setAnimationResult(data);
      else setPromptResult(data);

    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Impossible de joindre le serveur Lemuria. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleRenderSceneImage = async (sceneNumber: number) => {
    if (!storyboardResult) return;
    const sceneToRender = storyboardResult.scenes.find(s => s.number === sceneNumber);
    if (!sceneToRender) return;

    setRenderingSceneNum(sceneNumber);
    try {
      const res = await fetch("/api/render-scene-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: sceneToRender.prompt,
          style: imageStyle,
          ratio: imageRatio
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRenderedImages(prev => ({
          ...prev,
          [sceneNumber]: data.imageUrl
        }));
      } else {
        throw new Error("Rendu de la scène échoué. Veuillez réessayer.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erreur de rendu de l'illustration.");
    } finally {
      setRenderingSceneNum(null);
    }
  };

  return (
    <section id="workspace" className="py-16 bg-[#030712] border-b border-slate-900 text-slate-100 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(59,130,246,0.05),transparent_40%)] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Intro Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-sans text-3xl font-black tracking-tight text-white sm:text-4xl">
            Espace de Travail Lemuria
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Intégrez vos images et laissez Gemini configurer vos storyboards cinématiques et prompts haute fidélité pour vos moteurs favoris.
          </p>
        </div>

        {/* Dynamic Partner Availability Warnings */}
        <div className="mb-6 space-y-2">
          {mode === "storyboard" && !activePartners.google_flow && (
            <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 p-3 text-xs text-amber-300 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span><strong>Attention :</strong> Le module d'inférence Google Flow Beta est actuellement désactivé par l'administrateur. Les résultats s'afficheront via le générateur local d'urgence.</span>
            </div>
          )}
          {mode === "animation" && !activePartners.pikverse && (
            <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 p-3 text-xs text-amber-300 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span><strong>Attention :</strong> Le module PikverseAI est désactivé. Les résultats s'afficheront en mode local simulé.</span>
            </div>
          )}
          {mode === "prompt" && !activePartners.midjourney_flux && (
            <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 p-3 text-xs text-amber-300 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span><strong>Attention :</strong> Le convertisseur Image-to-Prompt Master est désactivé. Mode local d'urgence activé.</span>
            </div>
          )}
        </div>

        {/* Main interactive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Creator inputs (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div id="creator-panel-card" className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 shadow-2xl backdrop-blur-md">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-500" />
                <span>Configuration de l'inspiration</span>
              </h3>

              {/* Mode Selectors */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  1. Sélectionner le Mode de Traitement
                </label>
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950 rounded-xl border border-slate-850">
                  <button
                    id="mode-storyboard-btn"
                    onClick={() => { setMode("storyboard"); setErrorMsg(null); }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg text-center transition-all cursor-pointer ${mode === "storyboard" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"}`}
                  >
                    <Video className="h-4 w-4 mb-1" />
                    <span className="text-[10px] font-bold">Flow Story</span>
                  </button>
                  <button
                    id="mode-prompt-btn"
                    onClick={() => { setMode("prompt"); setErrorMsg(null); }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg text-center transition-all cursor-pointer ${mode === "prompt" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"}`}
                  >
                    <FileText className="h-4 w-4 mb-1" />
                    <span className="text-[10px] font-bold">Prompt Master</span>
                  </button>
                  <button
                    id="mode-animation-btn"
                    onClick={() => { setMode("animation"); setErrorMsg(null); }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg text-center transition-all cursor-pointer ${mode === "animation" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"}`}
                  >
                    <RefreshCw className="h-4 w-4 mb-1" />
                    <span className="text-[10px] font-bold">Anim Pika</span>
                  </button>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  2. Image Source
                </label>
                
                {imagePreview ? (
                  <div className="relative rounded-2xl border border-slate-800 overflow-hidden aspect-video bg-slate-950 flex items-center justify-center group">
                    <img 
                      src={imagePreview} 
                      alt="Aperçu inspiration" 
                      className="w-full h-full object-contain max-h-[220px]"
                    />
                    <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        id="clear-image-btn"
                        onClick={clearImage}
                        className="rounded-xl bg-red-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-red-500 transition-colors cursor-pointer"
                      >
                        Retirer l'image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    id="dropzone-area"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 group flex flex-col items-center justify-center min-h-[160px]"
                  >
                    <Upload className="h-8 w-8 text-slate-500 group-hover:text-blue-500 transition-colors mb-2" />
                    <p className="text-xs font-bold text-slate-300">Glissez ou sélectionnez une image</p>
                    <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, WebP jusqu'à 10 Mo</p>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                  </div>
                )}
              </div>

              {/* Custom Guidance Prompt (Optional) */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  3. Directives Additionnelles (Optionnel)
                </label>
                <textarea
                  id="custom-guidance-textarea"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ex : Ajoute une ambiance de pluie tropicale, insiste sur les visages, accélère le mouvement..."
                  className="w-full rounded-xl border border-slate-850 p-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none h-20 resize-none bg-slate-950"
                />
              </div>

              {/* Error messages */}
              {errorMsg && (
                <div id="workspace-error" className="mb-4 rounded-xl bg-red-950/40 p-3 border border-red-900/50 text-xs text-red-200">
                  {errorMsg}
                </div>
              )}

              {/* Launch Action Button */}
              <button
                id="launch-gemini-btn"
                disabled={loading}
                onClick={handleLaunchAPI}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>{loading ? "Génération en cours..." : "Lancer l'analyse avec Gemini"}</span>
              </button>
            </div>

          </div>

          {/* Right Column: AI Outputs (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div id="output-display-card" className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 shadow-2xl min-h-[460px] flex flex-col justify-between backdrop-blur-sm">
              
              {/* Header inside Output Card */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  🤖 Assistant & Résultats Lemuria
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Service Actif
                </span>
              </div>

              {/* State 1: Fresh / Waiting state */}
              {!loading && !storyboardResult && !promptResult && !animationResult && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="h-16 w-16 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-4 animate-bounce">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h4 className="text-base font-bold text-white">Salama! Masoivoho Lemuria eo am-panompoana.</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Chargez votre image de référence, choisissez un mode sur le panneau de gauche et lancez Gemini pour faire émerger vos prompts créatifs.
                  </p>
                </div>
              )}

              {/* State 2: Loading State with bilingual encourage messages */}
              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-5">
                  <div className="relative flex items-center justify-center">
                    {/* Ring loader */}
                    <div className="h-16 w-16 rounded-full border-4 border-slate-850 border-t-blue-500 animate-spin" />
                    <Sparkles className="h-6 w-6 text-blue-400 absolute animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-200 leading-snug animate-pulse">
                      {loadingSteps[loadingStep]?.fr || "Génération en cours..."}
                    </p>
                    <p className="text-[11px] font-mono font-semibold text-blue-400">
                      {loadingSteps[loadingStep]?.mg || "Mamita ny asa..."}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-950 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-850">
                    Étape {loadingStep + 1} sur 5
                  </span>
                </div>
              )}

              {/* State 3: Storyboard Google Flow Result */}
              {storyboardResult && !loading && (
                <div id="storyboard-result-panel" className="flex-1 space-y-6">
                  <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Résumé de la composition</p>
                    <p className="text-xs sm:text-sm italic font-medium text-slate-300 leading-relaxed">
                      "{storyboardResult.introduction}"
                    </p>
                  </div>

                  {/* Interactive Scene Rendering Option Box */}
                  {!showRenderOptions && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                      <div>
                        <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Créer les images pour les scènes ?</h5>
                        <p className="text-[11px] text-slate-400">Choisissez votre ratio et style artistique pour générer des visuels pour chaque scène.</p>
                      </div>
                      <button
                        onClick={() => setShowRenderOptions(true)}
                        className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>Générer les Visuels</span>
                      </button>
                    </div>
                  )}

                  {showRenderOptions && (
                    <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Sliders className="h-4 w-4 text-amber-400" />
                          <span>Option de Rendu de Scène</span>
                        </h5>
                        <button 
                          onClick={() => setShowRenderOptions(false)}
                          className="text-slate-500 hover:text-white text-[10px] cursor-pointer"
                        >
                          Masquer
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Ratio selector */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ratio d'aspect d'image</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: "16:9", label: "16:9 Paysage" },
                              { id: "9:16", label: "9:16 Short" },
                              { id: "1:1", label: "1:1 Carré" }
                            ].map((r) => (
                              <button
                                key={r.id}
                                onClick={() => setImageRatio(r.id as any)}
                                className={`py-1.5 text-[9px] rounded-lg font-bold border transition-colors cursor-pointer ${
                                  imageRatio === r.id 
                                    ? "bg-blue-600 text-white border-blue-500" 
                                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                                }`}
                              >
                                {r.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Style selector */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Style artistique</label>
                          <select
                            value={imageStyle}
                            onChange={(e) => setImageStyle(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="epic_cinematic">Epic Cinematic 🎬</option>
                            <option value="realistic">Realistic Photography 📷</option>
                            <option value="cartoon_3d">3D Cartoon (Chibi Style) 🐒</option>
                            <option value="anime">Anime / Manga Style 🌸</option>
                            <option value="concept_art">Fantasy Concept Art 🎨</option>
                          </select>
                        </div>
                      </div>

                      {/* Launch workflow sequential rendering scene 1 if empty */}
                      {Object.keys(renderedImages).length === 0 && !renderingSceneNum && (
                        <button
                          onClick={() => handleRenderSceneImage(1)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Lancer le Rendu de la Scène 1
                        </button>
                      )}
                    </div>
                  )}

                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Scénario de découpage (Chaque scène dure 5 à 8s)</h4>

                  <div className="space-y-4">
                    {storyboardResult.scenes.map((scene, idx) => {
                      const isRendered = !!renderedImages[scene.number];
                      const isRendering = renderingSceneNum === scene.number;
                      const hasMoreScenes = !!storyboardResult.scenes.find(s => s.number === scene.number + 1);
                      const nextSceneNumber = scene.number + 1;

                      return (
                        <div 
                          key={idx} 
                          id={`storyboard-scene-card-${scene.number}`}
                          className="rounded-2xl border border-slate-850 bg-slate-950/60 p-4 space-y-3 hover:border-blue-500/20 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center rounded-lg bg-blue-500/10 text-blue-400 text-xs font-black px-2 py-0.5">
                              Scène {scene.number}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">Durée recommandée : {scene.duration} (5-8s min)</span>
                          </div>

                          <p className="text-xs text-slate-300 font-medium leading-relaxed">
                            {scene.description}
                          </p>

                          {/* Dynamic Rendered Scene Image display */}
                          {isRendered && (
                            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 animate-fade-in group mt-2 shadow-inner">
                              <img 
                                src={renderedImages[scene.number]} 
                                alt={`Rendu Scène ${scene.number}`} 
                                className={`w-full object-cover transition-transform group-hover:scale-[1.02] duration-500 ${
                                  imageRatio === "9:16" ? "aspect-[9/16] max-h-[380px]" : imageRatio === "1:1" ? "aspect-square max-h-[280px]" : "aspect-video max-h-[220px]"
                                }`}
                              />
                              <div className="absolute top-2 left-2 bg-slate-900/90 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-md border border-slate-800">
                                {imageStyle.toUpperCase().replace("_", " ")} • {imageRatio}
                              </div>
                            </div>
                          )}

                          {/* Loading renderer state */}
                          {isRendering && (
                            <div className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-6 text-center space-y-2 animate-pulse">
                              <RefreshCw className="h-6 w-6 text-amber-400 animate-spin mx-auto" />
                              <p className="text-[11px] font-bold text-amber-400">Rendu de l'illustration de la Scène {scene.number} par Maki...</p>
                            </div>
                          )}

                          {/* English Prompt Area */}
                          <div className="bg-slate-950 rounded-xl p-3 text-slate-400 font-mono text-[10px] sm:text-xs relative group border border-slate-850">
                            <p className="pr-12 select-all line-clamp-3">{scene.prompt}</p>
                            <button
                              id={`copy-scene-prompt-btn-${scene.number}`}
                              onClick={() => handleCopyText(scene.prompt, idx)}
                              className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              title="Copier le prompt"
                            >
                              {copiedIndex === idx ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>

                          {/* Action footer with "Continuer scène suivante" option and affiliate */}
                          <div className="flex flex-col gap-3 pt-2.5 border-t border-slate-900 w-full">
                            
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              {/* Sequence button: Continuer scène suivante? */}
                              {showRenderOptions && isRendered && hasMoreScenes && !renderedImages[nextSceneNumber] && !renderingSceneNum && (
                                <button
                                  id={`continue-scene-btn-${scene.number}`}
                                  onClick={() => handleRenderSceneImage(nextSceneNumber)}
                                  className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-extrabold px-3.5 py-1.5 transition-all flex items-center gap-1.5 animate-pulse cursor-pointer shadow-md shadow-blue-600/20"
                                >
                                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                                  <span>Continuer scène suivante ? (Rendu Scène {nextSceneNumber})</span>
                                </button>
                              )}

                              {/* Trigger initial Scene 1 render manually inside scene card if requested */}
                              {showRenderOptions && scene.number === 1 && !renderedImages[1] && !renderingSceneNum && (
                                <button
                                  onClick={() => handleRenderSceneImage(1)}
                                  className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-extrabold px-3.5 py-1.5 transition-all cursor-pointer"
                                >
                                  Rendre la Scène 1
                                </button>
                              )}
                            </div>

                            {/* Astuce and Choice Section */}
                            <div className="flex flex-col gap-2 bg-slate-900/40 p-3 rounded-xl border border-slate-850/60 w-full">
                              <p className="text-[11px] font-medium text-amber-400 flex items-center gap-1.5">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                                💡 Astuce : Copier les prompts dans votre bloc note
                              </p>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-850/40">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Créer ma vidéo sur :
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    id={`create-video-flow-btn-${scene.number}`}
                                    onClick={() => {
                                      onTrackEvent("affiliate_click", "google_flow");
                                      window.open("https://play.google.com/store/apps/details?id=com.google.android.apps.labs.whisk", "_blank");
                                    }}
                                    className="inline-flex items-center gap-1 text-[10px] font-black bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider cursor-pointer"
                                  >
                                    <span>Google Flow Beta</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </button>
                                  <button
                                    id={`create-video-pikverse-btn-${scene.number}`}
                                    onClick={() => {
                                      onTrackEvent("affiliate_click", "pikverse");
                                      window.open("https://bit.ly/piksverse", "_blank");
                                    }}
                                    className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/20 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider cursor-pointer"
                                  >
                                    <span>PikverseAI</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* State 4: Image -> Prompt Master Result */}
              {promptResult && !loading && (
                <div id="prompt-result-panel" className="flex-1 space-y-4">
                  <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Visual DNA Summary</p>
                    <p className="text-xs sm:text-sm italic font-medium text-slate-300 leading-relaxed">
                      "{promptResult.summary}"
                    </p>
                  </div>

                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Recette de décomposition</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div id="factor-subject-card" className="bg-slate-950/60 rounded-xl p-3 border border-slate-850">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1">🎯 Sujet</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{promptResult.factors.subject}</p>
                    </div>
                    <div id="factor-env-card" className="bg-slate-950/60 rounded-xl p-3 border border-slate-850">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1">🌲 Environnement</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{promptResult.factors.environment}</p>
                    </div>
                    <div id="factor-light-card" className="bg-slate-950/60 rounded-xl p-3 border border-slate-850">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1">☀️ Éclairage / Ambiance</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{promptResult.factors.lighting}</p>
                    </div>
                    <div id="factor-cam-card" className="bg-slate-950/60 rounded-xl p-3 border border-slate-850">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1">📷 Rendu / Caméra</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{promptResult.factors.camera}</p>
                    </div>
                  </div>

                  {/* Combined Master Prompt Box */}
                  <div className="mt-4 pt-4 border-t border-slate-850">
                    <p className="text-xs font-extrabold text-white uppercase tracking-wider mb-2">
                      🔥 Prompt Master Haute-Fidélité (Midjourney/Flux)
                    </p>
                    <div className="bg-slate-950 rounded-2xl p-4 text-slate-200 font-mono text-xs relative border border-slate-850">
                      <p className="pr-12 select-all whitespace-pre-wrap leading-relaxed">{promptResult.masterPrompt}</p>
                      <button
                        id="copy-master-prompt-btn"
                        onClick={() => handleCopyText(promptResult.masterPrompt, null)}
                        className="absolute right-3 top-3 p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-white transition-all shadow cursor-pointer"
                        title="Copier le prompt master"
                      >
                        {copiedMaster ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* State 5: Animation PikverseAI Result */}
              {animationResult && !loading && (
                <div id="animation-result-panel" className="flex-1 space-y-4">
                  <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Analyse du mouvement</p>
                    <p className="text-xs sm:text-sm italic font-medium text-slate-300 leading-relaxed">
                      "{animationResult.summary}"
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div id="anim-directives-card" className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-850">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">🎮 Vecteurs de Mouvement (Pika / Pikverse)</p>
                      <p className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg inline-block">{animationResult.motionDirectives}</p>
                    </div>

                    <div id="anim-physics-card" className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-850">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1">⚡ Physique & Effets Suggérés</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{animationResult.effects}</p>
                    </div>
                  </div>

                  {/* Combined Prompt Box */}
                  <div className="mt-4 pt-4 border-t border-slate-850">
                    <p className="text-xs font-extrabold text-white uppercase tracking-wider mb-2">
                      🎥 Prompt d'Animation Prêt à l'emploi
                    </p>
                    <div className="bg-slate-950 rounded-2xl p-4 text-slate-200 font-mono text-xs relative border border-slate-850">
                      <p className="pr-12 select-all whitespace-pre-wrap leading-relaxed">{animationResult.pikaPrompt}</p>
                      <button
                        id="copy-animation-prompt-btn"
                        onClick={() => handleCopyText(animationResult.pikaPrompt, null)}
                        className="absolute right-3 top-3 p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-white transition-all shadow cursor-pointer"
                        title="Copier le prompt d'animation"
                      >
                        {copiedMaster ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    <div className="flex justify-end mt-3">
                      <button
                        id="open-pikverse-btn"
                        onClick={() => {
                          onTrackEvent("affiliate_click", "pikverse");
                          window.open("https://bit.ly/piksverse", "_blank");
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider cursor-pointer"
                      >
                        <span>🎬 Ouvrir sur PikverseAI</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Attribution Message */}
              {(storyboardResult || promptResult || animationResult) && !loading && (
                <div className="border-t border-slate-850 pt-3 mt-4 text-center">
                  <p className="text-[10px] font-medium text-slate-500">
                    Généré à Madagascar par le Hub IA Lemuria. Chaque recommandation d'outil soutient nos serveurs gratuits.
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
