import { Agent } from "@prisma/client";

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
