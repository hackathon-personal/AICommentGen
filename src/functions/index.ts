import schema from "./hello/schema";
import generateCommentSchema from "./generate-comment/schema";

export const hello = {
  handler: `src/functions/hello/handler.main`,
  events: [
    {
      http: {
        method: "post",
        path: "hello",
        request: {
          schemas: {
            "application/json": schema,
          },
        },
      },
    },
  ],
};

export const generateComment = {
  handler: `src/functions/generate-comment/handler.generateComment`,
  timeout: 30,
  events: [
    {
      http: {
        method: "post",
        path: "generate-comment",
        request: {
          schemas: {
            "application/json": generateCommentSchema,
          },
        },
      },
    },
  ],
};
