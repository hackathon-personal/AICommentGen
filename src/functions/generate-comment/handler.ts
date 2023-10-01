import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse, formatResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import * as AWS from "aws-sdk";
import schema from "./schema";
import { getAnthropicRequestBody } from "@libs/anthropic";
import { PROMPT_TEXTS } from "@libs/constants/prompt-texts";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {
    console.log("Event", event);
    const { language, functionCodes } = event.body;
    // console.log("Version", `${AWS.VERSION}`);
    console.log("language", language);
    console.log("functionCodes", functionCodes);

    if (functionCodes.length === 0) {
      throw new Error("No function codes provided");
    }

    const prompt = `Human: ${PROMPT_TEXTS.TypeScript} ${functionCodes[0]} Assistant:`;
    const anthropicRequestParams = getAnthropicRequestBody(prompt);
    console.log("anthropicRequestParams", anthropicRequestParams);

    const bedrockRuntime = new AWS.BedrockRuntime({
      region: "us-east-1",
      apiVersion: "2023-09-30",
    });

    const bedrockRuntimeResponse = await bedrockRuntime
      .invokeModel(anthropicRequestParams)
      .promise();
    console.log("bedrockRuntimeResponse", bedrockRuntimeResponse);

    const convertedResponse = bedrockRuntimeResponse.body.toString("utf-8");
    const parsedResponse = JSON.parse(convertedResponse);
    if (parsedResponse?.completion) {
      const splitByInitialIdentifier = parsedResponse?.completion.split("/**");
      if (splitByInitialIdentifier?.length > 1) {
        const splitByEndIdentifier = splitByInitialIdentifier[1]?.split("*/");
        if (splitByEndIdentifier?.length > 0) {
          parsedResponse.completion = `/** ${splitByEndIdentifier[0]}*/`;
          console.log("formatted response", parsedResponse.completion);
        }
      }
    }
    return formatJSONResponse({
      message: `Generate Comment successful.`,
      response: JSON.parse(convertedResponse),
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
