export function getAnthropicRequestBody(prompt: string) {
  return {
    modelId: "anthropic.claude-instant-v1",
    contentType: "application/json",
    accept: "*/*",
    body: JSON.stringify({
      prompt: prompt,
      max_tokens_to_sample: 300,
      temperature: 1,
      top_k: 250,
      top_p: 0.999,
      stop_sequences: ["Human:"],
      anthropic_version: "bedrock-2023-05-31",
    }),
  };
}
