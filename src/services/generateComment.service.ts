import { getAnthropicRequestBody } from "@libs/anthropic";
import {
  APPLICATION_CONSTANTS,
  BED_ROCK_RUNTIME,
  SUPPORTED_LANGUAGES,
} from "@libs/constants/application.constants";
import { ERROR_MESSAGES } from "@libs/constants/errors.constants";
import { PROMPT_TEXTS } from "@libs/constants/prompt-texts";
import {
  FunctionDetails,
  GenerateCommentResponse,
} from "@libs/types/generate-comment-request";
import * as AWS from "aws-sdk";

export class GenerateCommentService {
  constructor() {}

  public async generateComment(
    language: string,
    functionCodes: FunctionDetails[]
  ): Promise<GenerateCommentResponse> {
    let generatedCommentResponses: GenerateCommentResponse = {};

    let prompt: string = this.generatePrompt(language, functionCodes);

    const generatedCommentResponse = await this.callAnthropic(prompt);
    console.log("generatedCommentResponse", generatedCommentResponse);
    const transformedResponses = this.transformResponse(
      generatedCommentResponse
    );
    if (functionCodes.length == 1) {
      transformedResponses.splice(1);
    }

    transformedResponses.forEach((generatedComment, index) => {
      generatedCommentResponses[functionCodes[index].functionName] =
        generatedComment;
    });
    return generatedCommentResponses;
  }

  private generatePrompt(language: string, functionDetails: FunctionDetails[]) {
    const functionCodes = functionDetails.map(
      (functionDetails) => functionDetails.functionCode
    );
    let functionCodeForPrompt = functionCodes.reduce(
      (prevValue, currValue) => `${prevValue}${currValue}`,
      ""
    );
    if (language === SUPPORTED_LANGUAGES.TypeScript)
      return `${APPLICATION_CONSTANTS.Anthropic.HUMAN} ${
        functionDetails.length > 1
          ? PROMPT_TEXTS.TypeScriptBatch
          : PROMPT_TEXTS.TypeScript
      } ${functionCodeForPrompt} ${APPLICATION_CONSTANTS.Anthropic.ASSISTANT}`;
    else throw new Error(ERROR_MESSAGES.LANGUAGE_NOT_SUPPORTED);
  }

  private async callAnthropic(prompt: string) {
    const anthropicRequestParams = getAnthropicRequestBody(prompt);
    console.log("anthropicRequestParams", anthropicRequestParams);

    const bedrockRuntime = new AWS.BedrockRuntime({
      region: BED_ROCK_RUNTIME.REGION,
      apiVersion: BED_ROCK_RUNTIME.API_VERSION,
    });

    const bedrockRuntimeResponse = await bedrockRuntime
      .invokeModel(anthropicRequestParams)
      .promise();
    console.log("bedrockRuntimeResponse", bedrockRuntimeResponse);
    const convertedResponse = bedrockRuntimeResponse.body.toString("utf-8");

    let parsedResponse = JSON.parse(convertedResponse);
    // remove extra text from response other than generated comment
    // parsedResponse = this.transformResponse(parsedResponse);
    return parsedResponse?.completion || parsedResponse;
  }

  // remove extra text from response other than generated comment
  private transformResponse(response: string) {
    let transformedResponses: string[];
    const splitByInitialIdentifier = response.split("/**");
    if (splitByInitialIdentifier?.length > 0) {
      const checkFirstElementIsJsDoc =
        splitByInitialIdentifier[0].includes("*/");
      if (!checkFirstElementIsJsDoc) {
        splitByInitialIdentifier.splice(0, 1);
      }

      transformedResponses = splitByInitialIdentifier.map(
        (generatedComment) => `/** ${generatedComment.split("*/")[0]}*/`
      );
      console.log("transformedResponses", transformedResponses);
    }

    return transformedResponses;
  }
}
