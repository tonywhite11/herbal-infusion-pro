export enum InfusionType {
  Balm = "Balm",
  Tincture = "Tincture",
  Edible = "Edible",
  DrinkMixTea = "Drink Mix/Tea",
  InfusedOil = "Infused Oil",
  Syrup = "Syrup",
  Salve = "Salve",
  Lotion = "Lotion",
  Gummy = "Gummy",
  Capsule = "Capsule",
  Other = "Other (Specify in Desired Effects)",
}

export interface UserInput {
  infusionType: InfusionType;
  mainHerbs: string;
  desiredEffects: string;
  allergies: string;
  useAlta1: boolean;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
}

export interface RecipeEquipmentItem {
  name: string;
  notes?: string;
}

export interface RecipeStep {
  stepNumber: number;
  description: string;
}

export interface RecommendedSoluble {
  name: string;
  rationale: string;
}

export interface StorageInfo {
  guidance: string;
  shelfLife: string;
}

export enum SafetySeverity {
  Info = "info",
  Warning = "warning",
  Critical = "critical",
}

export interface SafetyNote {
  severity: SafetySeverity;
  message: string;
}

export interface Recipe {
  title: string;
  description: string;
  infusionType: string;
  infusionMethodNotes: string;
  proTipsForALTA1?: string[];
  targetAudienceNotes?: string;
  preparationTime: string;
  yield: string;
  ingredients: RecipeIngredient[];
  equipment: RecipeEquipmentItem[];
  instructions: RecipeStep[];
  recommendedSolubles: RecommendedSoluble[];
  storageInstructions: StorageInfo;
  safetyConsiderations: SafetyNote[];
  potentialBenefits: string[];
  disclaimer: string;
}

export type ApiKeyStatus = 
  | 'idle' 
  | 'checking' 
  | 'valid' 
  | 'missing' 
  | 'invalid_format'
  | 'error_api';