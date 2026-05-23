import { pipeline } from "@xenova/transformers";

let embeddingPipeline: any = null;

async function getPipeline() {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
    );
  }

  return embeddingPipeline;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await getPipeline();

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data as Float32Array);
}
