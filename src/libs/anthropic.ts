import { APPLICATION_CONSTANTS } from "./constants/application.constants";

export function getAnthropicRequestBody(prompt: string) {
  const model = APPLICATION_CONSTANTS.Anthropic.InstanceV1;
  return {
    modelId: model.modelId,
    contentType: model.contentType,
    accept: model.accepts,
    body: JSON.stringify({
      prompt: prompt,
      max_tokens_to_sample: model.body.max_tokens_to_sample,
      temperature: model.body.temperature,
      top_k: model.body.top_k,
      top_p: model.body.top_p,
      stop_sequences: model.body.stop_sequences,
      anthropic_version: model.body.anthropic_version,
    }),
  };
}
