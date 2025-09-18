export interface SubscribeData {
  email: string;
}
export type ApiResponse<T = any> = Promise<Response>;

const createApiClient = () => {
  const API_URL = "https://api.quantus.com/api";

  const methods = {
    /**
     * Subscribe to waitlist
     */
    subscribe: (email: string): ApiResponse<SubscribeData> => {
      return fetch(`${API_URL}/waitlist`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          email,
        }),
      });
    },
  };

  return methods;
};

const apiClient = createApiClient();
export default apiClient;
