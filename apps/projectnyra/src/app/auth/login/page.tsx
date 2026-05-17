"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Lock,
  ShieldCheck,
  Zap,
  Bot,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "@nyra/ui";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  if (user) {
    router.push("/");
    return null;
  }

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setSuccess(decodeURIComponent(message));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      // Login successful
      const redirectUrl = searchParams.get("redirect") || "/";
      router.push(redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_70%)]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-4">
          <div className="size-20 rounded-3xl bg-indigo-600 mx-auto flex items-center justify-center shadow-2xl border border-indigo-400/30 group hover:scale-105 transition-transform animate-in zoom-in-50 duration-700">
            <Bot className="size-10 text-white" />
          </div>
          <div>
            <Badge
              variant="outline"
              className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-4 py-1.5 font-black text-[9px] uppercase tracking-[0.4em] mb-4"
            >
              SECURE_GATEWAY_V1.0
            </Badge>
            <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase italic">
              Nyra_Cockpit
            </h1>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-60">
              Master_Operator_Authentication
            </p>
          </div>
        </div>

        <Card className="bg-card/40 backdrop-blur-2xl border border-border/50 shadow-2xl rounded-[32px] overflow-hidden border-t-2 border-t-indigo-500 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <CardContent className="p-10 space-y-8">
            {/* Success Alert */}
            {success && (
              <div className="p-4 bg-turquoise-500/10 border border-turquoise-500/30 rounded-2xl flex gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircle
                  size={18}
                  className="text-turquoise-400 flex-shrink-0"
                />
                <p className="text-[10px] font-black uppercase tracking-widest text-turquoise-400 leading-relaxed">
                  {success}
                </p>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-2xl flex gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle
                  size={18}
                  className="text-pink-400 flex-shrink-0"
                />
                <p className="text-[10px] font-black uppercase tracking-widest text-pink-400 leading-relaxed">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Operator_Credential
                </label>
                <div className="relative group">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="IDENT_ID@PROJECTNYRA.COM"
                    className="h-12 bg-background/40 border-border/50 rounded-xl text-[11px] font-black uppercase tracking-widest focus:border-indigo-400 shadow-inner pl-4"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Access_Protocol_Key
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300"
                  >
                    Lost_Key?
                  </Link>
                </div>
                <div className="relative group">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="h-12 bg-background/40 border-border/50 rounded-xl text-[11px] font-black uppercase tracking-widest focus:border-indigo-400 shadow-inner pl-4"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 active:scale-95 text-[11px]"
              >
                {loading ? "INITIALIZING_TRACE..." : "AUTHORIZE_SESSION"}{" "}
                <ArrowRight size={16} />
              </Button>
            </form>

            <div className="pt-6 border-t border-border/30 text-center">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                Unauthorized access to Project Nyra logic shards is strictly
                monitored.
              </p>
              <div className="flex items-center justify-center gap-6 mt-6 opacity-40">
                <ShieldCheck className="size-4 text-turquoise-400" />
                <Lock className="size-4 text-indigo-400" />
                <Zap className="size-4 text-pink-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Link */}
        <p className="text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-30">
          Project Nyra Foundation · Mission Control v1.0
        </p>
      </div>
    </div>
  );
}
