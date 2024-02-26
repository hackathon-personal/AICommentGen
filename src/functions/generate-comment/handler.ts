import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse, formatResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import schema from "./schema";
import {
  GenerateCommentRequest,
  GenerateCommentResponse,
} from "@libs/types/generate-comment-request";
import { generatedCommentService } from "src/services";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {
    console.log("Event", event);
    const { language, functionCodes } = event.body;
    const generateCommentRequest: GenerateCommentRequest =
      event.body as GenerateCommentRequest;
    // console.log("Version", `${AWS.VERSION}`);
    console.log("language", language);
    console.log("functionCodes", functionCodes);

    if (functionCodes.length === 0) {
      throw new Error("No function codes provided");
    }

    let generatedCommentResponses: GenerateCommentResponse = {};
    generatedCommentResponses = await generatedCommentService.generateComment(
      language,
      generateCommentRequest.functionCodes
    );
    return formatJSONResponse({
      message: `Generated comment successful.`,
      response: generatedCommentResponses,
    });
  } catch (error) {
    console.log(error);
    return formatResponse(
      {
        message: `Generate Comment failed.`,
        error: JSON.stringify(error),
      },
      500
    );
  }
};

export const generateComment = middyfy(handler);
