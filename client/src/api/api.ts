import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import JSONbig from 'json-bigint';



const localApi = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  },
  transformResponse: [(data) => JSONbig.parse(data)]
});



let accessToken: string | null = null;

const getApiInstance = (url: string) => {
  return localApi;
};

const isAuthEndpoint = (url: string): boolean => {
  return url.includes("/api/auth");
};

const setupInterceptors = (apiInstance: typeof axios) => {
  apiInstance.interceptors.request.use(
    (config: AxiosRequestConfig): AxiosRequestConfig => {

      if (!accessToken) {
        accessToken = localStorage.getItem('accessToken');
      }
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
  );

    apiInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError): Promise<any> => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      if ([401, 403].includes(error.response?.status) && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            if (isAuthEndpoint(originalRequest.url || '')) {
                const { data } = await localApi.post(`/api/auth/refresh`, {
                refreshToken: localStorage.getItem('refreshToken'),
                });
                accessToken = data.data.accessToken;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', data.data.refreshToken);
            }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return getApiInstance(originalRequest.url || '')(originalRequest);
        } catch (err) {
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('accessToken');
          accessToken = null;
          window.location.href = '/login';
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );
};

setupInterceptors(localApi);



const api = {
  request: (config: AxiosRequestConfig) => {
    const apiInstance = getApiInstance(config.url || '');
    return apiInstance(config);
  },
  get: (url: string, config?: AxiosRequestConfig) => {
    const apiInstance = getApiInstance(url);
    return apiInstance.get(url, config);
  },
  post: (url: string, data?: any, config?: AxiosRequestConfig) => {
    const apiInstance = getApiInstance(url);
    return apiInstance.post(url, data, config);
  },
  put: (url: string, data?: any, config?: AxiosRequestConfig) => {
    const apiInstance = getApiInstance(url);
    return apiInstance.put(url, data, config);
  },
  delete: (url: string, config?: AxiosRequestConfig) => {
    const apiInstance = getApiInstance(url);
    return apiInstance.delete(url, config);
  },
};

export default api;
