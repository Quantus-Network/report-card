import * as etherscan from "@/utils/etherscan";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params }) => {
  const { address } = params;

  if (!address) {
    return new Response(
      JSON.stringify({ error: "Address parameter is missing." }),
      { status: 400 }
    );
  }

  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethAddressRegex.test(address)) {
    return new Response(
      JSON.stringify({ error: "Invalid Ethereum address format" }),
      { status: 400 }
    );
  }

  try {
    // Fetch balance and check if has transactions
    const [balance, hasOutgoingTransactions] = await Promise.all([
      etherscan.getBalance(address),
      etherscan.hasAnyTransactions(address),
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
        secondsSinceFirst / (24 * 60 * 60)
      );
    }

    const report = {
      address,
      balance,
      balanceEth,
      hasOutgoingTransactions,
      firstTransactionTimestamp,
      daysSinceFirstTransaction,
    };

    // Return the report data as JSON
    return new Response(JSON.stringify(report), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
