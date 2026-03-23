export interface HarLog {
  log: {
    version: string;
    entries: HarEntry[];
  };
}

export interface HarEntry {
  startedDateTime?: string;
  request?: HarRequest;
  response?: HarResponse;
}

export interface HarRequest {
  method?: string;
  url?: string;
  queryString?: HarParam[];
  postData?: HarPostData;
}

export interface HarResponse {
  status: number;
  content: {
    text?: string;
    mimeType: string;
  };
}

export interface HarPostData {
  mimeType: string;
  text?: string;
  params?: HarParam[];
}

export interface HarParam {
  name: string;
  value: string;
}

/** A SAMLResponse found within a HAR entry */
export interface HarSamlMatch {
  /** The raw Base64 SAMLResponse value */
  samlResponse: string;
  /** The request URL where it was found */
  url: string;
  /** HTTP method */
  method: string;
  /** Timestamp from the HAR entry */
  timestamp: string;
  /** Where in the entry the SAMLResponse was found */
  source: "postData.params" | "postData.text" | "queryString";
}
