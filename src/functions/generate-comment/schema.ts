export default {
  type: "object",
  properties: {
    language: { type: "string" },
    functionCodes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          functionName: { type: "string" },
          functionCode: { type: "string" },
        },
      },
    },
  },
  required: ["language", "functionCodes"],
} as const;
