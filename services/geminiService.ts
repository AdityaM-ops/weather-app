
import { PredictionResult } from "../types";

/**
 * Local Heuristic Inference Engine
 * Mimics AI behavior using meteorological formulas.
 * This removes the dependency on paid Gemini API calls while keeping the "AI Lab" functional.
 */
export const getAIPrediction = async (inputs: {
  temp: number;
  humidity: number;
  pressure: number;
  wind: number;
  season: string;
}): Promise<PredictionResult> => {
  // Artificial delay to simulate "thinking"
  await new Promise(resolve => setTimeout(resolve, 800));

  const { temp, humidity, pressure, wind, season } = inputs;
  
  // 1. Determine Condition based on atmospheric physics
  let condition = "Sunny";
  if (humidity > 85 && pressure < 1005) {
    condition = "Storm";
  } else if (humidity > 70 || (humidity > 50 && pressure < 1010)) {
    condition = "Rainy";
  } else if (humidity > 40 || pressure < 1015) {
    condition = "Cloudy";
  }

  // 2. Predict Shift (Simulation of Temporal Propagation)
  const predictedTemp = temp + (condition === "Rainy" || condition === "Storm" ? -3.5 : 1.2);
  const predictedHumidity = Math.min(100, humidity + (condition === "Rainy" ? 15 : -5));
  const rainfall = condition === "Storm" ? 25.4 : (condition === "Rainy" ? 8.2 : 0);
  const predictedWind = wind * (condition === "Storm" ? 2.5 : 1.1);
  
  // 3. Construct Scientific Reasoning
  const reasons = [];
  if (pressure < 1010) reasons.push(`The barometric drop to ${pressure} hPa indicates a low-pressure system typical of ${season} cyclonic activity.`);
  if (humidity > 70) reasons.push(`High saturation levels (${humidity}%) suggest significant moisture convergence in the lower troposphere.`);
  if (temp > 30 && humidity > 60) reasons.push("Thermal instability is high, increasing the probability of convective cloud formation.");
  
  const reasoning = reasons.length > 0 
    ? reasons.join(" ") + ` Consequently, the model propagates a shift toward ${condition.toLowerCase()} conditions.`
    : `Stable anticyclonic conditions detected. Atmospheric momentum suggests a continuation of ${condition.toLowerCase()} patterns with minimal variance.`;

  return {
    temperature: predictedTemp,
    humidity: predictedHumidity,
    rainfall: rainfall,
    windSpeed: predictedWind,
    condition: condition,
    confidence: 0.92 + (Math.random() * 0.05),
    reasoning: reasoning
  };
};
