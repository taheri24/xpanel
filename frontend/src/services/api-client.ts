// Auto-generated from OpenAPI spec - Do not edit manually

// Generated from OpenAPI spec with MD5 checksum: d4fdb9dee5742591b378d5e758e9fd10

import ky from 'ky';


export interface GetApiV1UsersResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}

export interface PostApiV1UsersResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}

export interface GetApiV1UsersParams {
  id: any; // User ID
}

export interface GetApiV1UsersResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}

export interface PutApiV1UsersParams {
  id: any; // User ID
}

export interface PutApiV1UsersResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}

export interface DeleteApiV1UsersParams {
  id: any; // User ID
}

export interface DeleteApiV1UsersResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}

export interface GetApiV1XfeaturesResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}

export interface GetApiV1XfeaturesParams {
  name: any; // Feature name
}

export interface GetApiV1XfeaturesResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}

export interface PostApiV1XfeaturesActionsParams {
  name: any; // Feature name
  actionId: any; // Action ID
}

export interface PostApiV1XfeaturesActionsResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}

export interface GetApiV1XfeaturesBackendParams {
  name: any; // Feature name
}

export interface GetApiV1XfeaturesBackendResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}

export interface GetApiV1XfeaturesFrontendParams {
  name: any; // Feature name
}

export interface GetApiV1XfeaturesFrontendResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}

export interface GetApiV1XfeaturesMappingsParams {
  name: any; // Feature name
}

export interface GetApiV1XfeaturesMappingsResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}

export interface PostApiV1XfeaturesQueriesParams {
  name: any; // Feature name
  queryId: any; // Query ID
}

export interface PostApiV1XfeaturesQueriesResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}

export interface GetHealthResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}

export interface GetReadyResponse {
  data: any;
  status: number;
  headers: Record<string, any>;
}


export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  retry?: number;
  headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';


export class XPanelApiClient {
  static readonly SPEC_CHECKSUM = 'd4fdb9dee5742591b378d5e758e9fd10';
  private baseUrl: string;
  private ky: typeof ky;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    this.ky = ky.create({ prefixUrl: baseUrl });
  }

  async getApiV1Users(options?: RequestOptions): Promise<GetApiV1UsersResponse> {
    const url = '/api/v1/users';
    const response = await this.ky.get(url, {
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }

  async postApiV1Users(options?: RequestOptions): Promise<PostApiV1UsersResponse> {
    const url = '/api/v1/users';
    const response = await this.ky.post(url, {
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }

  async getApiV1Users(params: GetApiV1UsersParams, options?: RequestOptions): Promise<GetApiV1UsersResponse> {
    const url = `/api/v1/users/${params.id}`;
    const response = await this.ky.get(url, {
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }

  async putApiV1Users(params: PutApiV1UsersParams, options?: RequestOptions): Promise<PutApiV1UsersResponse> {
    const url = `/api/v1/users/${params.id}`;
    const response = await this.ky.put(url, {
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }

  async deleteApiV1Users(params: DeleteApiV1UsersParams, options?: RequestOptions): Promise<DeleteApiV1UsersResponse> {
    const url = `/api/v1/users/${params.id}`;
    const response = await this.ky.delete(url, {
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }

  async getApiV1Xfeatures(options?: RequestOptions): Promise<GetApiV1XfeaturesResponse> {
    const url = '/api/v1/xfeatures';
    const response = await this.ky.get(url, {
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }

  async getApiV1Xfeatures(params: GetApiV1XfeaturesParams, options?: RequestOptions): Promise<GetApiV1XfeaturesResponse> {
    const url = `/api/v1/xfeatures/${params.name}`;
    const response = await this.ky.get(url, {
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }

  async postApiV1XfeaturesActions(params: PostApiV1XfeaturesActionsParams, options?: RequestOptions): Promise<PostApiV1XfeaturesActionsResponse> {
    const url = `/api/v1/xfeatures/${params.name}/actions/${params.actionId}`;
    const response = await this.ky.post(url, {
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }

  async getApiV1XfeaturesBackend(params: GetApiV1XfeaturesBackendParams, options?: RequestOptions): Promise<GetApiV1XfeaturesBackendResponse> {
    const url = `/api/v1/xfeatures/${params.name}/backend`;
    const response = await this.ky.get(url, {
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }

  async getApiV1XfeaturesFrontend(params: GetApiV1XfeaturesFrontendParams, options?: RequestOptions): Promise<GetApiV1XfeaturesFrontendResponse> {
    const url = `/api/v1/xfeatures/${params.name}/frontend`;
    const response = await this.ky.get(url, {
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }

  async getApiV1XfeaturesMappings(params: GetApiV1XfeaturesMappingsParams, options?: RequestOptions): Promise<GetApiV1XfeaturesMappingsResponse> {
    const url = `/api/v1/xfeatures/${params.name}/mappings`;
    const response = await this.ky.get(url, {
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }

  async postApiV1XfeaturesQueries(params: PostApiV1XfeaturesQueriesParams, options?: RequestOptions): Promise<PostApiV1XfeaturesQueriesResponse> {
    const url = `/api/v1/xfeatures/${params.name}/queries/${params.queryId}`;
    const response = await this.ky.post(url, {
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }

  async getHealth(options?: RequestOptions): Promise<GetHealthResponse> {
    const url = '/health';
    const response = await this.ky.get(url, {
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }

  async getReady(options?: RequestOptions): Promise<GetReadyResponse> {
    const url = '/ready';
    const response = await this.ky.get(url, {
      ...options,
    }).json<any>();
    return {
      data: response,
      status: 200,
      headers: {},
    };
  }
}

export default XPanelApiClient;