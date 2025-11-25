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

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new ApiError(response.status, errorData.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/users`);
  return handleResponse<User[]>(response);
}

export async function getUserById(id: number): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);
  return handleResponse<User>(response);
}

export async function createUser(userData: CreateUserRequest): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return handleResponse<User>(response);
}

export async function updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return handleResponse<User>(response);
}

export async function deleteUser(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<{ message: string }>(response);
}

export async function checkHealth(): Promise<{ status: string }> {
  const response = await fetch('/health');
  return handleResponse<{ status: string }>(response);
}
