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
  if (score >= 35) return "D";
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

  if (addressData.isSmartContract) {
    // For now, use the same logic but you can customize this
    recommendations.push(
      "This is a smart contract. Smart contract quantum security analysis coming soon!",
    );
  } else {
    // Factor 1: Public Key Exposure (most critical)
    const publicKeyExposedPenalty = addressData.hasOutgoingTransactions ? 40 : 0;
    score -= publicKeyExposedPenalty;
  
    if (addressData.hasOutgoingTransactions) {
      recommendations.push(
        "Your public key has been exposed through outgoing transactions, making it vulnerable to quantum attacks. Consider moving the funds to a new address.",
      );
    } else {
      recommendations.push(
        "Excellent! No outgoing transactions mean your public key remains secure.",
      );
    }
  
    // Factor 2: Balance Risk (higher balance = higher risk if compromised)
    let balanceRiskFactor = 0;
  
    if (addressData.balanceEth > 10000) {
      balanceRiskFactor = 55;
      recommendations.push(
        "Your high balance makes your address more attractive to a quantum attacker. Consider splitting your funds into multiple addresses with smaller balances.",
      );
    } else if (addressData.balanceEth > 1000) {
      balanceRiskFactor = 40;
      recommendations.push(
        "Your high balance makes your address more attractive to a quantum attacker. Consider splitting your funds into multiple addresses with smaller balances.",
      );
    } else if (addressData.balanceEth > 100) {
      balanceRiskFactor = 30;
      recommendations.push(
        "Your high balance makes your address more attractive to a quantum attacker. Consider splitting your funds into multiple addresses with smaller balances.",
      );
    } else if (addressData.balanceEth > 10) {
      balanceRiskFactor = 20;
      recommendations.push(
        "Your high balance makes your address more attractive to a quantum attacker. Consider splitting your funds into multiple addresses with smaller balances.",
      );
    } else if (addressData.balanceEth > 1) {
      balanceRiskFactor = 10;
    } else if (addressData.balanceEth > 0) {
      balanceRiskFactor = 5;
    }
  
    score -= balanceRiskFactor;
  
    // Add positive recommendations for good security
    if (!addressData.hasOutgoingTransactions && addressData.balanceEth > 0) {
      recommendations.push(
        "Consider using this address only for receiving funds to maintain quantum security.",
      );
    }
  
    if (addressData.balanceEth === 0) {
      recommendations.push("Empty address has minimal quantum risk exposure.");
    }    
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

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
  
  const publicKeyExposed = addressData.hasOutgoingTransactions && !addressData.isSmartContract;

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

// Determines the text color class based on the grade for emphasis
export const getGradeColorClass = (
  grade: QuantumSecurityScore["grade"],
): string => {
  switch (grade) {
    case "A+":
      return "text-[var(--color-quantus-green)]";
    case "A":
      return "text-[var(--color-quantus-aqua)]";
    case "B":
      return "text-[var(--color-quantus-yellow)]";
    case "C":
      return "text-[var(--color-quantus-orange)]";
    case "D":
      return "text-[var(--color-quantus-purple)]";
    case "E":
      return "text-[var(--color-quantus-dark-pink)]";
    case "F":
      return "text-[var(--color-quantus-red)]";
    default:
      return "text-[var(--color-quantus-red)]";
  }
};

// Determines the grade og image based on the grade
export const getOgImageFileName = (
  grade: QuantumSecurityScore["grade"],
): String => {
  switch (grade) {
    case "A+":
      return "Qday_score_A+.png";
    case "A":
      return "Qday_score_A.png";
    case "B":
      return "Qday_score_B.png";
    case "C":
      return "Qday_score_C.png";
    case "D":
      return "Qday_score_D.png";
    case "E":
      return "Qday_score_E.png";
    case "F":
      return "Qday_score_F.png";
    default:
      return "Qday_score_F.png";
  }
};

export const splitAddressIntoChunks = (
  address: string,
  chunkSize: number = 3,
) => {
  if (chunkSize <= 0) throw new Error("Chunk size must be a positive integer.");
  if (address.length === 0) throw new Error("Address must not be empty.");

  const chunks: string[] = [];

  for (let i = 0; i < address.length; i += chunkSize) {
    let endIndex = i + chunkSize;
    if (endIndex > address.length) endIndex = address.length;

    chunks.push(address.substring(i, endIndex));
  }

  return chunks;
};
