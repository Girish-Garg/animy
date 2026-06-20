import axios from "axios";
import axiosRetry from "axios-retry";

// Shared client for the external video API. Adds a request timeout and retry
// with exponential backoff on transient failures. POST is never retried (it is
// not idempotent — a retried generate/move could duplicate work). Callers still
// build full URLs, so process.env.Video_API_BASE_URL is read at request time.
const videoApi = axios.create({
  timeout: 15000, // 15s — these are quick kickoff/status calls, not the generation itself
});

axiosRetry(videoApi, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    const method = error.config?.method?.toLowerCase();
    if (method === "post") return false;
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === "ECONNABORTED"
    );
  },
});

export default videoApi;
