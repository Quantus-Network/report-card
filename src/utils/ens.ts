import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

// Create a public client for mainnet using Infura
const client = createPublicClient({
  chain: mainnet,
  transport: http(
    "https://mainnet.infura.io/v3/71234860cfb7457db34b87b6c6b27eae",
  ),
});

/**
 * Checks if a given string is a valid ENS name
 */
export const isENSName = (input: string): boolean => {
  if (!input || typeof input !== "string") return false;

  const trimmed = input.trim().toLowerCase();

  // Must end with .eth and not be an Ethereum address
  if (!trimmed.endsWith(".eth") || trimmed.startsWith("0x")) return false;

  // ENS .eth name pattern validation
  const ensPattern = /^[a-zA-Z0-9-]+\.eth$/;
  return ensPattern.test(trimmed);
};

/**
 * Validates if a string is a valid Ethereum address
 */
export const isValidEthereumAddress = (address: string): boolean => {
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
};

/**
 * Resolves an ENS name to an Ethereum address using viem
 */
export const resolveENSName = async (
  ensName: string,
): Promise<string | null> => {
  if (!isENSName(ensName)) {
    throw new Error("Invalid ENS name format");
  }

  try {
    const address = await client.getEnsAddress({
      name: ensName.trim().toLowerCase(),
    });

    return address;
  } catch (error) {
    console.error("Error resolving ENS name:", error);
    return null;
  }
};

/**
 * Reverse resolves an Ethereum address to an ENS name using viem
 */
export const reverseResolveAddress = async (
  address: string,
): Promise<string | null> => {
  if (!isValidEthereumAddress(address)) {
    throw new Error("Invalid Ethereum address format");
  }

  try {
    const ensName = await client.getEnsName({
      address: address as `0x${string}`,
    });

    return ensName;
  } catch (error) {
    console.error("Error reverse resolving address:", error);
    return null;
  }
};

/**
 * Validates if the input is either a valid Ethereum address or ENS name
 */
export const validateAddressOrENS = (
  input: string,
): {
  isValid: boolean;
  type: "address" | "ens" | "invalid";
} => {
  if (!input || typeof input !== "string") {
    return { isValid: false, type: "invalid" };
  }

  const cleanInput = input.trim();

  // Check if it's a valid Ethereum address
  if (isValidEthereumAddress(cleanInput)) {
    return { isValid: true, type: "address" };
  }

  // Check if it's a valid ENS name
  if (isENSName(cleanInput)) {
    return { isValid: true, type: "ens" };
  }

  return { isValid: false, type: "invalid" };
};

/**
 * Main function to resolve either an ENS name or validate an Ethereum address
 */
export const resolveAddressOrENS = async (
  input: string,
): Promise<{
  address: string | null;
  ensName: string | null;
  type: "address" | "ens" | "invalid";
}> => {
  const validation = validateAddressOrENS(input);

  if (!validation.isValid) {
    return { address: null, ensName: null, type: "invalid" };
  }

  if (validation.type === "address") {
    // Input is already an address, optionally get its ENS name
    const ensName = await reverseResolveAddress(input);
    return {
      address: input.toLowerCase(),
      ensName,
      type: "address",
    };
  }

  if (validation.type === "ens") {
    // Input is an ENS name, resolve to address
    const address = await resolveENSName(input);
    return {
      address,
      ensName: input.toLowerCase(),
      type: "ens",
    };
  }

  return { address: null, ensName: null, type: "invalid" };
};
