import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Status badge variants
const statusBadgeVariants = cva(
  "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        primary: "bg-primary bg-opacity-10 text-primary",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Define available statuses and their mappings to variants
const statusMappings: Record<string, VariantProps<typeof statusBadgeVariants>["variant"]> = {
  planned: "default",
  in_progress: "warning",
  completed: "info",
  under_review: "info",
  approved: "success",
  rejected: "danger",
  approve: "success",
  reject: "danger",
  hold: "warning",
};

// Define readable text for statuses
const statusText: Record<string, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  approve: "Approved",
  reject: "Rejected",
  hold: "On Hold",
};

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
  customText?: string;
}

export function StatusBadge({ 
  status, 
  customText, 
  className, 
  ...props 
}: StatusBadgeProps) {
  // Normalize status to match enum values if needed
  const normalizedStatus = status.replace(/_/g, "_").toLowerCase();
  
  // Determine the variant based on status
  const variant = statusMappings[normalizedStatus] || "default";
  
  // Get display text
  const displayText = customText || statusText[normalizedStatus] || normalizedStatus;

  return (
    <span 
      className={cn(statusBadgeVariants({ variant }), className)} 
      {...props}
    >
      {displayText}
    </span>
  );
}
