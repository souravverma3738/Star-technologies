import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_aeba3559-7982-43dd-8bb7-505962083eda/artifacts/7hdvdyna_Logo_1.png";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("st_admin_token", data.access_token);
      localStorage.setItem("st_admin", JSON.stringify(data.admin));
      toast.success("Welcome back");
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a1d4a] st-grain">
      <div className="st-orb h-[420px] w-[420px] -left-20 -top-20" style={{ background: "#1e6bff" }} />
      <div className="st-orb h-[360px] w-[360px] right-0 bottom-0" style={{ background: "#4ea2ff" }} />
      <div className="relative mx-auto flex min-h-screen max-w-md items-center px-5 py-10">
        <Card className="w-full rounded-2xl border-white/10 bg-white shadow-2xl" data-testid="admin-login-card">
          <CardHeader className="items-center text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0a1d4a] p-2">
              <img src={LOGO_URL} alt="Star Technologies" className="h-full w-full object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#0a1d4a]">Admin Login</CardTitle>
            <CardDescription>Star Technologies dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="admin-login-form">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@startechnologies.com"
                  required
                  className="mt-1.5"
                  data-testid="admin-login-email"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1.5"
                  data-testid="admin-login-password"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-[#0a1d4a] py-6 text-white hover:bg-[#1e6bff]"
                data-testid="admin-login-submit"
              >
                {submitting ? "Signing in..." : (<><Lock className="mr-2 h-4 w-4" /> Sign In <ArrowRight className="ml-2 h-4 w-4" /></>)}
              </Button>
            </form>
            <div className="mt-6 text-center text-xs text-slate-500">
              <a href="/" className="hover:text-[#0a1d4a]">← Back to website</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
