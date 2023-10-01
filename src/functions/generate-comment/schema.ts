export default {
  type: "object",
  properties: {
    language: { type: "string" },
    functionCodes: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  required: ["language", "functionCodes"],
} as const;
