export interface CarouselItem {
  id: string;
  name: string;
  url: string;
}

export interface PartnerToggles {
  google_flow: boolean;
  pikverse: boolean;
  midjourney_flux: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  partnerUrl: string;
}

export interface AdminSettings {
  promoCode: string;
  promoDiscount: string;
  carousel: CarouselItem[];
  partners: PartnerToggles;
  backendInstructions: string;
  ecommerceUrl: string;
  blogArticles: BlogPost[];
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: string;
}

export type SceneImageStyle = "realistic" | "cartoon_3d" | "anime" | "epic_cinematic" | "concept_art";
export type SceneImageRatio = "16:9" | "9:16" | "1:1";

export interface SceneRenderingState {
  isGenerating: boolean;
  style: SceneImageStyle;
  ratio: SceneImageRatio;
  currentSceneIndex: number; // Index of the scene currently being rendered
  renderedImages: { [sceneNumber: number]: string }; // Map of scene number to image URL / base64
}

export interface AnalyticsMetrics {
  storyboard_gen: number;
  image_to_prompt: number;
  pikverse_anim: number;
  affiliate_click_flow: number;
  affiliate_click_pikverse: number;
  prompt_copied: number;
  boutique_view: number;
  boutique_buy_click: number;
}

export interface LogEntry {
  timestamp: string;
  event_type: string;
  partner_id: string;
  user_id: string;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  logs: LogEntry[];
}

export interface StoryboardScene {
  number: number;
  description: string;
  prompt: string;
  duration: string;
}

export interface StoryboardResult {
  introduction: string;
  scenes: StoryboardScene[];
}

export interface PromptResult {
  summary: string;
  factors: {
    subject: string;
    environment: string;
    lighting: string;
    camera: string;
  };
  masterPrompt: string;
}

export interface AnimationResult {
  summary: string;
  motionDirectives: string;
  effects: string;
  pikaPrompt: string;
}

export type WorkspaceMode = "storyboard" | "prompt" | "animation" | "topmodel";
