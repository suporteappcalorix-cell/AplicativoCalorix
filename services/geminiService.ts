
import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAiInstance = (): GoogleGenAI => {
  const apiKey = process?.env?.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export async function getCoachAdvice(userData: string, prompt: string) {
  try {
    const aiInstance = getAiInstance();
    const response = await aiInstance.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Contexto: Você é um nutricionista formado em Harvard e treinador de elite chamado Leo. Você está ajudando um usuário no aplicativo Calorix.
      Perfil e Contexto do Usuário: ${userData}
      Pergunta/Tópico: ${prompt}
      Estilo: Minimalista, científico mas encorajador, breve, autoritário mas amigável. Foco total em perda de peso e saúde. Evite enrolação.
      IMPORTANTE: Responda sempre em Português do Brasil (pt-BR).`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return "Mantenha o foco nos seus objetivos hoje!";
  }
}

export async function analyzeFoodImage(base64Image: string) {
  const timestamp = new Date().toISOString();
  try {
    const aiInstance = getAiInstance();
    const response = await aiInstance.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: `Aja como um nutricionista sênior. Identifique APENAS os alimentos visíveis nesta imagem. 
            Regras estritas:
            1. Ignore talheres, pratos, mãos, copos vazios ou o fundo.
            2. Se não houver comida clara na imagem, retorne uma lista vazia.
            3. Estime porções baseadas no prato padrão brasileiro.
            4. Use a Tabela TACO como referência para macros e calorias.
            
            Retorne um JSON com o campo "foods" contendo um array de objetos.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foods: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER },
                  fat: { type: Type.NUMBER },
                  servingSize: { type: Type.STRING },
                  category: { type: Type.STRING },
                  micronutrients: {
                    type: Type.OBJECT,
                    properties: {
                      fiber: { type: Type.NUMBER },
                      sodium: { type: Type.NUMBER }
                    }
                  }
                },
                required: ['name', 'calories', 'protein', 'carbs', 'fat', 'servingSize', 'category']
              }
            }
          },
          required: ['foods']
        }
      }
    });

    const data = JSON.parse(response.text.trim());
    
    // Log para debug interno
    console.debug(`[AI_SCAN][${timestamp}] Success`, data);

    if (!data.foods || data.foods.length === 0) {
      return { status: 'NO_FOOD_FOUND', foods: [] };
    }

    return { status: 'SUCCESS', foods: data.foods };
  } catch (error: any) {
    console.error(`[AI_SCAN_ERROR][${timestamp}]`, {
      message: error.message,
      stack: error.stack
    });

    if (error.message === "API_KEY_MISSING") {
      throw new Error("CONFIG_ERROR");
    }
    
    throw new Error("ANALYSIS_FAILED");
  }
}
