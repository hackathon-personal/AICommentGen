export function getCohereRequestBody(prompt: string) {
  return {
    modelId: "cohere.command-text-v14",
    contentType: "application/json",
    accept: "*/*",
    body: JSON.stringify({
      prompt: prompt,
      max_tokens: 400,
      temperature: 0.8,
      top_k: 250,
      top_p: 1,
    }),
  };
}
