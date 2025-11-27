import ky, { HTTPError } from 'ky';

const API_BASE_URL = '/api/v1';

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
}

export interface UpdateUserRequest {
  username: string;
  email: string;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Create a ky instance with base configuration
const api = ky.create({
  prefixUrl: API_BASE_URL,
  hooks: {
    beforeError: [
      async (error) => {
        if (error instanceof HTTPError) {
          let errorMessage = `HTTP ${error.response.status}`;
          try {
            const errorData = await error.response.json() as { error?: string };
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // If response body is not JSON, use status message
          }
          throw new ApiError(error.response.status, errorMessage);
        }
        return error;
      },
    ],
  },
});

// Create a separate instance for health checks (different base URL)
const healthApi = ky.create({
  hooks: {
    beforeError: [
      async (error) => {
        if (error instanceof HTTPError) {
          let errorMessage = `HTTP ${error.response.status}`;
          try {
            const errorData = await error.response.json() as { error?: string };
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // If response body is not JSON, use status message
          }
          throw new ApiError(error.response.status, errorMessage);
        }
        return error;
      },
    ],
  },
});

export async function getUsers(): Promise<User[]> {
  return api.get('users').json<User[]>();
}

export async function getUserById(id: number): Promise<User> {
  return api.get(`users/${id}`).json<User>();
}

export async function createUser(userData: CreateUserRequest): Promise<User> {
  return api.post('users', { json: userData }).json<User>();
}

export async function updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
  return api.put(`users/${id}`, { json: userData }).json<User>();
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`users/${id}`);
}

export async function checkHealth(): Promise<{ status: string }> {
  return healthApi.get('/health').json<{ status: string }>();
}

// ============================================================================
// XFEATURE API FUNCTIONS
// ============================================================================

import type {
  XFeature,
  QueryRequest,
  QueryResponse,
  ActionRequest,
  ActionResponse,
  FrontendElements,
  MappingsResponse,
} from '../types/xfeature';

export async function getXFeatures(): Promise<string[]> {
  return api.get('xfeatures').json<string[]>();
}

export async function getXFeature(name: string): Promise<XFeature> {
  return api.get(`xfeatures/${name}`).json<XFeature>();
}

export async function executeXFeatureQuery<T = Record<string, unknown>>(
  featureName: string,
  queryId: string,
  params: QueryRequest
): Promise<QueryResponse<T>> {
  return api
    .post(`xfeatures/${featureName}/queries/${queryId}`, {
      json: params,
    })
    .json<QueryResponse<T>>();
}

export async function executeXFeatureAction(
  featureName: string,
  actionId: string,
  params: ActionRequest
): Promise<ActionResponse> {
  return api
    .post(`xfeatures/${featureName}/actions/${actionId}`, {
      json: params,
    })
    .json<ActionResponse>();
}

export async function getXFeatureFrontendElements(
  featureName: string
): Promise<FrontendElements> {
  return api.get(`xfeatures/${featureName}/frontend`).json<FrontendElements>();
}

export async function resolveXFeatureMappings(
  featureName: string
): Promise<MappingsResponse> {
  return api.get(`xfeatures/${featureName}/mappings`).json<MappingsResponse>();
}
