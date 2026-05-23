import crypto from "crypto";
import { generateEmbedding } from "./embedding.js";

export type MemoryRecord = {
  id: string;
  text: string;
  embedding: number[];
  createdAt: string;
};

const memories: MemoryRecord[] = [];

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function saveMemory(text: string) {
  const embedding = await generateEmbedding(text);

  const memory: MemoryRecord = {
    id: crypto.randomUUID(),
    text,
    embedding,
    createdAt: new Date().toISOString(),
  };

  memories.unshift(memory);

  return memory;
}

export async function searchMemories(query: string) {
  const queryEmbedding = await generateEmbedding(query);

  const scored = memories.map((memory) => ({
    memory,
    score: cosineSimilarity(queryEmbedding, memory.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 5);
}

export function getRecentMemories(limit = 5) {
  return memories.slice(0, limit);
}

export function deleteMemory(id: string) {
  const index = memories.findIndex((memory) => memory.id === id);

  if (index >= 0) {
    memories.splice(index, 1);

    return true;
  }

  return false;
}
