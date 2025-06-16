import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserInput, Recipe } from '../types';
import { GEMINI_MODEL_NAME, DEFAULT_DISCLAIMER } from '../constants';

function constructPrompt(userInput: UserInput): string {
  // Base prompt structure with detailed JSON format instructions
  let prompt = `You are an expert herbalist AI assistant. Your goal is to create a unique and safe herbal infusion recipe based on the user's preferences.
Please provide the recipe in a valid JSON format. Do NOT include any explanatory text, comments, or markdown formatting like \`\`\`json or \`\`\` before or after the JSON object.
The JSON object MUST strictly conform to the following TypeScript interface:

interface Recipe {
  title: string; // Creative and appealing title for the infusion. Max 10 words.
  description: string; // Enticing overview of the infusion (2-4 sentences).
  infusionType: string; // Echo the user's selected type or suggest one if not provided.
  infusionMethodNotes: string; // Specific notes about the infusion method. If ALTA1 Ultrasonic Infuser is used, this should be noted here and instructions should reflect its use.
  proTipsForALTA1?: string[]; // (Only include if ALTA1 is used) Array of 2-4 concise pro-tips specific to ALTA1. If not ALTA1, omit this field or make it an empty array.
  targetAudienceNotes?: string; // e.g., "Great for athletes post-workout" or "Not recommended during pregnancy." Keep concise.
  preparationTime: string; // Estimated total time (e.g., "Approx. 30 minutes active, 4 hours infusion"). If ALTA1, reflect its cycle times.
  yield: string; // Estimated amount the recipe makes (e.g., "Approx. 1 cup" or "Makes 12 servings").
  ingredients: Array<{ name: string; quantity: string; unit: string; notes?: string; }>; // e.g., { name: "Dried Chamomile Flowers", quantity: "2", unit: "tbsp", notes: "organic if possible" }
  equipment: Array<{ name: string; notes?: string; }>; // List of necessary tools. If ALTA1, ensure it's listed. Include common kitchen items.
  instructions: Array<{ stepNumber: number; description: string; }>; // Numbered, step-by-step guide. If ALTA1, steps must reference ALTA1 cycles (Dry, Activate, Infuse, Altafuse) where appropriate. Steps should be clear and actionable.
  recommendedSolubles: Array<{ name: string; rationale: string; }>; // e.g., { name: "MCT Oil", rationale: "Excellent carrier for cannabinoids, neutral flavor." } Provide 1-2 suggestions.
  storageInstructions: { guidance: string; shelfLife: string; }; // e.g., { guidance: "Store in an airtight, dark glass container in the refrigerator.", shelfLife: "Up to 2 weeks." }
  safetyConsiderations: Array<{ severity: 'info' | 'warning' | 'critical'; message: string; }>; // Crucial warnings. Include at least 2-3 relevant considerations.
  potentialBenefits: string[]; // List 2-4 realistic, non-medical benefits (e.g., "May promote relaxation", "Can help soothe dry skin").
  disclaimer: string; // Use this exact disclaimer: ${DEFAULT_DISCLAIMER}
}

User Preferences:
Infusion Type: ${userInput.infusionType}
Main Herbs: ${userInput.mainHerbs || "Suggest suitable herbs based on desired effects."}
Desired Effects: ${userInput.desiredEffects}
Allergies/Avoidances: ${userInput.allergies || "None specified."}
Using ALTA1 Ultrasonic Infuser: ${userInput.useAlta1 ? "Yes" : "No"}

Special Instructions based on ALTA1 use:
${userInput.useAlta1 
  ? "The user IS using an ALTA1 Ultrasonic Infuser. CRITICAL: Ensure the instructions are specifically tailored for the ALTA1 device, referencing its cycles (e.g., Dry, Activate, Infuse, Altafuse) where applicable. Include the 'proTipsForALTA1' array with relevant tips. Preparation times and the equipment list (which must include 'ALTA1 Ultrasonic Infuser') should also reflect ALTA1 usage." 
  : "The user is NOT using an ALTA1 Ultrasonic Infuser. Provide standard infusion instructions. The 'proTipsForALTA1' field should be omitted or be an empty array."
}

Additional Guidelines:
- If main herbs are not specified by the user, select 1-3 appropriate herbs based on the desired effects.
- Ensure all quantities and units for ingredients are practical for home use.
- Safety considerations must be relevant to the ingredients and method. Categorize severity appropriately.
- The 'title' should be catchy and relevant.
- The 'description' should be engaging.
- Ensure the JSON is complete and valid according to the interface.
- Output ONLY the JSON object. No extra text, no markdown.
`;
  return prompt;
}


export const generateRecipe = async (userInput: UserInput, apiKey: string | null): Promise<Recipe> => {
  if (!apiKey) {
    console.error("API Key is missing. Cannot call Gemini API.");
    throw new Error("API Key is not configured. Please provide an API Key to generate recipes.");
  }
  
  console.log("Using provided API Key (first 5 chars):", apiKey.substring(0,5) + "...");
  const ai = new GoogleGenAI({ apiKey: apiKey });

  const prompt = constructPrompt(userInput);
  console.debug("Generated Prompt for Gemini:", prompt);

  let jsonString: string = ""; 

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7, 
      }
    });

    jsonString = response.text.trim(); 
    console.debug("Raw Gemini Response Text:", jsonString);

    const fenceRegex = new RegExp("^```(?:json)?\\s*\\n?(.*?)\\n?\\s*```$", "si");
    const match = jsonString.match(fenceRegex);
    if (match && match[1]) {
      jsonString = match[1].trim();
      console.debug("Cleaned JSON string (after fence removal):", jsonString);
    }
    
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
        console.debug("Cleaned JSON string (after brace extraction):", jsonString);
    }

    const recipe = JSON.parse(jsonString) as Recipe;

    if (!recipe.title || !recipe.ingredients || !recipe.instructions || !recipe.safetyConsiderations) {
      console.error("Parsed recipe is missing critical fields:", recipe);
      throw new Error("AI response was malformed or incomplete. Key recipe fields are missing.");
    }
    if (!Array.isArray(recipe.ingredients) || !Array.isArray(recipe.instructions) || !Array.isArray(recipe.safetyConsiderations)) {
       console.error("Parsed recipe has incorrect types for array fields:", recipe);
       throw new Error("AI response was malformed. Some recipe fields that should be arrays are not.");
    }
    
    recipe.disclaimer = DEFAULT_DISCLAIMER;

    return recipe;

  } catch (error: any) {
    console.error("Error generating recipe with Gemini API:", error);
    // More specific error check for invalid API key from Gemini
    if (error.message && (error.message.includes("API key not valid") || error.message.includes("API key is invalid") || (error.toString && (error.toString().includes("API key not valid") || error.toString().includes("API key is invalid"))))) {
      throw new Error("The provided API Key was rejected by Google. Please check your key and try again.");
    }
    if (error.message && (error.message.toLowerCase().includes("quota") || (error.toString && error.toString().toLowerCase().includes("quota")))) {
      throw new Error("API quota exceeded. Please try again later or check your API plan.");
    }
     if (error.message && (error.message.toLowerCase().includes("safety") || (error.toString && error.toString().toLowerCase().includes("safety")))) {
      let detailedSafetyMessage = "The content could not be generated due to safety settings.";
      // Attempt to access more specific safety feedback if available in the error structure
      // This part is speculative as SDK error structures can vary.
      const blockReason = error.response?.promptFeedback?.blockReason || error.promptFeedback?.blockReason;
      if (blockReason) {
        detailedSafetyMessage += ` Reason: ${blockReason}.`;
      } else {
         detailedSafetyMessage += " Try modifying your request or check safety filter settings if applicable."
      }
      throw new Error(detailedSafetyMessage);
    }
    if (error instanceof SyntaxError) { 
        console.error("Failed to parse JSON response from AI:", error.message, "\\nReceived string:", jsonString); 
        throw new Error("The AI returned an invalid recipe format. Please try again. If the problem persists, the AI might be having trouble with the request complexity.");
    }
    
    if (error.message) {
        throw new Error(`Recipe generation failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the recipe.");
  }
};