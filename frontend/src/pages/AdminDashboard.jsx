import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, Mail, Phone, Search, Trash2, CheckCircle2, RefreshCw, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_aeba3559-7982-43dd-8bb7-505962083eda/artifacts/7hdvdyna_Logo_1.png";

function StatusBadge({ status }) {
  const map = {
    new:     "bg-[#1e6bff] text-white",
    read:    "bg-amber-100 text-amber-900",
    replied: "bg-emerald-100 text-emerald-900",
  };
  return <Badge className={`rounded-full text-[10px] uppercase ${map[status] || "bg-slate-200 text-slate-700"}`}>{status}</Badge>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, replied: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all | new | replied
  const [selected, setSelected] = useState(null);

  const admin = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("st_admin") || "null"); } catch { return null; }
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [m, s] = await Promise.all([api.get("/admin/messages"), api.get("/admin/stats")]);
      setMessages(m.data);
      setStats(s.data);
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("st_admin_token");
        navigate("/admin/login", { replace: true });
      } else {
        toast.error("Could not load messages");
      }
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function logout() {
    localStorage.removeItem("st_admin_token");
    localStorage.removeItem("st_admin");
    navigate("/admin/login", { replace: true });
  }

  async function setStatus(id, status) {
    try {
      await api.patch(`/admin/messages/${id}`, { status });
      toast.success(`Marked as ${status}`);
      setMessages((cur) => cur.map((m) => (m.id === id ? { ...m, status } : m)));
      if (selected?.id === id) setSelected({ ...selected, status });
      const s = await api.get("/admin/stats"); setStats(s.data);
    } catch { toast.error("Update failed"); }
  }

  async function remove(id) {
    if (!window.confirm("Delete this message? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/messages/${id}`);
      setMessages((cur) => cur.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success("Deleted");
      const s = await api.get("/admin/stats"); setStats(s.data);
    } catch { toast.error("Delete failed"); }
  }

  const filtered = messages.filter((m) => {
    if (activeTab === "new" && m.status !== "new") return false;
    if (activeTab === "replied" && m.status !== "replied") return false;
    if (!filter) return true;
    const q = filter.toLowerCase();
    return [m.name, m.email, m.subject, m.message].some((v) => (v || "").toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <Link to="/" className="flex items-center gap-3" data-testid="admin-back-home">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 ring-1 ring-slate-200">
              <img src={LOGO_URL} alt="Star Technologies" className="h-full w-full object-contain" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-[#0a1d4a]">Star Technologies</div>
              <div className="text-[11px] text-slate-500">Admin Dashboard</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 sm:inline">{admin?.email}</span>
            <Button variant="outline" size="sm" onClick={load} className="rounded-full" data-testid="admin-refresh">
              <RefreshCw className="mr-2 h-3.5 w-3.5" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={logout} className="rounded-full" data-testid="admin-logout">
              <LogOut className="mr-2 h-3.5 w-3.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Total Messages", stats.total, Inbox],
            ["New", stats.new, Mail],
            ["Replied", stats.replied, CheckCircle2],
          ].map(([label, value, Icon]) => (
            <Card key={label} className="rounded-2xl border-slate-200">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
                  <div className="mt-1 text-2xl font-bold text-[#0a1d4a]">{value}</div>
                </div>
                <Icon className="h-7 w-7 text-[#1e6bff]" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Card className="rounded-2xl border-slate-200">
              <CardHeader className="flex flex-col gap-3 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base text-[#0a1d4a]">Contact messages</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder="Search..."
                      className="h-9 pl-8 w-44"
                      data-testid="admin-search"
                    />
                  </div>
                </div>
              </CardHeader>

              <div className="flex gap-2 border-b border-slate-100 px-5 py-3">
                {["all", "new", "replied"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                      activeTab === t ? "bg-[#0a1d4a] text-white" : "bg-slate-100 text-slate-600"
                    }`}
                    data-testid={`admin-tab-${t}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
                ) : filtered.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500" data-testid="admin-empty-state">
                    No messages here yet.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {filtered.map((m) => (
                      <li
                        key={m.id}
                        onClick={() => { setSelected(m); if (m.status === "new") setStatus(m.id, "read"); }}
                        className={`cursor-pointer px-5 py-4 hover:bg-slate-50 ${selected?.id === m.id ? "bg-slate-50" : ""}`}
                        data-testid={`admin-message-row-${m.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-bold text-[#0a1d4a]">{m.name}</span>
                              <StatusBadge status={m.status} />
                            </div>
                            <div className="mt-0.5 truncate text-xs text-slate-500">{m.email}</div>
                            <div className="mt-1 truncate text-sm text-slate-700">{m.subject || m.message}</div>
                          </div>
                          <div className="ml-3 text-right text-[11px] text-slate-400">
                            {new Date(m.created_at).toLocaleString()}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card className="sticky top-6 rounded-2xl border-slate-200">
              {!selected ? (
                <CardContent className="p-10 text-center text-sm text-slate-500">
                  Select a message to view details.
                </CardContent>
              ) : (
                <>
                  <CardHeader className="border-b border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg text-[#0a1d4a]">{selected.name}</CardTitle>
                        <div className="mt-1 text-xs text-slate-500">{new Date(selected.created_at).toLocaleString()}</div>
                      </div>
                      <StatusBadge status={selected.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-slate-700"><Mail className="h-4 w-4 text-[#1e6bff]" /><a href={`mailto:${selected.email}`} className="hover:underline">{selected.email}</a></div>
                      {selected.phone && <div className="flex items-center gap-2 text-slate-700"><Phone className="h-4 w-4 text-[#1e6bff]" />{selected.phone}</div>}
                      {selected.subject && <div className="text-slate-700"><strong>Subject:</strong> {selected.subject}</div>}
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 whitespace-pre-wrap">
                      {selected.message}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Email delivery: admin {selected.admin_email_id ? "✓" : "—"} · customer {selected.customer_email_id ? "✓" : "—"}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button asChild className="rounded-full bg-[#0a1d4a] text-white hover:bg-[#1e6bff]" data-testid="admin-reply-btn">
                        <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || "Your enquiry — Star Technologies")}`}>Reply by email</a>
                      </Button>
                      {selected.status !== "replied" && (
                        <Button variant="outline" className="rounded-full" onClick={() => setStatus(selected.id, "replied")} data-testid="admin-mark-replied">
                          Mark as replied
                        </Button>
                      )}
                      <Button variant="outline" className="rounded-full text-rose-700 hover:bg-rose-50" onClick={() => remove(selected.id)} data-testid="admin-delete-btn">
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
