"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="text-center border-border/50 shadow-2xl">
          <CardContent className="pt-8">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h2 className="text-xl font-semibold mb-2">Check your email</h2>
            <p className="text-muted-foreground mb-6">
              If an account exists with {email}, we&apos;ve sent a password reset link.
            </p>
            <Link href="/login">
              <Button variant="outline">Back to login</Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-border/50 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>Enter your email and we&apos;ll send you a reset link</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/login" className="text-sm text-primary hover:underline">Back to login</Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
