import * as etherscan from "@/utils/etherscan";
import { resolveAddressOrENS } from "@/utils/ens";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params }) => {
  const { address } = params;

  if (!address) {
    return new Response(
      JSON.stringify({
        error: "Address parameter is missing.",
        details:
          "Please provide a valid Ethereum address or ENS name (.eth) in the URL.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Resolve address or ENS name
  const resolution = await resolveAddressOrENS(address);

  if (resolution.type === "invalid") {
    return new Response(
      JSON.stringify({
        error: "Invalid address or ENS name format",
        details:
          "Please enter a valid Ethereum address (0x...) or ENS .eth name (example.eth).",
        provided: address,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  
  if (!resolution.address) {
    return new Response(
      JSON.stringify({
        error: "ENS .eth name could not be resolved",
        details: `The ENS name "${address}" could not be resolved to an Ethereum address. Please verify the .eth name is correct.`,
        provided: address,
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const resolvedAddress = resolution.address;
  const ensName = resolution.ensName;

  try {
    // Fetch balance, check if has transactions, and detect smart contract using resolved address
    const [balance, hasOutgoingTransactions, isSmartContract] =
      await Promise.all([
        etherscan.getBalance(resolvedAddress),
        etherscan.hasAnyTransactions(resolvedAddress),
        etherscan.isSmartContract(resolvedAddress),
      ]);

    const balanceEth = etherscan.weiToEth(balance);

    let firstTransactionTimestamp: number | null = null;
    let daysSinceFirstTransaction: number | null = null;

    // If has transactions, get the timestamp in seconds of the first one
    if (hasOutgoingTransactions) {
      firstTransactionTimestamp =
        await etherscan.getFirstTransactionTimestamp(resolvedAddress);
    }

    if (hasOutgoingTransactions && firstTransactionTimestamp) {
      const now = Date.now() / 1000; // Current time in seconds
      const secondsSinceFirst = now - firstTransactionTimestamp;

      daysSinceFirstTransaction = Math.floor(
        secondsSinceFirst / (24 * 60 * 60),
      );
    }

    const report = {
      address: resolvedAddress,
      ensName,
      originalInput: address,
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
        address: resolvedAddress || address,
        originalInput: address,
        timestamp: new Date().toISOString(),
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
