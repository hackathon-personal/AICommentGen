export interface GenerateCommentRequest {
  language: string;
  functionCodes: FunctionDetails[];
}

export interface FunctionDetails {
  functionName: string;
  functionCode: string;
}

export interface GenerateCommentResponse {
  functionName: string;
  generatedComment: string;
}
