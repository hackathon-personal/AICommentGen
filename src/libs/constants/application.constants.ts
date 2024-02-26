export const APPLICATION_CONSTANTS = {
  Anthropic: {
    InstanceV1: {
      modelId: "anthropic.claude-instant-v1",
      contentType: "application/json",
      accepts: "*/*",
      body: {
        max_tokens_to_sample: 2048,
        temperature: 0.5,
        top_k: 250,
        top_p: 0.999,
        stop_sequences: ["Human:"],
        anthropic_version: "bedrock-2023-05-31",
      },
    },
    HUMAN: "Human:",
    ASSISTANT: "Assistant:",
  },
};

export const SUPPORTED_LANGUAGES = {
  TypeScript: "TypeScript",
};

export const BED_ROCK_RUNTIME = {
  REGION: "us-east-1",
  API_VERSION: "2023-09-30",
};
