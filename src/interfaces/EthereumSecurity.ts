export interface EthereumAddressData {
  address: string;
  balance: string; // in wei (string to handle large numbers)
  balanceEth: number; // converted to ETH for display
  hasOutgoingTransactions: boolean;
  firstTransactionTimestamp?: number; // Unix timestamp of first outgoing transaction
  daysSinceFirstTransaction?: number; // Days since public key was exposed
}

export interface QuantumSecurityScore {
  score: number; // 0-100, where 100 is most secure
  grade: "A+" | "A" | "B" | "C" | "D" | "E" | "F";
  riskLevel: "Very Low" | "Low" | "Medium" | "High" | "Very High";
  recommendations: string[];
}

export interface EthereumSecurityAnalysis {
  address: string;
  addressData: EthereumAddressData;
  securityScore: QuantumSecurityScore;
  analysisDetails: {
    publicKeyExposed: boolean;
    balanceRiskFactor: number;
    exposureDurationRisk: number; // Risk factor based on how long key has been exposed
    daysSinceExposure?: number;
  };
}

export interface EtherscanResponse {
  status: string;
  message: string;
  result: string;
}

export interface EtherscanError {
  message: string;
  status?: string;
}
