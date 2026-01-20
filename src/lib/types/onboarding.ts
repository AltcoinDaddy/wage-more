// Onboarding Types
export interface OnboardingData {
  username: string;
  interests: string[];
  walletAddress: string;
  signature: string;
}

export interface OnboardingResponse {
  success: boolean;
  smartAccountAddress?: string | null;
}
