import type {
  EthereumAddressData,
  EthereumSecurityAnalysis,
  QuantumSecurityScore,
} from "@/interfaces/EthereumSecurity";

const getGrade = (score: number): QuantumSecurityScore["grade"] => {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  return "F";
};

const getRiskLevel = (score: number): QuantumSecurityScore["riskLevel"] => {
  if (score >= 90) return "Very Low";
  if (score >= 75) return "Low";
  if (score >= 60) return "Medium";
  if (score >= 40) return "High";
  return "Very High";
};

/**
 * Calculate quantum security score for an Ethereum address
 * Scoring factors:
 * - No outgoing transactions (public key not exposed): Higher score
 * - Lower balance: Higher score (less at risk)
 * - Duration of public key exposure: Longer exposure = higher risk
 */
export const calculateQuantumSecurityScore = (
  addressData: EthereumAddressData,
): QuantumSecurityScore => {
  let score = 100; // Start with perfect score
  const recommendations: string[] = [];

  // Factor 1: Public Key Exposure (most critical)
  const publicKeyExposedPenalty = addressData.hasOutgoingTransactions ? 40 : 0;
  score -= publicKeyExposedPenalty;

  if (addressData.hasOutgoingTransactions) {
    recommendations.push(
      "Your public key has been exposed through outgoing transactions, making it vulnerable to quantum attacks.",
    );

    // Additional penalty based on exposure duration
    if (addressData.daysSinceFirstTransaction) {
      const days = addressData.daysSinceFirstTransaction;
      if (days > 365 * 2) {
        // 2+ years
        score -= 20;
        recommendations.push(
          `Public key has been exposed for ${Math.floor(days / 365)} years, significantly increasing quantum risk.`,
        );
      } else if (days > 365) {
        // 1+ years
        score -= 15;
        recommendations.push(
          `Public key has been exposed for over a year (${Math.floor(days / 365)} years), increasing quantum vulnerability.`,
        );
      } else if (days > 180) {
        // 6+ months
        score -= 10;
        recommendations.push(
          `Public key has been exposed for ${Math.floor(days / 30)} months, creating moderate quantum risk.`,
        );
      } else if (days > 30) {
        // 1+ months
        score -= 5;
        recommendations.push(
          `Public key has been exposed for ${Math.floor(days / 30)} months.`,
        );
      }
    }
  } else {
    recommendations.push(
      "Excellent! No outgoing transactions mean your public key remains secure.",
    );
  }

  // Factor 2: Balance Risk (higher balance = higher risk if compromised)
  let balanceRiskFactor = 0;

  if (addressData.balanceEth > 1000) {
    balanceRiskFactor = 25;
    recommendations.push(
      "Very high balance increases the attractiveness to quantum attackers.",
    );
  } else if (addressData.balanceEth > 100) {
    balanceRiskFactor = 20;
    recommendations.push(
      "High balance makes this address a more valuable target for quantum attacks.",
    );
  } else if (addressData.balanceEth > 10) {
    balanceRiskFactor = 15;
    recommendations.push(
      "Moderate balance poses some risk if quantum computers become available.",
    );
  } else if (addressData.balanceEth > 1) {
    balanceRiskFactor = 10;
  } else if (addressData.balanceEth > 0) {
    balanceRiskFactor = 5;
  }

  score -= balanceRiskFactor;

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Add positive recommendations for good security
  if (!addressData.hasOutgoingTransactions && addressData.balanceEth > 0) {
    recommendations.push(
      "Consider using this address only for receiving funds to maintain quantum security.",
    );
  }

  if (addressData.balanceEth === 0) {
    recommendations.push("Empty address has minimal quantum risk exposure.");
  }

  return {
    score: Math.round(score),
    grade: getGrade(score),
    riskLevel: getRiskLevel(score),
    recommendations,
  };
};

/**
 * Generate complete security analysis for an Ethereum address
 */
export const generateSecurityAnalysis = (
  addressData: EthereumAddressData,
): EthereumSecurityAnalysis => {
  const securityScore = calculateQuantumSecurityScore(addressData);

  const publicKeyExposed = addressData.hasOutgoingTransactions;

  // Calculate exposure duration risk (0-1 scale)
  let exposureDurationRisk = 0;
  if (addressData.daysSinceFirstTransaction) {
    const days = addressData.daysSinceFirstTransaction;
    if (days > 365 * 2)
      exposureDurationRisk = 1.0; // 2+ years
    else if (days > 365)
      exposureDurationRisk = 0.8; // 1+ years
    else if (days > 180)
      exposureDurationRisk = 0.6; // 6+ months
    else if (days > 90)
      exposureDurationRisk = 0.4; // 3+ months
    else if (days > 30) exposureDurationRisk = 0.2; // 1+ months
  }

  let balanceRiskFactor = 0;
  if (addressData.balanceEth > 1000) balanceRiskFactor = 1;
  else if (addressData.balanceEth > 100) balanceRiskFactor = 0.8;
  else if (addressData.balanceEth > 10) balanceRiskFactor = 0.6;
  else if (addressData.balanceEth > 1) balanceRiskFactor = 0.4;
  else if (addressData.balanceEth > 0) balanceRiskFactor = 0.2;

  return {
    address: addressData.address,
    addressData,
    securityScore,
    analysisDetails: {
      publicKeyExposed,
      balanceRiskFactor,
      exposureDurationRisk,
      daysSinceExposure: addressData.daysSinceFirstTransaction,
    },
  };
};

/**
 * Format ETH balance for display
 */
export const formatEthBalance = (balance: number): string => {
  if (balance === 0) return "0 ETH";
  if (balance < 0.001) return `${balance.toExponential(2)} ETH`;
  if (balance < 1) return `${balance.toFixed(4)} ETH`;
  if (balance < 1000) return `${balance.toFixed(2)} ETH`;
  return `${balance.toLocaleString()} ETH`;
};

/**
 * Format days since exposure for display
 */
export const formatExposureDuration = (days: number): string => {
  if (days < 1) return "less than a day";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? "1 month" : `${months} months`;
  }
  const years = Math.floor(days / 365);
  const remainingMonths = Math.floor((days % 365) / 30);
  if (years === 1) {
    return remainingMonths > 0 ? `1 year, ${remainingMonths} months` : "1 year";
  }
  return remainingMonths > 0
    ? `${years} years, ${remainingMonths} months`
    : `${years} years`;
};

// Determines the text color class based on the risk level for emphasis
export const getRiskColorClass = (
  riskLevel: QuantumSecurityScore["riskLevel"],
): string => {
  switch (riskLevel) {
    case "Very Low":
    case "Low":
      return "text-[var(--color-quantus-blue)]";
    case "Medium":
      return "text-yellow-400"; // A neutral, attention-grabbing color
    case "High":
    case "Very High":
      return "text-[var(--color-input-error)]";
    default:
      return "text-[var(--color-text-content-primary)]";
  }
};
