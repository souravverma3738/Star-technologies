import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight, BadgeCheck, BarChart3, BookOpen, CheckCircle2, ChevronRight,
  CircleDollarSign, Clock3, Code2, Cpu, Globe, Layers3, LifeBuoy, Mail,
  Menu, MessageCircle, MonitorSmartphone, Phone, Rocket, ShieldCheck,
  ShoppingCart, Sparkles, Star, Users, Workflow, X,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { detectCurrency, formatPrice } from "@/lib/currency";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_aeba3559-7982-43dd-8bb7-505962083eda/artifacts/7hdvdyna_Logo_1.png";

const navItems = [
  { label: "Services", href: "#services" },
  { label: "Solutions", href: "#solutions" },
  { label: "Industries", href: "#industries" },
  { label: "Projects", href: "#projects" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const services = [
  { title: "Website Development", desc: "Modern, fast, responsive websites built to convert visitors into customers.", icon: Globe },
  { title: "Web & Mobile Apps", desc: "Scalable applications for operations, customer engagement and internal tools.", icon: MonitorSmartphone },
  { title: "Online Ordering Systems", desc: "Ordering experiences for restaurants, takeaways and local businesses.", icon: ShoppingCart },
  { title: "Business Automation", desc: "Automate repetitive tasks, notifications, workflows and approvals.", icon: Workflow },
  { title: "CRM & Management Systems", desc: "Dashboards, customer management, reporting and admin panels.", icon: Users },
  { title: "Maintenance & Support", desc: "Post-launch improvements, monitoring, updates and technical support.", icon: LifeBuoy },
];

const industries = [
  "Restaurants & Takeaways", "Retail & Local Shops", "Startups",
  "Service Businesses", "Small Companies", "Growing Brands",
];

const solutions = [
  "Increase Online Orders", "Automate Daily Operations",
  "Improve Customer Experience", "Manage Orders and Payments",
  "Digitize Business Processes", "Build Scalable Internal Systems",
];

const projects = [
  { title: "Restaurant Ordering Website", tag: "Ordering System", stats: "+38% online orders",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop" },
  { title: "Business Operations Dashboard", tag: "Admin Dashboard", stats: "2.4× faster reporting",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop" },
  { title: "Smart Booking Platform", tag: "Booking System", stats: "−52% manual tasks",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop" },
];

const pricing = [
  { name: "Starter", gbp: 799, prefix: "From", features: ["Business website", "Contact form", "Domain & hosting setup", "Mobile responsive"], highlight: false },
  { name: "Growth", gbp: 1999, prefix: "From", features: ["Website + ordering or booking", "Admin dashboard", "Basic automation", "Training & support"], highlight: true },
  { name: "Premium", gbp: null, prefix: "Custom Quote", features: ["Website + app + dashboard", "Advanced automation", "Custom integrations", "Growth support"], highlight: false },
];

const testimonials = [
  { name: "Aisha Rahman", role: "Restaurant Owner", text: "The system helped us take more online orders, reduce missed calls and look far more professional." },
  { name: "Daniel Brooks", role: "Startup Founder", text: "Star Technologies built a clean dashboard and booking flow that made our operations much easier to manage." },
  { name: "Maria Evans", role: "Retail Business Manager", text: "Fast delivery, smart ideas and strong support after launch. It felt like a business partner, not just a developer." },
];

function LogoMark({ size = 44 }) {
  return (
    <div
      className="inline-flex items-center justify-center rounded-xl bg-white p-1.5 shadow-[0_4px_22px_-6px_rgba(10,29,74,.45)]"
      data-testid="logo-mark"
      style={{ width: size, height: size }}
    >
      <img src={LOGO_URL} alt="Star Technologies" className="h-full w-full object-contain" />
    </div>
  );
}

function SectionHeading({ badge, title, description, light }) {
  return (
    <div className="max-w-3xl">
      <Badge
        variant="outline"
        className={`mb-4 rounded-full px-3 py-1 text-xs tracking-wide ${
          light ? "border-white/15 bg-white/5 text-blue-200" : "border-[#0a1d4a]/15 bg-[#0a1d4a]/5 text-[#0a1d4a]"
        }`}
      >
        {badge}
      </Badge>
      <h2 className={`font-extrabold leading-[1.05] tracking-tight ${light ? "text-white" : "text-[#0a1d4a]"} text-4xl sm:text-5xl`}>
        {title}
      </h2>
      <p className={`mt-5 text-base sm:text-lg ${light ? "text-blue-100/70" : "text-slate-600"}`}>{description}</p>
    </div>
  );
}

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDemo, setActiveDemo] = useState("Restaurant Demo");
  const [submitting, setSubmitting] = useState(false);
  const [currency, setCurrency] = useState({ code: "GBP", symbol: "£", rate: 1 });
  const formRef = useRef(null);

  useEffect(() => {
    detectCurrency().then(setCurrency).catch(() => {});
  }, []);

  // Reveal-on-scroll
  useEffect(() => {
    const els = document.querySelectorAll(".st-reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const demoData = useMemo(
    () => ({
      "Restaurant Demo": { revenue: "£18.4k", orders: "426", customers: "181", conversion: "7.8%" },
      "Dashboard Demo": { revenue: "£42.1k", orders: "1,224", customers: "548", conversion: "11.2%" },
      "Booking Demo":   { revenue: "£9.2k",  orders: "286",   customers: "94",  conversion: "6.9%" },
    }),
    []
  );
  const stats = demoData[activeDemo];

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    const form = formRef.current;
    const data = {
      name:    form.name.value.trim(),
      email:   form.email.value.trim(),
      phone:   form.phone.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
    };
    if (!data.name || !data.email || !data.message) {
      toast.error("Please fill in your name, email and message.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/contact", data);
      toast.success(res.data.message || "Message sent — we'll be in touch.");
      form.reset();
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === "string" ? detail : "Couldn't send your message. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-[#0b1220]">
      {/* ===== NAVBAR ===== */}
      <header className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <a href="#top" className="flex items-center gap-3" data-testid="nav-logo">
            <LogoMark size={42} />
            <div className="leading-tight">
              <div className="text-[15px] font-bold tracking-tight text-[#0a1d4a]">Star Technologies</div>
              <div className="text-[11px] font-medium tracking-[0.18em] text-[#1e6bff]">SOLUTIONS THAT EMPOWER</div>
            </div>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((it) => (
              <a key={it.label} href={it.href} className="st-link-underline text-sm font-medium text-slate-700 hover:text-[#0a1d4a]" data-testid={`nav-${it.label.toLowerCase()}`}>
                {it.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/admin/login" className="text-xs font-medium text-slate-500 hover:text-[#0a1d4a]" data-testid="nav-admin-link">
              Admin
            </Link>
            <Button asChild className="rounded-full bg-[#0a1d4a] px-5 text-white hover:bg-[#1e6bff]" data-testid="nav-cta-contact">
              <a href="#contact">Get Started</a>
            </Button>
          </div>

          <button
            className="rounded-lg p-2 text-[#0a1d4a] md:hidden"
            onClick={() => setMobileOpen((s) => !s)}
            aria-label="Menu"
            data-testid="mobile-menu-toggle"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map((it) => (
                <a
                  key={it.label}
                  href={it.href}
                  className="text-sm font-medium text-slate-700"
                  onClick={() => setMobileOpen(false)}
                  data-testid={`mobile-nav-${it.label.toLowerCase()}`}
                >
                  {it.label}
                </a>
              ))}
              <Link to="/admin/login" className="text-sm font-medium text-slate-500" onClick={() => setMobileOpen(false)}>
                Admin
              </Link>
              <Button asChild className="mt-2 rounded-full bg-[#0a1d4a] text-white">
                <a href="#contact" onClick={() => setMobileOpen(false)}>Get Started</a>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section id="top" className="relative overflow-hidden st-grain st-shine">
        <div className="st-orb h-[420px] w-[420px] -left-32 -top-32" style={{ background: "#1e6bff" }} />
        <div className="st-orb h-[360px] w-[360px] right-0 top-20" style={{ background: "#4ea2ff" }} />
        <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
          <div className="grid gap-14 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 st-reveal">
              <Badge className="mb-5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-blue-100 hover:bg-white/10">
                <Sparkles className="mr-2 h-3.5 w-3.5" /> Custom Digital Solutions for Growing Businesses
              </Badge>
              <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Build smarter with{" "}
                <span className="bg-gradient-to-r from-[#9bd0ff] to-white bg-clip-text text-transparent">Star Technologies</span>
              </h1>
              <p className="mt-6 max-w-xl text-base text-blue-100/80 sm:text-lg">
                We design websites, apps, ordering systems, dashboards and automation tools that help businesses
                grow revenue, simplify operations and scale with confidence.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild className="rounded-full bg-white px-6 text-[#0a1d4a] hover:bg-blue-50" data-testid="hero-cta-start">
                  <a href="#contact">Get Started <ArrowRight className="ml-2 h-4 w-4" /></a>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-white/25 bg-white/5 px-6 text-white hover:bg-white/10" data-testid="hero-cta-demo">
                  <a href="#demo">Try Live Demo</a>
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Fast Delivery", Clock3],
                  ["Custom Solutions", Cpu],
                  ["Scalable Systems", Layers3],
                  ["Ongoing Support", ShieldCheck],
                ].map(([label, Icon]) => (
                  <div key={label} className="st-card-glass flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-blue-100">
                    <Icon className="h-4 w-4 text-[#9bd0ff]" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:col-span-5 st-reveal" style={{ transitionDelay: "120ms" }}>
              <div className="relative rounded-[26px] border border-white/15 bg-white/5 p-3 shadow-2xl backdrop-blur-md">
                <img
                  src="https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=1200&auto=format&fit=crop"
                  alt="Live growth dashboard"
                  className="h-64 w-full rounded-[18px] object-cover sm:h-72"
                />
                <div className="absolute -bottom-5 left-6 right-6 grid grid-cols-3 gap-2 rounded-2xl border border-white/15 bg-[#0a1d4a]/80 p-3 backdrop-blur">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-blue-200/80">Orders</div>
                    <div className="text-lg font-bold text-white">1,248</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-blue-200/80">Revenue</div>
                    <div className="text-lg font-bold text-white">£46.2k</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-blue-200/80">Customers</div>
                    <div className="text-lg font-bold text-white">864</div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 hidden rotate-3 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur md:block">
                Live Growth Dashboard
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="st-reveal">
          <SectionHeading
            badge="Services"
            title="Everything you need to grow online — built in-house"
            description="From a polished website to a complete custom system, we handle the strategy, design, build and long-term support."
          />
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.title} className="st-card-light group rounded-2xl transition hover:-translate-y-1 hover:shadow-xl st-reveal" data-testid={`service-card-${s.title.toLowerCase().replace(/[^a-z0-9]/g,"-")}`}>
                <CardHeader>
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#0a1d4a] text-white transition group-hover:bg-[#1e6bff]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-[#0a1d4a]">{s.title}</CardTitle>
                  <CardDescription className="text-sm text-slate-600">{s.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="#contact" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e6bff] hover:gap-2">
                    Explore service <ChevronRight className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ===== SOLUTIONS ===== */}
      <section id="solutions" className="bg-[#0a1d4a] relative overflow-hidden st-grain">
        <div className="st-orb h-[300px] w-[300px] right-10 top-20" style={{ background: "#1e6bff" }} />
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="st-reveal">
            <SectionHeading
              badge="Solutions"
              title="Practical solutions that move the metrics that matter"
              description="Each engagement is designed around measurable outcomes — more orders, faster operations, better customer experience."
              light
            />
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((item, i) => (
              <div key={item} className="st-card-glass rounded-2xl p-6 text-white st-reveal">
                <div className="mb-3 text-xs font-mono text-blue-200/80">0{i + 1}</div>
                <h3 className="text-lg font-bold">{item}</h3>
                <p className="mt-2 text-sm text-blue-100/70">
                  Strategy-led design, custom development and scalable architecture focused on real business growth.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INDUSTRIES (marquee) ===== */}
      <section id="industries" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5 st-reveal">
            <SectionHeading
              badge="Industries"
              title="Built for industries that move fast"
              description="We create websites, apps, dashboards and digital workflows for industries where customer experience and operational efficiency matter most."
            />
          </div>
          <div className="lg:col-span-7 st-reveal">
            <img
              src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1400&auto=format&fit=crop"
              alt="Team building digital solutions"
              className="h-72 w-full rounded-2xl object-cover shadow-xl"
            />
          </div>
        </div>
        <div className="relative mt-10 overflow-hidden">
          <div className="st-marquee-track flex gap-3 whitespace-nowrap">
            {[...industries, ...industries, ...industries].map((it, idx) => (
              <span key={idx} className="rounded-full border border-[#0a1d4a]/15 bg-white px-5 py-2 text-sm font-medium text-[#0a1d4a]">
                {it}
              </span>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#f4f6fb] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#f4f6fb] to-transparent" />
        </div>
      </section>

      {/* ===== WHY US ===== */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["We focus on business results", CircleDollarSign],
            ["Custom systems, not templates", Code2],
            ["We build to scale", Rocket],
            ["Long-term partnership", LifeBuoy],
          ].map(([title, Icon]) => (
            <div key={title} className="st-card-light rounded-2xl p-6 st-reveal" data-testid={`why-us-${title.toLowerCase().replace(/[^a-z0-9]/g,"-")}`}>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a1d4a]/5 text-[#0a1d4a]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#0a1d4a]">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">
                Every project is shaped around performance, clarity, maintainability and long-term value.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BEFORE / AFTER ===== */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-7 st-reveal">
            <h3 className="text-lg font-bold text-rose-900">Before</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-rose-900/80">
              {["Manual orders", "Missed customers", "Phone-call overload", "No customer tracking"].map((it) => (
                <li key={it} className="flex items-center gap-2">
                  <X className="h-4 w-4 text-rose-700" /> {it}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-7 st-reveal">
            <h3 className="text-lg font-bold text-emerald-900">After Star Technologies</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-emerald-900/80">
              {["Online ordering", "Automated workflows", "Better customer experience", "Live business dashboard"].map((it) => (
                <li key={it} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" /> {it}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== LIVE DEMO ===== */}
      <section id="demo" className="bg-[#061235] relative overflow-hidden st-grain">
        <div className="st-orb h-[260px] w-[260px] left-0 top-0" style={{ background: "#1e6bff" }} />
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="st-reveal">
            <SectionHeading
              badge="Live Demo"
              title="A digital experience your clients can preview"
              description="Real functionality, not just screenshots — toggle between three live previews and see how each system works."
              light
            />
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {Object.keys(demoData).map((d) => (
              <button
                key={d}
                onClick={() => setActiveDemo(d)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                  activeDemo === d
                    ? "bg-white text-[#061235]"
                    : "border border-white/10 bg-white/5 text-blue-100 hover:bg-white/10"
                }`}
                data-testid={`demo-tab-${d.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <div className="st-card-glass rounded-2xl p-6 lg:col-span-7">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-blue-200/70">Preview Mode</div>
                  <div className="text-lg font-bold text-white">{activeDemo}</div>
                </div>
                <Button asChild className="rounded-full bg-white text-[#061235] hover:bg-blue-100">
                  <a href="#contact">Request Demo</a>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Revenue", stats.revenue, BarChart3],
                  ["Orders", stats.orders, ShoppingCart],
                  ["Customers", stats.customers, Users],
                  ["Conversion", stats.conversion, Sparkles],
                ].map(([label, value, Icon]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <Icon className="h-4 w-4 text-[#9bd0ff]" />
                    <div className="mt-1.5 text-[11px] uppercase tracking-wide text-blue-200/70">{label}</div>
                    <div className="text-lg font-bold text-white">{value}</div>
                  </div>
                ))}
              </div>
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop"
                alt="App preview"
                className="mt-5 h-56 w-full rounded-xl object-cover"
              />
            </div>
            <div className="st-card-glass rounded-2xl p-6 lg:col-span-5">
              <div className="text-sm font-semibold text-white">Top Products</div>
              <ul className="mt-4 divide-y divide-white/10">
                {["Combo Meal", "Signature Pizza", "Family Box", "Special Burger"].map((p, i) => (
                  <li key={p} className="flex items-center justify-between py-3 text-blue-100">
                    <span className="flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center rounded-md bg-white/10 text-xs font-bold text-white">{i + 1}</span>
                      {p}
                    </span>
                    <span className="text-xs font-semibold text-emerald-300">+{(i + 2) * 8}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROJECTS ===== */}
      <section id="projects" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="st-reveal">
          <SectionHeading
            badge="Selected Projects"
            title="Real systems we've delivered"
            description="A snapshot of recent work — strategy, UI/UX, development and business-focused functionality, packaged into a premium client experience."
          />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.title} className="st-card-light overflow-hidden rounded-2xl st-reveal" data-testid={`project-card-${p.title.toLowerCase().replace(/[^a-z0-9]/g,"-")}`}>
              <img src={p.img} alt={p.title} className="h-48 w-full object-cover" />
              <CardHeader>
                <Badge variant="outline" className="w-fit border-[#0a1d4a]/15 bg-[#0a1d4a]/5 text-[#0a1d4a]">
                  {p.tag}
                </Badge>
                <CardTitle className="text-base font-bold text-[#0a1d4a]">{p.title}</CardTitle>
                <CardDescription className="text-sm text-slate-600">{p.stats}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="st-reveal">
          <SectionHeading
            badge="Process"
            title="A clear path from idea to launch"
            description="Five focused stages, transparent communication and predictable delivery."
          />
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-5">
          {[
            ["Discover", BookOpen],
            ["Plan", Layers3],
            ["Build", Code2],
            ["Launch", Rocket],
            ["Support", LifeBuoy],
          ].map(([title, Icon], idx) => (
            <div key={title} className="st-card-light rounded-2xl p-5 st-reveal">
              <div className="text-xs font-mono text-[#1e6bff]">0{idx + 1}</div>
              <Icon className="mt-3 h-5 w-5 text-[#0a1d4a]" />
              <h3 className="mt-3 text-base font-bold text-[#0a1d4a]">{title}</h3>
              <p className="mt-2 text-xs text-slate-600">Clear communication, practical planning, focused execution at every milestone.</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="st-reveal">
          <SectionHeading
            badge={`Pricing · shown in ${currency.code}`}
            title="Transparent packages, custom outcomes"
            description="Indicative pricing in your local currency. Final quote tailored to your scope after a free 30-minute discovery call."
          />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pricing.map((p) => (
            <Card
              key={p.name}
              className={`relative overflow-hidden rounded-2xl st-reveal ${
                p.highlight ? "border-[#1e6bff] bg-[#0a1d4a] text-white shadow-2xl" : "st-card-light"
              }`}
              data-testid={`pricing-card-${p.name.toLowerCase()}`}
            >
              {p.highlight && (
                <Badge className="absolute right-4 top-4 rounded-full bg-white text-[#0a1d4a]">Popular</Badge>
              )}
              <CardHeader>
                <CardTitle className={`text-xl font-bold ${p.highlight ? "text-white" : "text-[#0a1d4a]"}`}>{p.name}</CardTitle>
                <div className={`mt-2 text-3xl font-extrabold ${p.highlight ? "text-white" : "text-[#0a1d4a]"}`}>
                  {p.gbp ? (
                    <>
                      <span className={`mr-1 align-middle text-sm font-medium ${p.highlight ? "text-blue-200" : "text-slate-500"}`}>{p.prefix}</span>
                      {formatPrice(p.gbp, currency)}
                    </>
                  ) : (
                    <span>{p.prefix}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 ${p.highlight ? "text-blue-100" : "text-slate-700"}`}>
                      <CheckCircle2 className={`mt-0.5 h-4 w-4 ${p.highlight ? "text-[#9bd0ff]" : "text-[#1e6bff]"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className={`mt-6 w-full rounded-full ${p.highlight ? "bg-white text-[#0a1d4a] hover:bg-blue-100" : "bg-[#0a1d4a] text-white hover:bg-[#1e6bff]"}`} data-testid={`pricing-cta-${p.name.toLowerCase()}`}>
                  <a href="#contact">Get Started</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5 st-reveal">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop"
              alt="Star Technologies team"
              className="h-80 w-full rounded-2xl object-cover shadow-xl"
            />
          </div>
          <div className="lg:col-span-7 st-reveal">
            <SectionHeading
              badge="About Star Technologies"
              title="Custom digital systems built around your business"
              description="Star Technologies exists to help businesses move beyond manual processes and outdated systems by creating websites, apps, dashboards and automations that drive measurable results."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ["Mission", "Help businesses grow online and simplify operations."],
                ["Vision", "Build smart digital systems for modern businesses."],
                ["Values", "Innovation, clarity, reliability and business-first thinking."],
                ["Founder Focus", "A human, strategic, long-term partner for digital growth."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-xl border border-[#0a1d4a]/10 bg-[#0a1d4a]/[0.03] p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#1e6bff]">{t}</div>
                  <p className="mt-1.5 text-sm text-slate-700">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="st-reveal">
          <SectionHeading
            badge="Client Stories"
            title="Trusted by founders and operators"
            description="A few words from people we've built systems for."
          />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="st-card-light rounded-2xl p-6 st-reveal">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#1e6bff] text-[#1e6bff]" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-700">“{t.text}”</p>
              <div className="mt-4">
                <div className="text-sm font-bold text-[#0a1d4a]">{t.name}</div>
                <div className="text-xs text-slate-500">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="bg-[#0a1d4a] relative overflow-hidden st-grain">
        <div className="st-orb h-[360px] w-[360px] -right-20 top-0" style={{ background: "#1e6bff" }} />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-5 st-reveal">
            <SectionHeading
              badge="Contact Us"
              title="Ready to build your digital system?"
              description="Let's design a professional solution that helps your business increase sales, improve workflows and scale with confidence."
              light
            />
            <div className="mt-8 space-y-3 text-blue-100/85">
              <a href="mailto:admin@startechnologies.com" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 hover:bg-white/10" data-testid="contact-email-link">
                <Mail className="h-4 w-4 text-[#9bd0ff]" />
                <span className="text-sm">admin@startechnologies.com</span>
              </a>
              <a href="tel:+447824047235" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 hover:bg-white/10" data-testid="contact-phone-link">
                <Phone className="h-4 w-4 text-[#9bd0ff]" />
                <span className="text-sm">+44 7824 047235</span>
              </a>
              <a
                href="https://wa.me/447824047235"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 hover:bg-white/10"
                data-testid="contact-whatsapp-link"
              >
                <MessageCircle className="h-4 w-4 text-[#9bd0ff]" />
                <span className="text-sm">WhatsApp consultation</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 st-reveal">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/10 bg-white p-6 sm:p-8 shadow-2xl"
              data-testid="contact-form"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your name</label>
                  <Input name="name" required placeholder="Jane Doe" className="mt-1.5" data-testid="contact-input-name" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
                  <Input name="email" type="email" required placeholder="jane@business.com" className="mt-1.5" data-testid="contact-input-email" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</label>
                  <Input name="phone" placeholder="Optional" className="mt-1.5" data-testid="contact-input-phone" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</label>
                  <Input name="subject" placeholder="What's it about?" className="mt-1.5" data-testid="contact-input-subject" />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message</label>
                <Textarea name="message" required rows={5} placeholder="Tell us about your project, goals or current pain points." className="mt-1.5" data-testid="contact-input-message" />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-full bg-[#0a1d4a] py-6 text-base text-white hover:bg-[#1e6bff] disabled:opacity-60"
                data-testid="contact-submit-btn"
              >
                {submitting ? "Sending..." : (<>Send Message <ArrowRight className="ml-2 h-4 w-4" /></>)}
              </Button>
              <p className="mt-3 text-xs text-slate-500">We reply within 24 hours · Your details stay private.</p>
            </form>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#061235] text-blue-100/80">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3">
                <LogoMark size={42} />
                <div className="leading-tight">
                  <div className="text-base font-bold text-white">Star Technologies</div>
                  <div className="text-[11px] tracking-[0.18em] text-[#9bd0ff]">SOLUTIONS THAT EMPOWER</div>
                </div>
              </div>
              <p className="mt-4 max-w-md text-sm">
                Custom websites, apps, dashboards and automation systems for restaurants, retail, startups
                and growing businesses across the UK and beyond.
              </p>
            </div>
            <div className="md:col-span-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/90">Company</div>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="#services" className="hover:text-white">Services</a></li>
                <li><a href="#projects" className="hover:text-white">Projects</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#about" className="hover:text-white">About</a></li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/90">Contact</div>
              <ul className="mt-4 space-y-2 text-sm">
                <li>admin@startechnologies.com</li>
                <li>+44 7824 047235</li>
                <li>WhatsApp: +44 7824 047235</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-blue-100/60 sm:flex-row sm:items-center">
            <div>© {new Date().getFullYear()} Star Technologies. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <BadgeCheck className="h-3.5 w-3.5 text-[#9bd0ff]" /> UK-based · Trusted partner
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
