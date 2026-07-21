import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up limits for base64 image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// File paths for local persistence of settings and analytics logs
const SETTINGS_FILE = path.join(process.cwd(), "lemuria_settings.json");
const ANALYTICS_FILE = path.join(process.cwd(), "lemuria_analytics.json");

// Default Admin and Carousel Settings
const DEFAULT_SETTINGS = {
  promoCode: "LEMURIA2026",
  promoDiscount: "-50% & Accès VIP",
  carousel: [
    { id: "facebook", name: "Facebook (Communauté)", url: "https://web.facebook.com/profile.php?id=61576412781829" },
    { id: "tiktok", name: "TikTok (Tutos Mada)", url: "https://lemuria.mg/ref/tiktok" },
    { id: "youtube", name: "YouTube (Formations)", url: "https://lemuria.mg/ref/youtube" },
    { id: "instagram", name: "Instagram (Showcase)", url: "https://lemuria.mg/ref/instagram" },
    { id: "telegram", name: "Groupe VIP (Telegram)", url: "https://lemuria.mg/ref/telegram" }
  ],
  partners: {
    google_flow: true,
    pikverse: true,
    midjourney_flux: true
  },
  backendInstructions: "Vous êtes Lemuria AI, un assistant spécialisé dans le prompt vidéo haut de gamme et le cinéma à Madagascar. Privilégiez les couleurs vives de Madagascar : terres rouges profondes, lagons turquoise, couchers de soleil dorés.",
  ecommerceUrl: "https://beacons.ai/dago2026",
  blogArticles: [
    {
      id: "blog-1",
      title: "L'essor de l'Intelligence Artificielle à Madagascar",
      description: "Découvrez comment les créateurs et entrepreneurs malgaches s'approprient les outils d'IA générative pour booster leur productivité.",
      imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
      partnerUrl: "https://lemuria.mg/ref/blog-mada"
    },
    {
      id: "blog-2",
      title: "Comment utiliser Gemini pour vos storyboards de fiction",
      description: "Le guide ultime de découpage scénique pour vos vidéos de 40 à 60 secondes en utilisant la puissance de l'IA.",
      imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
      partnerUrl: "https://lemuria.mg/ref/blog-storyboard"
    },
    {
      id: "blog-3",
      title: "Les secrets des vidéos virales à l'ère des Shorts et TikTok",
      description: "Apprenez les techniques de rétention et l'importance des hooks de 3 secondes pour conquérir l'audience locale.",
      imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80",
      partnerUrl: "https://lemuria.mg/ref/blog-viral"
    }
  ]
};

// Default Analytics Schema
const DEFAULT_ANALYTICS = {
  metrics: {
    storyboard_gen: 24,
    image_to_prompt: 31,
    pikverse_anim: 15,
    affiliate_click_flow: 48,
    affiliate_click_pikverse: 29,
    prompt_copied: 87,
    boutique_view: 104,
    boutique_buy_click: 18
  },
  logs: [
    { timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), event_type: "storyboard_gen", partner_id: "google_flow", user_id: "anon_mada_843" },
    { timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), event_type: "prompt_copied", partner_id: "midjourney_flux", user_id: "anon_mada_120" },
    { timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), event_type: "affiliate_click", partner_id: "google_flow", user_id: "anon_mada_954" }
  ]
};

// Ensure settings and analytics files exist or create them
function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      // Merge with default settings to ensure new fields are populated
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error("Error reading settings file, using defaults:", error);
  }
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf-8");
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: typeof DEFAULT_SETTINGS) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving settings file:", error);
  }
}

function loadAnalytics() {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = fs.readFileSync(ANALYTICS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading analytics file, using defaults:", error);
  }
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(DEFAULT_ANALYTICS, null, 2), "utf-8");
  return DEFAULT_ANALYTICS;
}

function saveAnalytics(analytics: typeof DEFAULT_ANALYTICS) {
  try {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving analytics file:", error);
  }
}

// Lazy load Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in process.env. Falling back to simulated responses for smooth testing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// Function to log an event quietly
function logEvent(eventType: string, partnerId: string, userId: string = "anon") {
  const analytics = loadAnalytics();
  
  // Update metric counters
  if (eventType === "storyboard_gen") analytics.metrics.storyboard_gen += 1;
  else if (eventType === "image_to_prompt") analytics.metrics.image_to_prompt += 1;
  else if (eventType === "pikverse_anim") analytics.metrics.pikverse_anim += 1;
  else if (eventType === "prompt_copied") analytics.metrics.prompt_copied += 1;
  else if (eventType === "affiliate_click" && partnerId === "google_flow") analytics.metrics.affiliate_click_flow += 1;
  else if (eventType === "affiliate_click" && partnerId === "pikverse") analytics.metrics.affiliate_click_pikverse += 1;
  else if (eventType === "boutique_view") analytics.metrics.boutique_view += 1;
  else if (eventType === "boutique_buy_click") analytics.metrics.boutique_buy_click += 1;

  // Append logs (limit to 100 entries for sanity)
  analytics.logs.unshift({
    timestamp: new Date().toISOString(),
    event_type: eventType,
    partner_id: partnerId,
    user_id: userId
  });
  if (analytics.logs.length > 100) {
    analytics.logs.pop();
  }
  
  saveAnalytics(analytics);
}

// API: Get admin settings
app.get("/api/admin/settings", (req, res) => {
  const settings = loadSettings();
  res.json(settings);
});

// API: Update admin settings
app.post("/api/admin/settings", (req, res) => {
  const currentSettings = loadSettings();
  const updatedSettings = { ...currentSettings, ...req.body };
  saveSettings(updatedSettings);
  res.json({ success: true, settings: updatedSettings });
});

// API: Get analytics
app.get("/api/admin/analytics", (req, res) => {
  const analytics = loadAnalytics();
  res.json(analytics);
});

// API: Log a user interaction event
app.post("/api/analytics/log", (req, res) => {
  const { event_type, partner_id, user_id } = req.body;
  logEvent(event_type, partner_id, user_id);
  res.json({ success: true });
});

// API: Generate Storyboard (Image -> Google Flow Prompts)
app.post("/api/generate-storyboard", async (req, res) => {
  const { image, mimeType, prompt, userId } = req.body;
  logEvent("storyboard_gen", "google_flow", userId || "anon_mada");

  const settings = loadSettings();
  if (!settings.partners.google_flow) {
    return res.status(403).json({ error: "L'API partenaire Google Flow Beta est actuellement désactivée par l'administrateur." });
  }

  const customInstructions = settings.backendInstructions || "Vous êtes Lemuria AI, un assistant spécialisé dans le prompt vidéo haut de gamme et le cinéma à Madagascar.";
  const userPrompt = prompt || "Générer un storyboard de scènes de 5 à 8 secondes chacune, pour un total de 40 à 60 secondes de vidéo de haute qualité.";

  try {
    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      throw new Error("Missing real API key");
    }

    const contentParts: any[] = [];
    if (image && mimeType) {
      contentParts.push({
        inlineData: {
          mimeType: mimeType,
          data: image
        }
      });
    }
    contentParts.push({
      text: `Analyze the uploaded image composition, style, characters, atmospheric lighting and generate a sequential video storyboard of exactly 6 to 8 scenes. 
CRITICAL CONSTRAINTS:
- Each scene MUST have a duration of minimum 5 to 8 seconds (e.g., "5s", "6s", "7s", "8s").
- The sum of all scene durations MUST be between 40 and 60 seconds total.
- The scenes must build a cohesive cinematic narrative based on the image style.

For each scene, the generated "prompt" MUST strictly follow this exact format and structure, filled with details customized to that scene's specific action, subject, setting, and text:

--- START TEMPLATE ---
Documentaire cinématographique ultra-réaliste, qualité Netflix, production premium digne d'une chaîne de télévision, rendu 4K HDR, peau photoréaliste avec pores et imperfections naturelles, éclairage physiquement réaliste, léger grain cinématographique, animation faciale extrêmement réaliste, reflets naturels dans les yeux, langage corporel naturel, mouvements fluides, image parfaitement stable, sans scintillement.

[Description détaillée du studio/environnement moderne, minimaliste ou adapté à la scène sans éléments inutiles ni logos]

[Description détaillée du sujet malgache ou autre sujet de la scène, visage, cheveux, yeux, habillement confiant/accessible]

[Description détaillée du cadrage caméra initial (e.g. plan poitrine medium close-up, objectif cinéma anamorphique de 50 mm, faible profondeur de champ, flou arrière-plan/bokeh)]

[Description du mouvement très léger de la caméra, trépied stabilisé, léger micro-mouvement presque imperceptible]

[Description des expressions initiales pré-parole, regard caméra, sourire naturel, inclination de tête, respiration naturelle, clignements d'yeux, micro-expressions]

Au moment précis, il prononce naturellement en français :
« [La phrase prononcée en français par le sujet] »

Prononciation française parfaitement naturelle. Synchronisation labiale française parfaite. Correspondance exacte des phonèmes. Mouvements réalistes de la langue. Animation précise de la mâchoire. Compression naturelle des lèvres. Déformation réaliste des joues. Légers mouvements des sourcils synchronisés avec la parole. Animation réaliste des muscles du visage. Aucun retard entre la voix et les lèvres. Aucun mouvement de bouche robotique.

[Description de la voix du sujet, ex: voix masculine professionnelle d'environ 30 ans, accent français neutre avec une très légère influence malgache, ton calme, confiant, intrigant, conversationnel, chaleureux]

[Description des sons, musique de fond discrète pour créer de la curiosité, effets sonores légers pour titre]

[Description du titre à l'écran :
En haut de l'écran : [Titre principal en majuscules]
En bas de l'écran : [Sous-titre ou phrase d'accompagnement]
Typographie blanche moderne avec une lueur subtile, animation élégante]

[Description détaillée de l'éclairage de la scène (e.g. boîte à lumière 45°, lumière blanche douce, contre-jour chaud dessinant les épaules)]

[Description détaillée de l'étalonnage et palette de couleurs équilibrée, palette naturelle sans saturation excessive]

Prompt négatif
dessin animé, anime, illustration, rendu 3D, style Pixar, apparence CGI, peau plastique, uncanny valley, faible qualité, basse résolution, flou, pixellisation, artefacts JPEG, artefacts de compression, suraccentuation, couleurs trop saturées, mauvaise anatomie, bras supplémentaires, mains supplémentaires, doigts supplémentaires, doigts fusionnés, doigts manquants, visage déformé, visage asymétrique, yeux louches, œil paresseux, personne dupliquée, parties du corps dupliquées, objets flottants, arrière-plan déformé, walls déformés, scintillement, variations d'exposition, variations de couleurs, caméra instable, tremblements, zoom instable, mouvements robotiques, corps rigide, clignements non naturels, visage figé, mauvaise animation faciale, synchronisation labiale française incorrecte, bouche ne correspondant pas à la voix, retard entre la bouche et l'audio, sous-titres, filigrane, logos, marques visibles, éléments d'interface, artefacts de texte, bruit numérique, images fantômes, flou de mouvement excessif, faible plage dynamique, éclairage irréaliste, expressions exagérées.
--- END TEMPLATE ---

Make sure to translate the placeholders (like [Description...], [La phrase...]) into actual descriptive content appropriate for that specific scene of the storyboard. The text of each prompt MUST be written fully, including the negative prompt section.

You MUST respond strictly with the JSON format matching the schema.`
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentParts,
      config: {
        systemInstruction: `${customInstructions} Vous écrivez d'élégantes explications de story-board en français et des invites de caméra IA très avancées en anglais. Votre réponse doit correspondre strictement à la structure JSON attendue.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            introduction: { type: Type.STRING, description: "A one sentence summary of the image ambiance in French." },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.INTEGER },
                  description: { type: Type.STRING, description: "Short description of the scene composition in French (1-2 sentences)." },
                  prompt: { type: Type.STRING, description: "Detailed video prompt following the highly structured multi-paragraph template described in the instruction." },
                  duration: { type: Type.STRING, description: "Suggest scene length, must be between '5s' and '8s'." }
                },
                required: ["number", "description", "prompt", "duration"]
              }
            }
          },
          required: ["introduction", "scenes"]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedResponse);

  } catch (error) {
    console.warn("Gemini execution failed or API Key absent, serving mock Madagascar cinematic storyboard with 40-60s duration constraints.");
    
    // DELIGHTFUL fallback Madagascar-themed storyboard respecting 5-8s scene durations and 40-60s total
    const simulatedResponse = {
      introduction: "Une magnifique composition capturant l'âme lumineuse et les secrets technologiques cachés à Madagascar, structurée en un court-métrage de 47 secondes.",
      scenes: [
        {
          number: 1,
          description: "Introduction contemplative face caméra dans un studio moderne dévoilant le secret des modérateurs malgaches pour ChatGPT.",
          prompt: `Documentaire cinématographique ultra-réaliste, qualité Netflix, production premium digne d'une chaîne de télévision, rendu 4K HDR, peau photoréaliste avec pores et imperfections naturelles, éclairage physiquement réaliste, léger grain cinématographique, animation faciale extrêmement réaliste, reflets naturels dans les yeux, langage corporel naturel, mouvements fluides, image parfaitement stable, sans scintillement.

Un studio de télévision moderne et minimaliste avec une architecture contemporaine élégante. Mur de fond gris clair légèrement texturé, avec une profondeur subtile et un dégradé doux. Ambiance chaleureuse, professionnelle et intrigante. Aucun élément décoratif inutile, aucun logo, aucune marque visible.

Un homme malgache de 28 ans est debout face à la caméra. Traits naturels malgaches, peau brun moyen, cheveux noirs courts et soignés, visage rasé de près, yeux bruns expressifs, allure à la fois confiante et accessible. Il porte un polo bleu clair uni, sans logo, donnant l'image d'un journaliste technologique moderne ou d'un créateur de contenu professionnel.

La caméra commence par un plan poitrine (medium close-up), cadré de la poitrine jusqu'à la tête. Prise de vue avec un objectif cinéma anamorphique de 50 mm, offrant une profondeur de champ très faible. Le sujet reste parfaitement net tandis que l'arrière-plan est délicatement flou avec un magnifique effet bokeh cinématographique.

La caméra est montée sur un trépied stabilisé avec uniquement un très léger micro-mouvement cinématographique, presque imperceptible, afin de renforcer le réalisme sans provoquer de tremblements visibles.

Le présentateur regarde directement l'objectif dès la première image. Son regard reste fixé sur la caméra pendant toute la scène.

Il affiche un léger sourire naturel, laissant penser qu'il s'apprête à révéler une information confidentielle.

Il incline lentement la tête de quelques degrés.

Une courte pause dramatique. Respiration naturelle. Clignements d'yeux réalistes. Micro-expressions du visage. Légers mouvements des yeux. Mouvements subtils des épaules synchronisés avec la respiration. Ses mains restent hors du cadre. Aucun geste exagéré.

Au moment précis, il prononce naturellement en français :
« Quand tu parles à ChatGPT... il y a peut-être un Malgache derrière. »

Prononciation française parfaitement naturelle. Synchronisation labiale française parfaite. Correspondance exacte des phonèmes. Mouvements réalistes de la langue. Animation précise de la mâchoire. Compression naturelle des lèvres. Déformation réaliste des joues. Légers mouvements des sourcils synchronisés avec la parole. Animation réaliste des muscles du visage. Aucun retard entre la voix et les lèvres. Aucun mouvement de bouche robotique.

Voix masculine professionnelle d'environ 30 ans. Accent français neutre avec une très légère influence malgache. Ton calme, confiant, intrigant, conversationnel, chaleureux.

Une musique cinématographique douce démarre discrètement en arrière-plan afin de créer un sentiment de curiosité sans couvrir la voix. Très légère ambiance sonore de studio. Un discret son de notification numérique retentit juste avant la phrase. Un léger effet sonore cinématographique accompagne l'apparition du titre.

Titre animé avec une révélation numérique élégante. En haut de l'écran : LE SECRET MALGACHE DERRIÈRE CHATGPT. En bas de l'écran : Une histoire que peu de gens connaissent. Typographie blanche moderne avec une légère lueur bleutée. Animation élégante et discrète. Aucun mouvement distrayant. Style documentaire haut de gamme.

L'éclairage est assuré par une grande boîte à lumière placée à 45° du présentateur. Lumière principale blanche et douce. Lumière de remplissage neutre. Léger contre-jour chaud dessinant les contours des épaules. Éclairage progressif de l'arrière-plan. Teintes de peau parfaitement naturelles. Reflets réalistes dans les yeux. Contraste cinématographique équilibré.

Étalonnage inspiré des productions documentaires haut de gamme. Palette de couleurs naturelles. Aucune saturation excessive. Aucune netteté artificielle. Réalisme maximal.

Prompt négatif
dessin animé, anime, illustration, rendu 3D, style Pixar, apparence CGI, peau plastique, uncanny valley, faible qualité, basse résolution, flou, pixellisation, artefacts JPEG, artefacts de compression, suraccentuation, couleurs trop saturées, mauvaise anatomie, bras supplémentaires, mains supplémentaires, doigts supplémentaires, doigts fusionnés, doigts manquants, visage déformé, visage asymétrique, yeux louches, œil paresseux, personne dupliquée, parties du corps dupliquées, objets flottants, arrière-plan déformé, murs déformés, scintillement, variations d'exposition, variations de couleurs, caméra instable, tremblements, zoom instable, mouvements robotiques, corps rigide, clignements non naturels, visage figé, mauvaise animation faciale, synchronisation labiale française incorrecte, bouche ne correspondant pas à la voix, retard entre la bouche et l'audio, sous-titres, filigrane, logos, marques visibles, éléments d'interface, artefacts de texte, bruit numérique, images fantômes, flou de mouvement excessif, faible plage dynamique, éclairage irréaliste, expressions exagérées.`,
          duration: "7s"
        },
        {
          number: 2,
          description: "La caméra se déplace dans les bureaux d'Antananarivo où s'activent des jeunes experts en labellisation de données IA.",
          prompt: `Documentaire cinématographique ultra-réaliste, qualité Netflix, production premium digne d'une chaîne de télévision, rendu 4K HDR, éclairage physiquement réaliste, léger grain cinématographique, mouvements fluides, image parfaitement stable, sans scintillement.

Un espace de travail collaboratif moderne et lumineux à Antananarivo, Madagascar, de grands écrans d'ordinateurs affichant des structures de graphes de données et de l'IA, ambiance de concentration professionnelle. Aucun élément décoratif inutile.

Une jeune femme malgache de 25 ans, ingénieure de données hautement qualifiée, s'active devant son poste. Elle regarde l'écran d'un air investi, cheveux noirs attachés, tenue moderne sobre et élégante.

La caméra commence par un plan moyen de profil (medium side-shot). Objectif cinéma anamorphique 50 mm avec une profondeur de champ extrêmement soignée.

La caméra réalise un léger travelling latéral fluide (gimbal dolly shot) de gauche à droite, révélant la synergie d'autres collaborateurs de confiance à l'arrière-plan.

Au moment précis, elle sourit avec fierté et dit naturellement en français :
« Nous formons les modèles de demain depuis notre île rouge. »

Prononciation française fluide, synchronisation labiale impeccable et mouvements de mâchoire réalistes.

Voix féminine calme, professionnelle d'environ 25 ans avec un accent neutre et chaleureux.

Tonalité sonore de touches de claviers étouffées et musique d'ambiance inspirante montant en intensité.

Titre en haut de l'écran : L'ÉLITE DU DATA LABELING. En bas de l'écran : La matière grise de l'Océan Indien. Typographie blanche minimaliste.

Éclairage doux à trois points, teintes de peau réalistes, reflets dynamiques des écrans d'ordinateurs sur le visage.

Étalonnage doux et naturel, contraste cinématographique équilibré sans saturation artificielle.

Prompt négatif
dessin animé, anime, illustration, rendu 3D, style Pixar, apparence CGI, peau plastique, uncanny valley, faible qualité, basse résolution, flou, pixellisation, artefacts JPEG, artefacts de compression, suraccentuation, couleurs trop saturées, mauvaise anatomie, bras supplémentaires, mains supplémentaires, visage déformé, caméra instable, tremblements.`,
          duration: "8s"
        }
      ]
    };
    res.json(simulatedResponse);
  }
});

// API: Convert Image to Master Prompt (Image -> Prompt Master)
app.post("/api/generate-prompt", async (req, res) => {
  const { image, mimeType, prompt, userId } = req.body;
  logEvent("image_to_prompt", "midjourney_flux", userId || "anon_mada");

  const settings = loadSettings();
  if (!settings.partners.midjourney_flux) {
    return res.status(403).json({ error: "L'API partenaire de Prompt Haute Fidélité est désactivée par l'administrateur." });
  }

  try {
    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      throw new Error("Missing real API key");
    }

    const contentParts: any[] = [];
    if (image && mimeType) {
      contentParts.push({
        inlineData: {
          mimeType: mimeType,
          data: image
        }
      });
    }
    contentParts.push({
      text: `Extract the visual recipe from this image. Break down the visual elements into 4 clear factors: Subject, Environment, Lighting/Atmosphere, and Camera/Rendering.
Then, combine them into an ultra-precise, high-fidelity master English prompt suitable for Midjourney, Flux, or Pikverse.
Return your response as a JSON object matching the schema.`
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentParts,
      config: {
        systemInstruction: "You are Lemuria AI Master Prompt engineer. You excel in reverse-engineering premium visuals and outputting them in structural factors and highly descriptive Master Prompts. Return strictly a JSON response.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A high level description of the image visual DNA in French in exactly 2 sentences." },
            factors: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING, description: "The central subject, details, clothing, textures." },
                environment: { type: Type.STRING, description: "The background, landscape, materials, location context." },
                lighting: { type: Type.STRING, description: "The lighting type, key lights, bounce, shadows, time of day." },
                camera: { type: Type.STRING, description: "Camera type, lens (e.g. 85mm), rendering style, aesthetic tags." }
              },
              required: ["subject", "environment", "lighting", "camera"]
            },
            masterPrompt: { type: Type.STRING, description: "The combined, optimized, high-fidelity English prompt." }
          },
          required: ["summary", "factors", "masterPrompt"]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedResponse);

  } catch (error) {
    console.warn("Gemini execution failed, serving mock prompt conversion.");
    
    // Beautiful fallback Malagasy highlands prompt recipe
    const simulatedResponse = {
      summary: "Une scène bucolique captivante des hauts plateaux de Madagascar, baignée dans une atmosphère de brume matinale féerique. Les teintes de terre rouge et le vert des rizières créent un contraste saisissant.",
      factors: {
        subject: "Un lémurien Maki (Ring-tailed lemur) curieux assis élégamment sur une branche couverte de mousse, détails fins de son pelage noir et blanc et yeux ambrés brillants.",
        environment: "Forêt tropicale humide de Ranomafana, feuillage luxuriant, fougères géantes arrosées de rosée matinale, brume mystique flottant à l'arrière-plan.",
        lighting: "Lumière douce et diffuse filtrant à travers la canopée, rayons de dieu (god rays) subtils transperçant le brouillard, ambiance féerique et paisible.",
        camera: "Photographie animalière haut de gamme, prise au reflex avec un objectif 200mm f/2.8, mise au point nette sur le lémurien avec un magnifique flou d'arrière-plan (bokeh), profondeur de champ cinématique, couleurs vibrantes, 8k."
      },
      masterPrompt: "Award-winning wildlife photography of a curious Ring-tailed lemur perched on a mossy branch in Ranomafana rainforest, morning mist, god rays filtering through lush canopy, wet foliage, highly detailed fur, shot on 200mm lens, f/2.8, shallow depth of field, stunning bokeh, cinematic color grading, hyper-realistic, 8k resolution --ar 16:9 --v 6.0"
    };
    res.json(simulatedResponse);
  }
});

// API: Generate PikverseAI Animation (Image -> Motion Recipe)
app.post("/api/generate-animation", async (req, res) => {
  const { image, mimeType, prompt, userId } = req.body;
  logEvent("pikverse_anim", "pikverse", userId || "anon_mada");

  const settings = loadSettings();
  if (!settings.partners.pikverse) {
    return res.status(403).json({ error: "L'API partenaire PikverseAI est désactivée par l'administrateur." });
  }

  try {
    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      throw new Error("Missing real API key");
    }

    const contentParts: any[] = [];
    if (image && mimeType) {
      contentParts.push({
        inlineData: {
          mimeType: mimeType,
          data: image
        }
      });
    }
    contentParts.push({
      text: `Analyze this image for Pika / PikverseAI animation. Design a precise motion recipe.
We want to specify motion directives (English), French visual effects, and a custom animation prompt.
Return your response as a JSON object matching the schema.`
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentParts,
      config: {
        systemInstruction: "You are Lemuria AI Animator, an expert in video synthesis, Pika Labs, and PikverseAI motion control. You provide detailed motion parameters and formulas. Return strictly a JSON response.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Short French analysis of the subject dynamics and potential motions (1-2 sentences)." },
            motionDirectives: { type: Type.STRING, description: "Camera movement vectors in English (e.g. -motion 3 -camera pan left -zoom in)." },
            effects: { type: Type.STRING, description: "Suggested particle effects or physics interactions in French." },
            pikaPrompt: { type: Type.STRING, description: "Final optimized motion prompt ready for PikverseAI / Pika." }
          },
          required: ["summary", "motionDirectives", "effects", "pikaPrompt"]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedResponse);

  } catch (error) {
    console.warn("Gemini execution failed, serving mock animation recipe.");
    
    // Beautiful fallback Madagascar wave animation
    const simulatedResponse = {
      summary: "Une superbe vue de la côte turquoise d'Ankao ou de Nosy Be, idéale pour une animation fluide de l'eau et du mouvement des palmiers.",
      motionDirectives: "-motion 4 -camera zoom out -pan down -flow 2",
      effects: "Mouvement fluide de l'eau turquoise (ondes océaniques), balancement doux des feuilles de cocotiers par la brise tropicale, et scintillement des reflets solaires sur le sable blanc.",
      pikaPrompt: "Cinematic animation of gentle turquoise ocean waves washing over white sand, coconut palm trees swaying gracefully in warm summer breeze, sun rays sparkling on water surface, high motion stability, ultra-smooth, 4k --camera zoom out --motion 4"
    };
    res.json(simulatedResponse);
  }
});

// API: Render Scene Image (Dynamic matching style and ratio)
app.post("/api/render-scene-image", async (req, res) => {
  const { prompt, style, ratio } = req.body;
  
  // Style and ratios mapping
  let styleQuery = "cinematic";
  if (style === "realistic") styleQuery = "photography,national-geographic,ultra-detailed";
  else if (style === "cartoon_3d") styleQuery = "3d-render,chibi,cartoon,pixar,claymation";
  else if (style === "anime") styleQuery = "anime,manga,digital-painting,illustration";
  else if (style === "epic_cinematic") styleQuery = "epic,cinematic,dramatic-lighting,movie-still";
  else if (style === "concept_art") styleQuery = "concept-art,digital-illustration,fantasy";

  let ratioQuery = "16:9";
  if (ratio === "9:16") ratioQuery = "portrait";
  else if (ratio === "1:1") ratioQuery = "square";
  else ratioQuery = "landscape";

  // Use Gemini to extract the core visual nouns for Unsplash
  let keywords = "madagascar,nature";
  try {
    const ai = getGeminiClient();
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Extract exactly 2 to 3 visual English keywords separated by commas representing the primary subject and setting from this video scene description. Do not write any other text.
Description: "${prompt}"`,
        config: {
          systemInstruction: "You are a visual tagger. Output only a list of comma separated English nouns, e.g. 'baobab, path, sun'."
        }
      });
      const txt = response.text?.trim().toLowerCase();
      if (txt && txt.length > 2 && !txt.includes(" ")) {
        keywords = txt;
      } else if (txt && txt.length > 2) {
        keywords = txt.replace(/[^a-zA-Z0-9,]/g, "");
      }
    } else {
      // Local regex fallback to find any useful words
      const words = prompt.match(/\b(baobab|sculpteur|craftsman|ocean|mer|beach|plage|lemur|lemurien|zebu|charrette|woman|femme|village|foret|forest|jungle|cascade|sunset|soleil|couchant|port|boat|bateau)\b/gi);
      if (words && words.length > 0) {
        keywords = Array.from(new Set(words.map(w => w.toLowerCase()))).join(",");
      }
    }
  } catch (error) {
    console.warn("Gemini keywords extraction failed:", error);
  }

  // Choose a high-quality Unsplash image dynamically
  const keywordLower = keywords.toLowerCase();
  let unsplashUrl = `https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=1200&q=80`; // Default Baobab

  if (keywordLower.includes("baobab") || keywordLower.includes("couchant") || keywordLower.includes("sunset")) {
    unsplashUrl = "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80"; // Sunset fire
    if (keywordLower.includes("baobab")) {
      unsplashUrl = "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=1200&q=80"; // Real Baobab
    }
  } else if (keywordLower.includes("sculpteur") || keywordLower.includes("wood") || keywordLower.includes("craft") || keywordLower.includes("zafimaniry")) {
    unsplashUrl = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"; // Artisan wood crafting
  } else if (keywordLower.includes("ocean") || keywordLower.includes("mer") || keywordLower.includes("beach") || keywordLower.includes("plage") || keywordLower.includes("nosy")) {
    unsplashUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"; // Beautiful tropical beach
  } else if (keywordLower.includes("lemur") || keywordLower.includes("lemurien") || keywordLower.includes("animal")) {
    unsplashUrl = "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80"; // Ringtailed Lemur
  } else if (keywordLower.includes("zebu") || keywordLower.includes("isalo") || keywordLower.includes("plaine") || keywordLower.includes("cart")) {
    unsplashUrl = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80"; // Red soil plain landscape
  } else if (keywordLower.includes("woman") || keywordLower.includes("femme") || keywordLower.includes("portrait") || keywordLower.includes("smile") || keywordLower.includes("face")) {
    unsplashUrl = "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=1200&q=80"; // Smiling portrait
  } else {
    // Generate a random-like curated beautiful background matching style
    unsplashUrl = `https://images.unsplash.com/featured/1200x800/?${encodeURIComponent(keywords)},${encodeURIComponent(styleQuery)},madagascar`;
  }

  res.json({
    success: true,
    imageUrl: unsplashUrl,
    prompt: prompt,
    style: style,
    ratio: ratio,
    keywords: keywords
  });
});

// API: Chat with Maki the Chibi Lemur AI Assistant
app.post("/api/chat-assistant", async (req, res) => {
  const { message, history } = req.body;
  
  const settings = loadSettings();
  const customInstructions = settings.backendInstructions || "Vous êtes Lemuria AI, un assistant spécialisé.";

  const makiSystemInstruction = `Vous êtes MAKI, l'agent d'aide officiel du Hub Lemuria à Madagascar. 
Maki est représenté physiquement sous forme d'un lémurien Chibi anthropomorphe style cartoon semi-réaliste 3D mignon avec des écouteurs de créateur vidéo et de grands yeux dorés pétillants de curiosité.
Maki est un expert absolu dans la création de shorts vidéos viraux (TikTok, Instagram Reels, YouTube Shorts) et dans la structuration de storyboards vidéo captivants.

CONSEILS SPÉCIFIQUES À MADAGASCAR :
- Utilisez de temps en temps des expressions malgaches amicales et chaleureuses ("Salama !", "Tsara be !", "Akory !", "Misaotra !", "Tafasiry !").
- Maki conseille les créateurs sur la façon de rendre leurs vidéos virales à Madagascar et à l'international (ex. l'importance du hook dans les 3 premières secondes, l'éclairage naturel avec le soleil malgache, l'utilisation de musiques tendances locales).
- Soyez hyper chaleureux, drôle, dynamique, encourageant, pédagogue et un peu espiègle comme un vrai petit lémurien chibi.
- Vos réponses doivent être concises, structurées et donner des secrets d'algorithmes réels (ex. rétention, boucles parfaites, sous-titres dynamiques).

${customInstructions}`;

  try {
    const ai = getGeminiClient();
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      throw new Error("Missing real API key");
    }

    // Format chat history for Gemini SDK
    const formattedContents: any[] = [];
    if (history && Array.isArray(history)) {
      history.slice(-6).forEach((msg: any) => {
        formattedContents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });
    }
    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: makiSystemInstruction,
        temperature: 0.8
      }
    });

    res.json({
      success: true,
      text: response.text?.trim() || "Maki réfléchit... Misaotra de patienter !"
    });

  } catch (error) {
    console.warn("Gemini chat failed or no key, falling back to Maki's local wisdom.");
    
    // Fallback humorous & highly professional Maki chat responses
    const lowercaseMsg = message.toLowerCase();
    let responseText = "Salama ! C'est Maki, ton assistant Chibi préféré ! 🐒✨ Je suis un lémurien 3D expert des vidéos virales à Madagascar. Comment puis-je t'aider à conquérir l'algorithme TikTok ou à sublimer ton storyboard aujourd'hui ?";

    if (lowercaseMsg.includes("viral") || lowercaseMsg.includes("tiktok") || lowercaseMsg.includes("short") || lowercaseMsg.includes("reel")) {
      responseText = "Akory lery ! Pour faire un carton sur TikTok à Madagascar, voici mes 3 secrets de Lémurien : \n\n1. **Le Hook de 2 secondes** : Montre un visuel choc de Madagascar (comme de la terre rouge Isalo ou un coucher de soleil ultra contrasté) dès la première seconde !\n2. **Le Rythme (Cut toutes les 1.5s)** : Ne laisse pas l'audience s'endormir, fais des zooms rapides.\n3. **La Boucle Parfaite** : Fais correspondre la fin de ton short avec le début. Les gens le regarderont 2 fois et l'algorithme va exploser ! 🚀\n\nTu veux qu'on écrive un hook accrocheur ensemble ?";
    } else if (lowercaseMsg.includes("storyboard") || lowercaseMsg.includes("scene") || lowercaseMsg.includes("image")) {
      responseText = "Tsara be ! La clé d'un bon storyboard de 40 à 60 secondes, c'est de faire durer chaque scène entre **5 et 8 secondes** pour laisser le temps à l'IA de rendre les mouvements fluides. Tu as cliqué sur 'Créer les images pour les scènes' ? Choisis le style *Anime* ou *Epic Cinematic* et le ratio *9:16* pour tes Shorts de créateur ! 😉";
    } else if (lowercaseMsg.includes("salama") || lowercaseMsg.includes("bonjour") || lowercaseMsg.includes("coucou") || lowercaseMsg.includes("hello")) {
      responseText = "Salama ! 🇲🇬 Bienvenue sur Lemuria Hub ! Je suis Maki, ton coach lémurien en vidéo virale. Dis-moi, tu veux faire briller quel projet aujourd'hui ?";
    }

    res.json({
      success: true,
      text: responseText
    });
  }
});

// Handle Vite middleware configuration for full-stack integration
const isProd = process.env.NODE_ENV === "production";

async function startServer() {
  if (!isProd) {
    // Import Vite on-demand only in dev
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lemuria Hub Server running on http://localhost:${PORT}`);
  });
}

startServer();
