import { Loader2 } from "lucide-react";
import React from "react";

/**
 * A spinner component for indicating loading states, using the shadcn/ui approach.
 * It utilizes the Loader2 icon from lucide-react with a spinning animation.
 */
export const Spinner: React.FC<{ className?: string }> = ({ className }) => {
  return <Loader2 className={`animate-spin ${className}`} />;
};
