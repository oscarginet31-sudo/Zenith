// FIX: Implemented the Gemini service to resolve module not found errors.
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, ZenithPrediction } from '../types';

// FIX: Initialize GoogleGenAI with a named apiKey parameter as required by the SDK.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Use a supported model name as per the guidelines.
const model = 'gemini-2.5-flash';

export const getZenithPrediction = async (transactions: Transaction[], totalIncome: number): Promise<ZenithPrediction | null> => {
    const spendingTransactions = transactions.filter(t => t.type === 'expense' && t.category !== 'Épargne');
    if (spendingTransactions.length < 3) {
        return null;
    }

    const prompt = `
        Voici une liste de transactions de dépenses (hors épargne) pour le mois en cours:
        ${JSON.stringify(spendingTransactions)}

        Le revenu total pour ce mois est de ${totalIncome.toFixed(2)} €.

        En te basant sur ces données, agis comme un conseiller financier expert nommé Zénith.
        1.  Calcule une projection des dépenses totales (hors épargne) pour le reste du mois.
        2.  Calcule le solde prévisionnel à la fin du mois (revenu total - dépenses projetées).
        3.  Fournis un conseil court et pertinent (maximum 30 mots) pour aider l'utilisateur à mieux gérer ses finances ou à atteindre ses objectifs, en te basant sur ses habitudes de dépenses.

        Retourne le résultat au format JSON.
    `;

    try {
        // FIX: Use the recommended ai.models.generateContent method to query the model.
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            // FIX: Add config for JSON response with responseSchema for structured output.
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        projectedExpenses: {
                            type: Type.NUMBER,
                            description: "Dépenses totales projetées pour le mois."
                        },
                        projectedBalance: {
                            type: Type.NUMBER,
                            description: "Solde prévisionnel à la fin du mois."
                        },
                        suggestion: {
                            type: Type.STRING,
                            description: "Conseil financier court et pertinent."
                        }
                    },
                    required: ["projectedExpenses", "projectedBalance", "suggestion"]
                }
            }
        });
        
        // FIX: Extract text directly from the response object using the .text property and parse it.
        const jsonText = response.text.trim();
        const result: ZenithPrediction = JSON.parse(jsonText);
        return result;

    } catch (error) {
        console.error("Error fetching Zenith prediction:", error);
        return null;
    }
};

export const getBehavioralAnalysis = async (transactions: Transaction[]): Promise<string | null> => {
    const spendingTransactions = transactions.filter(t => t.type === 'expense' && t.category !== 'Épargne');
    if (spendingTransactions.length < 5) {
        return null;
    }
    
    const prompt = `
        Analyse le comportement de dépenses de l'utilisateur basé sur la liste de transactions suivante (l'épargne a été exclue):
        ${JSON.stringify(spendingTransactions)}

        Agis comme un coach financier perspicace. Fournis une analyse comportementale courte (une ou deux phrases, 40 mots maximum) qui met en évidence une habitude de dépense clé (positive ou négative). L'analyse doit être encourageante et constructive. Ne commence pas par "Votre analyse comportementale est...". Va droit au but.

        Exemples:
        - "Il semble que vous maîtrisiez bien vos dépenses alimentaires, mais les sorties représentent une part importante de votre budget."
        - "Vous êtes très discipliné avec vos factures récurrentes. Bravo ! Pensez à allouer une petite partie de ce qui reste à l'épargne."
        - "Vos dépenses en loisirs sont fréquentes. Assurez-vous qu'elles correspondent à vos objectifs financiers à long terme."
    `;

    try {
        // FIX: Use the recommended ai.models.generateContent method.
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        
        // FIX: Extract text directly from the response object using the .text property.
        return response.text.trim();
    } catch (error) {
        console.error("Error fetching behavioral analysis:", error);
        return "Désolé, une erreur est survenue lors de l'analyse.";
    }
};