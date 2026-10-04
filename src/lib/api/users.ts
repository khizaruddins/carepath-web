import { api } from './client';
import { User } from './types';

export const usersApi = {
  getMe: () => api.get<User>('/users/me'),
};
