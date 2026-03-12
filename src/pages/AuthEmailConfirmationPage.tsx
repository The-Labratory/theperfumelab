import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MailCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthEmailConfirmationPage() {
  const [params] = useSearchParams();
  const email = params.get("email") || "your inbox";

  const emailLabel = useMemo(() => {
    if (email === "your inbox") return email;
    return decodeURIComponent(email);
  }, [email]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-surface rounded-2xl p-8 max-w-md w-full text-center">
        <MailCheck className="w-10 h-10 text-primary mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Confirm your email</h1>
        <p className="text-sm text-muted-foreground mb-6">
          We sent a confirmation link to <span className="text-foreground font-medium">{emailLabel}</span>. Open it to finish your signup.
        </p>
        <Button asChild className="w-full font-display tracking-wider">
          <Link to="/auth">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to sign in
          </Link>
        </Button>
      </div>
    </div>
  );
}
