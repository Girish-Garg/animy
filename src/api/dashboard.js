import { apiUtils } from '@/lib/apiClient';

export const dashboardApi = {
  get: () => apiUtils.get('/dashboard').then((r) => r.data),
};
