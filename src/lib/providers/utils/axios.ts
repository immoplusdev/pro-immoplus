import type { HttpError } from "@refinedev/core";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const axiosInstance = axios.create();

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

let refreshTokenHandler: (() => Promise<{ access_token: string; refresh_token: string; expires: number } | null>) | null = null;

export const setRefreshTokenHandler = (handler: () => Promise<{ access_token: string; refresh_token: string; expires: number } | null>) => {
  refreshTokenHandler = handler;
};

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh-token') ||
          originalRequest.url?.includes('/auth/login')) {
        const customError: HttpError = {
          ...error,
          message: (error.response?.data as any)?.message,
          statusCode: error.response?.status || 401,
        };
        return Promise.reject(customError);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        if (!refreshTokenHandler) {
          throw new Error('Refresh token handler not configured');
        }

        const refreshResult = await refreshTokenHandler();

        if (refreshResult) {
          processQueue();
          return axiosInstance(originalRequest);
        } else {
          processQueue(new Error('Token refresh failed'));
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError as Error);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const customError: HttpError = {
      ...error,
      message: (error.response?.data as any)?.message,
      statusCode: error.response?.status || 500,
    };

    return Promise.reject(customError);
  },
);

export { axiosInstance };
