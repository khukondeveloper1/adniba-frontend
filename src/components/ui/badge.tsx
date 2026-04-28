// ─── Badge ────────────────────────────────────────────────────────────────────

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-100 text-green-700 border-green-200",
        warning:
          "border-transparent bg-amber-100 text-amber-700 border-amber-200",
        info: "border-transparent bg-blue-100 text-blue-700 border-blue-200",
        // Status badges
        active: "border-green-200 bg-green-50 text-green-700",
        inactive: "border-slate-200 bg-slate-50 text-slate-500",
        suspended: "border-red-200 bg-red-50 text-red-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };

// ─── Avatar ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const avatarSizes = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

function Avatar({ src, alt, fallback, size = "md", className }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const sizeClass = avatarSizes[size];

  if (src && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? "Avatar"}
        className={cn(
          "rounded-full object-cover ring-1 ring-border",
          sizeClass,
          className,
        )}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-1 ring-border",
        sizeClass,
        className,
      )}
    >
      {fallback ?? "?"}
    </div>
  );
}

export { Avatar };
