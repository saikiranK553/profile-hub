export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
  profileImageUrl?: string;
}

export interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  phoneNumber: string;
  address: string;
  bio: string;
  createdAt: string;
  lastLogin: string;
  profileImageUrl: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponseDto;
  error?: string |null;
}

export interface LoginRequest{
  email: string;
  password: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}