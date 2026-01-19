
import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

// Esta função garante que o cliente de IA seja inicializado apenas quando necessário e se a chave existir.
const getAiInstance = (): GoogleGenAI => {
  const apiKey = process?.env?.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING: A chave da API do Google Gemini não foi configurada no ambiente.");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export async function getCoachAdvice(userData: string, prompt: string) {
  try {
    const aiInstance = getAiInstance(); // Carregamento preguiçoso e verificação da chave
    const response = await aiInstance.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Contexto: Você é um nutricionista formado em Harvard e treinador de elite chamado Leo. Você está ajudando um usuário no aplicativo Calorix.
      Perfil e Contexto do Usuário: ${userData}
      Pergunta/Tópico: ${prompt}
      Estilo: Minimalista, científico mas encorajador, breve, autoritário mas amigável. Foco total em perda de peso e saúde. Evite enrolação.
      IMPORTANTE: Responda sempre em Português do Brasil (pt-BR).`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Erro no Gemini:", error);
    if (error instanceof Error && error.message.startsWith("API_KEY_MISSING")) {
      return "Erro de configuração: A chave da API não foi encontrada. O administrador precisa configurar a variável de ambiente API_KEY.";
    }
    return "Desculpe, meu cérebro de Harvard está um pouco cansado agora. Tente novamente em instantes!";
  }
}

export async function analyzeFoodImage(base64Image: string) {
  try {
    const aiInstance = getAiInstance(); // Carregamento preguiçoso e verificação da chave
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
            text: `Identifique os alimentos nesta imagem. Foque em pratos típicos brasileiros e porções comuns no Brasil.
            Retorne uma lista detalhada de cada item visível no prato.
            Seja preciso com as calorias, macros e também micronutrientes baseando-se em tabelas nutricionais confiáveis (como a TACO).
            Estime os valores para a porção visualizada.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Nome do alimento em português' },
              calories: { type: Type.NUMBER, description: 'Calorias aproximadas' },
              protein: { type: Type.NUMBER, description: 'Gramas de proteína' },
              carbs: { type: Type.NUMBER, description: 'Gramas de carboidratos' },
              fat: { type: Type.NUMBER, description: 'Gramas de gordura' },
              servingSize: { type: Type.STRING, description: 'Porção estimada (ex: 100g, 1 concha, 2 fatias)' },
              category: { type: Type.STRING, description: 'Categoria do alimento (frutas, legumes, verduras, grãos, carnes, laticínios, industrializados, bebidas, outros)' },
              micronutrients: {
                type: Type.OBJECT,
                properties: {
                  fiber: { type: Type.NUMBER, description: 'Fibras em gramas' },
                  sodium: { type: Type.NUMBER, description: 'Sódio em miligramas' },
                  potassium: { type: Type.NUMBER, description: 'Potássio em miligramas' },
                  calcium: { type: Type.NUMBER, description: 'Cálcio em miligramas' },
                  iron: { type: Type.NUMBER, description: 'Ferro em miligramas' },
                  vitC: { type: Type.NUMBER, description: 'Vitamina C em miligramas' }
                }
              }
            },
            required: ['name', 'calories', 'protein', 'carbs', 'fat', 'servingSize', 'category']
          }
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Erro ao analisar imagem:", error);
    if (error instanceof Error && error.message.startsWith("API_KEY_MISSING")) {
      // Re-lança um erro específico para a interface do usuário lidar com ele
      throw new Error("A chave da API do Gemini não está configurada. Por favor, contate o suporte.");
    }
    throw error;
  }
}
