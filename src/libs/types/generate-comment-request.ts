export interface GenerateCommentRequest {
  language: string;
  functionCodes: FunctionDetails[];
}

export interface FunctionDetails {
  functionName: string;
  functionCode: string;
}

export interface GenerateCommentResponse {
  [key: string]: string;
}
