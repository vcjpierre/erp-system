"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", companyName: "", companyTaxId: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.register(form);
      setAuth(response.user, response.accessToken, response.refreshToken);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="border-border/50 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Register your company and start using the ERP</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={form.firstName} onChange={updateField("firstName")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={form.lastName} onChange={updateField("lastName")} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={updateField("email")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={updateField("password")} required minLength={8} />
            </div>
            <hr className="border-border" />
            <div className="space-y-2">
              <Label htmlFor="companyName">Company name</Label>
              <Input id="companyName" value={form.companyName} onChange={updateField("companyName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyTaxId">Tax ID (RFC)</Label>
              <Input id="companyTaxId" value={form.companyTaxId} onChange={updateField("companyTaxId")} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
