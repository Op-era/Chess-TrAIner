console.log('Module loaded: services/aiService.ts');
import { MultiGameAnalysisReport } from '../types';

/**
 * This service communicates with a local Ollama server to get game analysis.
 */

export const analyzeMultipleGames = async (
    pgns: string[], 
    username: string, 
    ollamaUrl: string, 
    ollamaModel: string
): Promise<MultiGameAnalysisReport> => {
    
    const playerIdentifier = username.trim() || "the user";

    const prompt = `
You are a world-class chess coach, combining the strategic depth of Magnus Carlsen with the tactical sharpness of Hikaru Nakamura.
Your task is to analyze a collection of chess games played by "${playerIdentifier}" to identify recurring strategic themes, tactical patterns, and common mistakes across ALL games provided.

Here are the games in PGN format, separated by "---":
${pgns.join('\n---\n')}

Analyze all games from the perspective of "${playerIdentifier}". If their name doesn't match either player, analyze from the perspective of the player who made the most significant blunders.
Respond ONLY with a single JSON object matching the specified format. Do not include any other text, markdown, or explanations outside of the JSON structure.

The JSON output must have this structure:
{
  "playerName": "The name of the player being analyzed.",
  "overallSummary": "A high-level summary of the player's style, strengths, and most significant recurring weaknesses observed across all games.",
  "recurringThemes": [
    {
      "title": "A concise title for a recurring weakness (e.g., 'Neglecting King Safety', 'Poor Pawn Structure Management').",
      "description": "A detailed explanation of this weakness, how it manifests in the player's games, and advice on how to improve.",
      "examples": [
        {
          "gameDescription": "A short identifier for the game where the example occurred (e.g., 'vs Hikaru, 2024.05.15'). Use headers like White, Black, and Date from the PGN.",
          "moveNumber": "The move number of a specific mistake that illustrates this theme.",
          "moveNotation": "The notation of the incorrect move made (e.g., 'Nf3').",
          "fenBeforeMove": "The FEN string of the board position *before* the mistake.",
          "fenAfterMove": "The FEN string of the board position *after* the incorrect move was made.",
          "suggestedMove": "The suggested better move in standard algebraic notation (e.g., 'Be2').",
          "explanation": "A brief explanation of why this specific move is a good example of the recurring theme and why the suggested move is better."
        }
      ]
    }
  ]
}

Identify the 2-3 most important recurring themes. For each theme, provide a title, a detailed description, and 1-2 concrete examples from the provided games. Ensure all fields in the JSON structure are correctly populated.
`;
    console.log("DEBUG: Sending prompt to Ollama model:", ollamaModel, "at URL:", ollamaUrl);
    console.log("DEBUG: Full prompt:", prompt);

    let rawResponseText = '';
    try {
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: ollamaModel,
                prompt: prompt,
                format: 'json',
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("DEBUG: Ollama API Error Body:", errorBody);
            throw new Error(`Ollama API error (${response.status}): ${errorBody}`);
        }

        const data = await response.json();
        
        if (!data.response) {
            console.error("DEBUG: Ollama response was empty. Full response object:", data);
            throw new Error("Received an empty response from Ollama.");
        }
        
        // This is the raw string from the model.
        rawResponseText = data.response;
        console.log("DEBUG: Raw response from Ollama before parsing:", rawResponseText);

        const report: MultiGameAnalysisReport = JSON.parse(rawResponseText);
        console.log("DEBUG: Successfully parsed JSON report from AI.");
        return report;
        
    } catch (e) {
        console.error("FATAL ERROR in analyzeMultipleGames:", e);
        if (e instanceof SyntaxError) {
             console.error("DEBUG: The AI returned a response that is not valid JSON. See the raw response logged above.");
             throw new Error("Received an invalid JSON format from the AI. The model may not have followed instructions. Check the console for the raw AI response.");
        }
        throw e;
    }
};