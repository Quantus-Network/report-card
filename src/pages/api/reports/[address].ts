import * as etherscan from "@/utils/etherscan";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params }) => {
  const { address } = params;

  if (!address) {
    return new Response(
      JSON.stringify({
        error: "Address parameter is missing.",
        details: "Please provide a valid Ethereum address in the URL.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethAddressRegex.test(address)) {
    return new Response(
      JSON.stringify({
        error: "Invalid Ethereum address format",
        details:
          "Please enter a valid Ethereum address starting with '0x' followed by 40 hexadecimal characters.",
        provided: address,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    // Fetch balance, check if has transactions, and detect smart contract
    const [balance, hasOutgoingTransactions, isSmartContract] =
      await Promise.all([
        etherscan.getBalance(address),
        etherscan.hasAnyTransactions(address),
        etherscan.isSmartContract(address),
      ]);

    const balanceEth = etherscan.weiToEth(balance);

    let firstTransactionTimestamp: number | null = null;
    let daysSinceFirstTransaction: number | null = null;

    // If has transactions, get the timestamp in seconds of the first one
    if (hasOutgoingTransactions) {
      firstTransactionTimestamp =
        await etherscan.getFirstTransactionTimestamp(address);
    }

    if (hasOutgoingTransactions && firstTransactionTimestamp) {
      const now = Date.now() / 1000; // Current time in seconds
      const secondsSinceFirst = now - firstTransactionTimestamp;

      daysSinceFirstTransaction = Math.floor(
        secondsSinceFirst / (24 * 60 * 60),
      );
    }

    const report = {
      address,
      balance,
      balanceEth,
      hasOutgoingTransactions,
      firstTransactionTimestamp,
      daysSinceFirstTransaction,
      isSmartContract,
    };

    // Return the report data as JSON
    return new Response(JSON.stringify(report), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    let errorMessage =
      "An unexpected error occurred while analyzing the address.";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle specific error types with more appropriate status codes
      if (error.message.includes("Rate limit exceeded")) {
        statusCode = 429;
      } else if (
        error.message.includes("Invalid request or address not found")
      ) {
        statusCode = 404;
        errorMessage =
          "The provided address could not be found on the Ethereum network. Please verify the address is correct.";
      } else if (error.message.includes("Network error")) {
        statusCode = 503;
        errorMessage =
          "Unable to connect to blockchain data services. Please try again in a few moments.";
      } else if (error.message.includes("Invalid Ethereum address format")) {
        statusCode = 400;
      }
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        address: address,
        timestamp: new Date().toISOString(),
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
