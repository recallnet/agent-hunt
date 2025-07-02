import { Agent, DuplicateFlag, SpamFlag } from "@prisma/client";
import { ReactNode } from "react";
import { SWRInfiniteKeyedMutator } from "swr/infinite";

export type AgentFormState = {
  name: string;
  url: string;
  description: string;
  whyHunt: string;
  skill: Agent["skill"] | "";
  otherSkill: string;
};

export type AgentFields = AgentFormState & {
  authorAddress: string;
};

export type SuccessfulAgentData = AgentFormState & {
  id: Agent["id"];
};

export type CommonModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type ModalBaseProps = CommonModalProps & {
  children: ReactNode;
  flipColor?: boolean;
};

export type RulesModalProps = CommonModalProps;

export type NewAgentModalProps = CommonModalProps & {
  onSuccess: (agentData: SuccessfulAgentData) => void;
};

export type ShareXModalProps = CommonModalProps & {
  agentData: SuccessfulAgentData;
};

export type ErrorResponse = {
  error: string;
};

export type FormErrors = Partial<Record<keyof AgentFormState | "avatar", string>>;

export type AgentCardProps = {
  agent: EnhancedAgent;
  actionProps: ActionButtonsProps;
  mutateList?: SWRInfiniteKeyedMutator<PaginatedAgentsResponse[]>;
};

export type AgentParentProps = {
  agent: EnhancedAgent;
  cardView: boolean;
  mutateList?: SWRInfiniteKeyedMutator<PaginatedAgentsResponse[]>;
};

// Define the extended Agent type that includes relational arrays
export type EnhancedAgent = Agent & {
  upvoters: string[];
  authorAddress: string;
  duplicateFlags: DuplicateFlag[];
  spamFlags: SpamFlag[];
};

export type UserActions = {
  upvoted: boolean;
  duplicateFlagged: boolean;
  spamFlagged: boolean;
};

export type ActionButtonsProps = {
  isUpvoted: boolean;
  upvoteCount: number;
  isDuplicateFlagged: boolean;
  isSpamFlagged: boolean;
  isLoading: boolean;
  handleAction: HandleAction;
};

export type HandleAction = (
  e: React.MouseEvent<HTMLElement, MouseEvent> | null,
  action: "upvote" | "duplicate" | "spam",
  reason?: string
) => Promise<void>;

export type PaginatedAgentsResponse = {
  agents: EnhancedAgent[];
  hasMore: boolean;
};

// Define the list of skills for the dropdown
export const skills = [
  { value: "CRYPTO_TRADING", label: "Crypto Trading" },
  { value: "FINANCE", label: "Finance" },
  { value: "SOCIAL", label: "Social" },
  { value: "PRODUCTIVITY", label: "Productivity" },
  { value: "PREDICTIONS", label: "Predictions" },
  { value: "ASSISTANT", label: "Assistant" },
  { value: "MARKETING", label: "Marketing" },
  { value: "RESEARCH", label: "Research" },
  { value: "GAMING", label: "Gaming" },
  { value: "HEALTH", label: "Health" },
  { value: "ECOMMERCE", label: "Ecommerce" },
  { value: "CUSTOMER_SERVICE", label: "Customer Service" },
  { value: "OTHER", label: "Other" },
];
