import { Agent, Upvote, DuplicateFlag, SpamFlag } from "@prisma/client";

export type ErrorResponse = {
  error: string;
};

export type FormState = {
  name: string;
  xAccount: string;
  description: string;
  whyHunt: string;
  skill: string;
};

export type FormErrors = Partial<Record<keyof FormState | "avatar", string>>;

export type NewAgentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (
    agentData: Pick<Agent, "id" | "name" | "xAccount" | "description" | "whyHunt" | "skill"> & {
      agentHandle: string;
    }
  ) => void;
};

export type AgentFields = {
  name: string;
  xAccount: string;
  description: string;
  whyHunt: string;
  skill: Agent["skill"]; // This ensures 'skill' matches the Prisma Agent model's skill type
  authorAddress: string;
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
