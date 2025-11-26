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
