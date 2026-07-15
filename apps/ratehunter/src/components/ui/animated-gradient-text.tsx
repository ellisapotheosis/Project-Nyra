import { cn } from "@/lib/utils";

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
  /** Custom gradient — defaults to indigo→seafoam→neonpink brand colours */
  gradient?: string;
}

export function AnimatedGradientText({
  children,
  className,
  gradient = "linear-gradient(90deg,#5038FF,#00CCB2,#F20D7A,#5038FF)",
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "inline animate-gradient-text bg-clip-text text-transparent",
        className
      )}
      style={{
        backgroundImage: gradient,
        backgroundSize: "300% 100%",
      }}
    >
      {children}
    </span>
  );
}
