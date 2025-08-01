import axios, {InternalAxiosRequestConfig, AxiosError} from "axios";
import {url} from "../baseUrl";

const axiosInstance = axios.create({});
const refreshAxiosInstance = axios.create({});

interface CustomAxiosConfig extends InternalAxiosRequestConfig<any> {
    headers: any;
    _retry?: boolean; 
}

axiosInstance.interceptors.request.use(
    async (config: CustomAxiosConfig) => {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) {
            try {
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${JSON.parse(accessToken)}`,
                };
            } catch (e) {
                localStorage.removeItem("access_token");
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosConfig;
        if (
            error.response?.status === 401 && 
            !originalRequest._retry &&
            (error.response?.data as any)?.message === "JWT Expired"
        ) {
            originalRequest._retry = true;
            
            const refreshToken = localStorage.getItem("refresh_token");

            if (refreshToken) {
                try {
                    const response = await refreshAxiosInstance.post(`${url}/auth/token`, {
                        refresh_token: JSON.parse(refreshToken),
                    });
                    
                    const newAccessToken = response.data.access_token;
                    const newRefreshToken = response.data.refresh_token;
                    
                    localStorage.setItem("access_token", JSON.stringify(newAccessToken));
                    if (newRefreshToken) {
                        localStorage.setItem("refresh_token", JSON.stringify(newRefreshToken));
                    }

                    originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                    
                    return await axiosInstance(originalRequest);
                    
                } catch (refreshError) {
                    console.error('Refresh token failed:', refreshError);
                    
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    
                    window.location.href = '/signin/in';
                    
                    return Promise.reject(refreshError);
                }
            } else {
                window.location.href = '/signin/in';
            }
        }

        return Promise.reject(error);
    }
);

export const httpRequest = axiosInstance;