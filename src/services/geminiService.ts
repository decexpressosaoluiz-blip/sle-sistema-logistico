import { GoogleGenAI } from "@google/genai";
import { CTE } from "../types";

export const analyzeData = async (ctes: CTE[], context: string): Promise<string> => {
    // Tenta obter a chave de forma segura
    let apiKey = '';
    
    try {
        // 1. Tenta ler via injeção do Vite (configurado no vite.config.ts)
        // O bundler substitui 'process.env.API_KEY' pelo valor string real.
        // @ts-ignore
        apiKey = process.env.API_KEY;
    } catch (e) {
        // Ignora erros de referência se a substituição não ocorrer
    }

    // 2. Fallback para padrão VITE_ (import.meta.env)
    if (!apiKey && import.meta.env && import.meta.env.VITE_API_KEY) {
        apiKey = import.meta.env.VITE_API_KEY;
    }

    if (!apiKey) {
        console.error("Gemini API Key ausente.");
        return "⚠️ Configuração Necessária: Chave de API da IA não detectada. Configure a variável 'API_KEY' no painel da Vercel.";
    }

    try {
        // Inicializa a SDK correta (@google/genai)
        const ai = new GoogleGenAI({ apiKey });
        
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

        // Utiliza o modelo mais recente gemini-2.5-flash
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        if (response.text) {
             return response.text;
        }
        
        return "A IA processou os dados mas não retornou texto legível.";

    } catch (error: any) {
        console.error("Gemini Service Error:", error);
        return `Serviço Indisponível: ${error.message || 'Erro desconhecido na IA'}. Verifique se a API Key na Vercel é válida e se o modelo está acessível.`;
    }
};