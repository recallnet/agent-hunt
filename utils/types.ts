import { Agent, DuplicateFlag, SpamFlag } from "@prisma/client";
import { ReactNode } from "react";

export type AgentFormState = {
  name: string;
  xAccount: string;
  description: string;
  whyHunt: string;
  skill: Agent["skill"] | "";
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
};

export type AgentParentProps = {
  agent: EnhancedAgent;
  cardView: boolean;
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

export type HandleAction = (e: React.MouseEvent, action: "upvote" | "duplicate" | "spam") => Promise<void>;

// This represents the structure of our paginated API response.
export type PaginatedAgentsResponse = {
  agents: EnhancedAgent[];
  hasMore: boolean;
};
