import { getAnthropicRequestBody } from "@libs/anthropic";
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
  ): Promise<GenerateCommentResponse[]> {
    let generatedCommentResponses: GenerateCommentResponse[] = [];
    let prompt: string = this.generatePrompt(language, functionCodes);

    const generatedCommentResponse = await this.callAnthropic(prompt);
    console.log("generatedCommentResponse", generatedCommentResponse);
    const transformedResponses = this.transformResponse(
      generatedCommentResponse
    );
    transformedResponses.forEach((generatedComment, index) => {
      generatedCommentResponses.push({
        functionName: functionCodes[index].functionName,
        generatedComment: generatedComment,
      });
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
    if (language === "TypeScript")
      return `Human: ${PROMPT_TEXTS.TypeScriptBatch} ${functionCodeForPrompt} Assistant:`;
    else throw new Error("Language not supported");
  }

  private async callAnthropic(prompt: string) {
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
