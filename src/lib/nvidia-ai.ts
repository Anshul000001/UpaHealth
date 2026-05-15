import OpenAI from "openai";

// NVIDIA NIM uses OpenAI-compatible API
export const nvidiaAI = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export const NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";
