import { AuthPage } from "@/components/auth/auth-page";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return <AuthPage mode="forgot-password" />;
}
