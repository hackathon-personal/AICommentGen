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
    for (let functionCode of functionCodes) {
      const prompt = this.generatePrompt(language, functionCode);
      const generatedCommentResponse = await this.callAnthropic(prompt);
      generatedCommentResponses.push({
        functionName: functionCode.functionName,
        generatedComment: generatedCommentResponse?.completion || "",
      });
    }
    return generatedCommentResponses;
  }

  private generatePrompt(language: string, functionDetails: FunctionDetails) {
    if (language === "TypeScript")
      return `Human: ${PROMPT_TEXTS.TypeScript} ${functionDetails.functionCode} Assistant:`;
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
    parsedResponse = this.transformResponse(parsedResponse);
    return parsedResponse;
  }

  // remove extra text from response other than generated comment
  private transformResponse(parsedResponse: any) {
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
    return parsedResponse;
  }
}
