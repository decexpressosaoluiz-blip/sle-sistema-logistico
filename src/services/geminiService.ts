import { GoogleGenerativeAI } from "@google/generative-ai";
import { CTE } from "../types";

export const analyzeData = async (ctes: CTE[], context: string): Promise<string> => {
    // Tenta obter a chave de forma segura
    let apiKey = '';
    
    try {
        // Tenta ler via process.env (injetado pelo vite.config.ts)
        // @ts-ignore
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
             // @ts-ignore
             apiKey = process.env.API_KEY;
        }
        
        // Se falhar, tenta via import.meta.env (Padrão Vite)
        if (!apiKey && import.meta.env && import.meta.env.VITE_API_KEY) {
            apiKey = import.meta.env.VITE_API_KEY;
        }
    } catch (e) {
        console.warn("Erro ao ler variáveis de ambiente", e);
    }

    if (!apiKey) {
        console.error("Gemini API Key ausente.");
        return "⚠️ Configuração Necessária: Chave de API da IA não detectada. Configure a variável 'API_KEY' no painel da Vercel.";
    }

    try {
        // Inicializa a SDK correta para Web/React
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Utiliza o modelo flash padrão (1.5) que é mais rápido e econômico
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Limita o tamanho do payload para economizar tokens e evitar erros de tamanho
        const summary = ctes.slice(0, 30).map(c => 
            `CTE:${c.cteNumber}|St:${c.status}|Val:${c.value}|Unit:${c.deliveryUnit}`
        ).join('\n');

        const prompt = `
        Atue como Consultor Logístico Sênior.
        Contexto: ${context}
        
        Dados de Amostra (Top 30):
        ${summary}
        
        Gere uma análise executiva em Markdown (máx 3 parágrafos curtos):
        1. Identifique o maior gargalo atual.
        2. Sugira uma ação imediata para a equipe.
        3. Estime o impacto financeiro se resolvido.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (text) {
             return text;
        }
        
        return "A IA processou os dados mas não retornou texto legível.";

    } catch (error: any) {
        console.error("Gemini Service Error:", error);
        return `Serviço Indisponível: ${error.message || 'Erro desconhecido na IA'}. Verifique se a API Key na Vercel é válida.`;
    }
};