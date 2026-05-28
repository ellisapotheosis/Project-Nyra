"use client";

import * as React from "react";
import Link from "next/link";
import { Bot, Settings } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
        glass:
          "bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 text-white shadow-xl",
      },
      size: {
        default: "h-9 gap-1.5 px-3",
        sm: "h-8 gap-1 px-2.5 text-xs",
        lg: "h-10 gap-2 px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "border-border text-foreground",
        glass:
          "border-white/10 bg-white/5 backdrop-blur-md text-white shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

const cardVariants = cva(
  "flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        glass:
          "bg-white/5 backdrop-blur-md border-white/10 text-white shadow-xl",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Card({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div className={cn(cardVariants({ variant }), className)} {...props} />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-6", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("font-semibold leading-none", className)} {...props} />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-6", className)} {...props} />;
}

function AnimatedCounter({
  value,
  isCurrency = false,
}: {
  value: number;
  isCurrency?: boolean;
}) {
  const formatted = isCurrency
    ? new Intl.NumberFormat("en-US", {
        currency: "USD",
        maximumFractionDigits: 0,
        notation: "compact",
        style: "currency",
      }).format(value)
    : new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
        value
      );

  return <span>{formatted}</span>;
}

function NyraSacredCore({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-3xl border border-primary/20 bg-card/30",
        className
      )}
    >
      <div className="absolute size-72 rounded-full border border-primary/30 shadow-2xl shadow-primary/30" />
      <div className="absolute size-48 rounded-full border border-accent/40" />
      <div className="absolute size-28 rounded-full bg-primary/20 blur-2xl" />
      <Bot className="relative z-10 size-24 text-primary" />
    </div>
  );
}

function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="space-y-2">
      <h1 className="text-3xl font-black tracking-tight">{title}</h1>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/88 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl border border-primary/30 bg-primary shadow-2xl">
            <Bot className="size-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black uppercase italic leading-none tracking-tight text-foreground">
              Project_Nyra
            </span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
              Neural_Command_v1.0
            </span>
          </div>
        </Link>
        <Link
          href="/settings"
          className="inline-flex size-9 items-center justify-center rounded-full border border-border/60 bg-card/70 text-muted-foreground hover:text-foreground"
          aria-label="Open settings"
        >
          <Settings className="size-4" />
        </Link>
      </div>
    </header>
  );
}

export {
  AnimatedCounter,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  NyraSacredCore,
  PageHeader,
  SiteHeader,
  buttonVariants,
};
