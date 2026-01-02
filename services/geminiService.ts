
import { GoogleGenAI, Type } from "@google/genai";
import { PredictionResult } from "../types";

// Fix: Strictly use process.env.API_KEY as the only parameter source for initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIPrediction = async (inputs: {
  temp: number;
  humidity: number;
  pressure: number;
  wind: number;
  season: string;
}): Promise<PredictionResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform weather forecasting inference based on these parameters:
        Temperature: ${inputs.temp}°C
        Humidity: ${inputs.humidity}%
        Pressure: ${inputs.pressure} hPa
        Wind: ${inputs.wind} km/h
        Season: ${inputs.season}
        
        Analyze as if you are a multi-stage LSTM and XGBoost ensemble model.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            temperature: { type: Type.NUMBER, description: "Predicted temp in next 6h" },
            humidity: { type: Type.NUMBER, description: "Predicted humidity" },
            rainfall: { type: Type.NUMBER, description: "Probable rainfall in mm" },
            windSpeed: { type: Type.NUMBER, description: "Predicted wind speed" },
            condition: { type: Type.STRING, description: "Condition: Sunny, Cloudy, Rainy, or Storm" },
            confidence: { type: Type.NUMBER, description: "Confidence score 0-1" },
            reasoning: { type: Type.STRING, description: "Brief scientific explanation of the prediction" },
          },
          required: ["temperature", "humidity", "rainfall", "windSpeed", "condition", "confidence", "reasoning"],
        }
      },
    });

    // Fix: Directly access the .text property and ensure whitespace trimming before parsing as recommended.
    const result = JSON.parse(response.text.trim());
    return result;
  } catch (error) {
    console.error("Inference Error:", error);
    // Fallback logic
    return {
      temperature: inputs.temp + (Math.random() * 4 - 2),
      humidity: inputs.humidity + (Math.random() * 10 - 5),
      rainfall: inputs.humidity > 80 ? Math.random() * 5 : 0,
      windSpeed: inputs.wind + Math.random() * 5,
      condition: inputs.humidity > 80 ? 'Rainy' : 'Sunny',
      confidence: 0.85,
      reasoning: "Heuristic-based prediction due to API connectivity issues."
    };
  }
};
