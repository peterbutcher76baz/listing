"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getPropertyById } from "./properties";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateAiListing(propertyId: string, style: "Coastal" | "Executive" | "Modern") {
  // 1. Get the deep data we verified yesterday
  const property = await getPropertyById(propertyId);
  if (!property) return { ok: false, error: "Property not found" };

  // 2. Initialize the model
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // 3. Craft the "Agentic" Prompt
  const prompt = `
    You are an elite real estate copywriter. Write a compelling property listing in a ${style} style.
    
    DATA SET (RESO-compliant):
    - Address: ${property.address}, ${property.suburb}
    - Living Area: ${property.livingArea}m²
    - Parking: ${property.garageSpaces} Garage, ${property.carPortSpaces} Carports
    - Features: ${property.keyFeatures.join(", ")}
    - Schools: ${property.primarySchoolCatchment}
    
    TONE GUIDELINES:
    - If Coastal: Use airy, light, relaxed language. Mention the sea breeze and lifestyle.
    - If Executive: Focus on prestige, luxury finishes, and the "power" of the location.
    
    Structure the output with a catchy Headline, a Body Paragraph, and a Bulleted Feature List.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return { ok: true, content: response.text() };
  } catch (error) {
    console.error("AI Generation failed:", error);
    return { ok: false, error: "The AI is resting. Try again in a minute." };
  }
}
