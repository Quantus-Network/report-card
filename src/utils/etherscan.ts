import env from "@/config";
import type { EtherscanResponse } from "@/interfaces/EthereumSecurity";

const API_KEY = import.meta.env.ETHERSCAN_API_KEY;

const fetchEtherscanData = async (
  module: string,
  action: string,
  address: string,
  tag = "latest"
): Promise<EtherscanResponse> => {
  if (!API_KEY)
    throw new Error("Please configure your Etherscan API key in .env.local");

  // Validate the address format before making API call
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethAddressRegex.test(address)) {
    throw new Error("Invalid Ethereum address format");
  }

  const url = new URL(env.ETHERSCAN_BASE_URL);
  url.searchParams.append("module", module);
  url.searchParams.append("action", action);
  url.searchParams.append("address", address);
  url.searchParams.append("tag", tag);
  url.searchParams.append("apikey", API_KEY);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: EtherscanResponse = await response.json();

    if (data.status === "0") {
      if (data.message === "NOTOK") {
        throw new Error("Invalid request or address not found");
      }
      throw new Error(data.message || "Unknown error from Etherscan API");
    }

    return data;
  } catch (error) {
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      throw new Error(
        "Network error: Unable to connect to Etherscan API. Please check your internet connection."
      );
    }

    throw error;
  }
};

const getBalance = async (address: string): Promise<string> => {
  const response = await fetchEtherscanData("account", "balance", address);
  return response.result;
};

const getFirstTransactionTimestamp = async (
  address: string
): Promise<number | null> => {
  // Get the first page of transactions (oldest first)
  const url = new URL(env.ETHERSCAN_BASE_URL);
  url.searchParams.append("module", "account");
  url.searchParams.append("action", "txlist");
  url.searchParams.append("address", address);
  url.searchParams.append("startblock", "0");
  url.searchParams.append("endblock", "99999999");
  url.searchParams.append("page", "1");
  url.searchParams.append("offset", "1"); // Just get the first transaction
  url.searchParams.append("sort", "asc"); // Ascending order (oldest first)
  url.searchParams.append("apikey", API_KEY);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const data: any = await response.json();

  if (data.status === "1" && data.result.length > 0) {
    // Return timestamp of first transaction
    return parseInt(data.result[0].timeStamp, 10);
  }

  return null;
};

const hasAnyTransactions = async (address: string): Promise<boolean> => {
  const response = await fetchEtherscanData(
    "proxy",
    "eth_getTransactionCount",
    address
  );
  // Convert hex to decimal and check if > 0
  return parseInt(response.result, 16) > 0;
};

const weiToEth = (wei: string): number => {
  // Convert wei (string) to ETH (number)
  // 1 ETH = 10^18 wei
  const weiNum = BigInt(wei);
  const ethNum = Number(weiNum) / 10 ** 18;
  return ethNum;
};

const isSmartContract = async (address: string): Promise<boolean> => {
  try {
    const response = await fetchEtherscanData("proxy", "eth_getCode", address);
    // If the result is "0x" it means no code, so it's an EOA (Externally Owned Account)
    // If there's code, it's a smart contract
    return response.result !== "0x";
  } catch (error) {
    // If we can't determine, assume it's not a contract for safety
    return false;
  }
};

export {
  weiToEth,
  fetchEtherscanData,
  getBalance,
  hasAnyTransactions,
  getFirstTransactionTimestamp,
  isSmartContract,
};
