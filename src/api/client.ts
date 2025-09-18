// Types for API responses
interface ChainStatsData {
  allTransactions: {
    totalCount: number;
  };
  allAccounts: {
    totalCount: number;
  };
}

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
  }>;
}

interface ContactData {
  name: string;
  email: string;
  message: string;
}

interface SubscribeData {
  email: string;
}

type ApiResponse<T = any> = Promise<Response>;

const createApiClient = () => {
  const API_URL = "https://api.quantus.com/api";
  const GRAPHQL_URL = "https://gql.res.fm/graphql";

  const methods = {
    /**
     * Fetch blockchain statistics including transaction and account counts
     */
    chainStats: (): ApiResponse<GraphQLResponse<ChainStatsData>> => {
      const query = `
        query GetStatus {
          allTransactions: eventsConnection(
            orderBy: id_ASC, 
            where: {
              OR: {
                type_in: [TRANSFER, REVERSIBLE_TRANSFER]
              }
            }
          ) {
            totalCount
          }
          allAccounts: accountsConnection(
            orderBy: id_ASC
          ) {
            totalCount
          }
        }
      `;

      return fetch(GRAPHQL_URL, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          query,
        }),
      });
    },

    /**
     * Submit a contact form inquiry
     */
    contact: (name: string, email: string, message: string): ApiResponse => {
      return fetch(`${API_URL}/inquiries`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          message,
        } as ContactData),
      });
    },

    /**
     * Subscribe to waitlist
     */
    subscribe: (email: string): ApiResponse => {
      return fetch(`${API_URL}/waitlist`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          email,
        } as SubscribeData),
      });
    },

    /**
     * Helper method to handle GraphQL responses with proper error checking
     */
    async handleGraphQLResponse<T>(response: Response): Promise<T> {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GraphQLResponse<T> = await response.json();

      if (data.errors && data.errors.length > 0) {
        throw new Error(`GraphQL error: ${data.errors[0].message}`);
      }

      if (!data.data) {
        throw new Error("No data returned from GraphQL query");
      }

      return data.data;
    },

    /**
     * Convenience method to get chain stats with automatic error handling
     */
    async getChainStats(): Promise<ChainStatsData> {
      const response = await methods.chainStats();
      return methods.handleGraphQLResponse<ChainStatsData>(response);
    },
  };

  return methods;
};

const apiClient = createApiClient();
export default apiClient;

// Export types for use in other files
export type { ChainStatsData, GraphQLResponse, ContactData, SubscribeData };
