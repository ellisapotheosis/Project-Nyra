import { Zap } from "lucide-react";

export function RateHunterLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <Zap className="h-5 w-5 text-white" />
      </div>
      <span className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">
        RateHunter
      </span>
    </div>
  );
}
