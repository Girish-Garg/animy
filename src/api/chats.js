import { apiUtils } from '@/lib/apiClient';

// Single source of truth for the chat / video-generation endpoints.
export const chatsApi = {
  list: () => apiUtils.get('/chat').then((r) => r.data),
  get: (chatId) => apiUtils.get(`/chat/${chatId}`).then((r) => r.data),
  create: (body) => apiUtils.post('/chat', body).then((r) => r.data),
  remove: (chatId) => apiUtils.delete(`/chat/${chatId}`).then((r) => r.data),
  rename: (chatId, title) => apiUtils.patch(`/chat/${chatId}/rename`, { title }).then((r) => r.data),
  generate: (chatId, prompt) => apiUtils.post(`/chat/${chatId}/generate`, { prompt }).then((r) => r.data),
  status: (chatId, promptId) => apiUtils.get(`/chat/${chatId}/status/${promptId}`).then((r) => r.data),
  kill: (chatId, promptId) => apiUtils.post(`/chat/${chatId}/kill/${promptId}`).then((r) => r.data),
};
