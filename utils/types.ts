export type AgentFields = {
  name: string;
  xAccount: string;
  description: string;
  whyHunt: string;
  skill: "TRADING" | "RESEARCH" | "AUTOMATION";
  authorAddress: string;
};

export type ErrorResponse = {
  error: string;
};

export type NewAgentModalProps = {
  isOpen: boolean;
  onClose: () => void;
};
