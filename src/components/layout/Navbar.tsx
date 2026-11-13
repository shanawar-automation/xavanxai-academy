"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Bot,
  BookOpen,
  Briefcase,
  Building2,
  ChevronDown,
  Code2,
  Cpu,
  LayoutDashboard,
  Lightbulb,
  Mail,
  Menu,
  Mic,
  Orbit,
  Sparkles,
  Users,
  Workflow,
  Wrench,
  X,
} from "lucide-react";
import { SERVICES_CATALOG } from "@/data/xavanData";

/* ───────────────────────────── Navigation model ───────────────────────────── */

type NavItem = {
  label: string;
  href: string;
  desc: string;
  icon: React.ElementType;
  badge?: string;
};

type NavGroup =
  | { kind: "link"; label: string; href: string }
  | {
      kind: "menu";
      id: string;
      label: string;
      width: "md" | "lg";
      items: NavItem[];
      footer?: { label: string; href: string };
    };

const SERVICE_ICONS: Record<string, React.ElementType> = {
  "ai-agent-development": Bot,
  "n8n-workflow-automation": Workflow,
  "ai-recruitment-systems": Users,
  "ai-voice-agents": Mic,
  "custom-ai-saas-development": Code2,
  "ai-consulting-integration": Lightbulb,
};

const NAV: NavGroup[] = [
  {
    kind: "menu",
    id: "platform",
    label: "Platform",
    width: "md",
    items: [
      {
        label: "AI Headquarters",
        href: "/ai-headquarters",
        desc: "Explore the 3D autonomous HQ and its 12 departments.",
        icon: Orbit,
        badge: "Signature",
      },
      {
        label: "Autonomous Agents",
        href: "/ai-agents",
        desc: "Specs, permissions and workflows for every agent.",
        icon: Cpu,
      },
      {
        label: "Talent Intelligence",
        href: "/recruitment",
        desc: "Ethical AI recruitment with human sign-off.",
        icon: Users,
      },
      {
        label: "AI Tools",
        href: "/ai-tools",
        desc: "Business, dev, marketing and career AI utilities.",
        icon: Wrench,
      },
    ],
  },
  {
    kind: "menu",
    id: "solutions",
    label: "Solutions",
    width: "lg",
    items: SERVICES_CATALOG.map((s) => ({
      label: s.title,
      href: `/services/${s.slug}`,
      desc: s.shortDesc,
      icon: SERVICE_ICONS[s.slug] ?? Sparkles,
    })),
    footer: { label: "View all solutions", href: "/services" },
  },
  { kind: "link", label: "Pricing", href: "/pricing" },
  {
    kind: "menu",
    id: "company",
    label: "Company",
    width: "md",
    items: [
      {
        label: "About XavanXAI",
        href: "/about",
        desc: "Our mission, architecture and security posture.",
        icon: Building2,
      },
      {
        label: "Clients & Reference Builds",
        href: "/clients",
        desc: "Demonstration architectures and engagements.",
        icon: Sparkles,
      },
      {
        label: "Engineering Journal",
        href: "/blog",
        desc: "Technical papers on agents and AI governance.",
        icon: BookOpen,
      },
      {
        label: "Careers",
        href: "/careers",
        desc: "Open roles — apply via Talent Intelligence.",
        icon: Briefcase,
      },
      {
        label: "Contact",
        href: "/contact",
        desc: "Talk to our operations team.",
        icon: Mail,
      },
    ],
  },
];

/* ───────────────────────────── Helpers ───────────────────────────── */

const isActivePath = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

const groupIsActive = (pathname: string, g: NavGroup) =>
  g.kind === "link"
    ? isActivePath(pathname, g.href)
    : g.items.some((i) => isActivePath(pathname, i.href));

type Me = { fullName: string; role: string } | null;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* ───────────────────────────── Component ───────────────────────────── */

export function Navbar() {
  const pathname = usePathname();
  const uid = useId();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [progress, setProgress] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const [me, setMe] = useState<Me>(null);

  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);
  const menuOpenRef = useRef(false);

  menuOpenRef.current = openMenu !== null || mobileOpen;

  /* Scroll: glass state, hide-on-scroll-down / show-on-scroll-up, progress bar */
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 12);
      setProgress(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);

      const delta = y - lastY.current;
      if (menuOpenRef.current || y < 120) {
        setHidden(false);
      } else if (delta > 8) {
        setHidden(true);
      } else if (delta < -8) {
        setHidden(false);
      }
      lastY.current = y;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* Who is signed in? (cheap probe; refreshed on each route change) */
  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive) return;
        setMe(d?.authenticated ? { fullName: d.fullName, role: d.role } : null);
      })
      .catch(() => alive && setMe(null));
    return () => {
      alive = false;
    };
  }, [pathname]);

  /* Close everything on navigation */
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileGroup(null);
  }, [pathname]);

  /* Desktop menus: click-outside + Escape */
  useEffect(() => {
    if (!openMenu) return;
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const id = openMenu;
        setOpenMenu(null);
        triggerRefs.current[id]?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  /* Mobile drawer: scroll lock, Escape, focus trap, focus return */
  useEffect(() => {
    if (!mobileOpen) return;

    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const drawer = drawerRef.current;
    const focusables = () =>
      Array.from(drawer?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    const toggle = mobileToggleRef.current;
    return () => {
      root.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [mobileOpen]);

  /* Close the mobile drawer if the viewport grows to desktop */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setMobileOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  }, [cancelClose]);

  const openOnHover = (id: string) => {
    // only hover-open on real pointers (not touch laptops tapping)
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      cancelClose();
      setOpenMenu(id);
    }
  };

  const showSolid = scrolled || openMenu !== null || mobileOpen;

  return (
    <>
      {/* Skip link for keyboard & screen-reader users */}
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-lg bg-[#F47735] px-4 py-2 text-sm font-semibold text-[#080808] focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow,padding] duration-300 ease-out ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${
          showSolid
            ? "border-b border-white/10 bg-[#080808]/80 py-2.5 shadow-nav backdrop-blur-xl"
            : "bg-transparent py-4"
        }`}
      >
        <div className="xavan-container relative flex items-center justify-between gap-4">
          {/* ── Brand ── */}
          <Link
            href="/"
            aria-label="XavanXAI — home"
            className="group flex shrink-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47735]"
          >
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#F47735]/40 bg-[#101010] shadow-orange-subtle transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-4deg]">
              <Cpu className="h-5 w-5 text-[#F47735]" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#F47735] animate-glow-pulse" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold tracking-wider text-white">
                XAVAN<span className="text-[#F47735]">XAI</span>
              </span>
              <span className="mt-1 hidden font-mono text-[10px] uppercase tracking-[0.22em] text-[#A1A1AA] sm:block">
                Autonomous HQ
              </span>
            </span>
          </Link>

          {/* ── Desktop navigation ── */}
          <nav
            ref={navRef}
            aria-label="Main navigation"
            className="hidden items-center gap-0.5 lg:flex"
            onMouseLeave={scheduleClose}
            onMouseEnter={cancelClose}
          >
            {NAV.map((group) => {
              const active = groupIsActive(pathname, group);

              if (group.kind === "link") {
                return (
                  <Link
                    key={group.href}
                    href={group.href}
                    aria-current={active ? "page" : undefined}
                    onMouseEnter={() => setOpenMenu(null)}
                    className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47735] ${
                      active ? "text-white" : "text-[#A1A1AA] hover:text-white"
                    }`}
                  >
                    {group.label}
                    <ActiveBar active={active} />
                  </Link>
                );
              }

              const isOpen = openMenu === group.id;
              const panelId = `${uid}-${group.id}`;

              return (
                <div key={group.id}>
                  <button
                    type="button"
                    ref={(el) => {
                      triggerRefs.current[group.id] = el;
                    }}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onMouseEnter={() => openOnHover(group.id)}
                    onClick={() => setOpenMenu(isOpen ? null : group.id)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setOpenMenu(group.id);
                        requestAnimationFrame(() =>
                          document
                            .querySelector<HTMLElement>(`[id="${panelId}"] a`)
                            ?.focus()
                        );
                      }
                    }}
                    className={`relative inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47735] ${
                      isOpen || active ? "text-white" : "text-[#A1A1AA] hover:text-white"
                    }`}
                  >
                    {group.label}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#F47735]" : ""
                      }`}
                    />
                    <ActiveBar active={active || isOpen} />
                  </button>

                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-label={`${group.label} menu`}
                      className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 animate-pop-in"
                    >
                      <div
                        className={`overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c]/95 shadow-glass backdrop-blur-2xl ${
                          group.width === "lg"
                            ? "w-[min(720px,calc(100vw-2rem))]"
                            : "w-[min(480px,calc(100vw-2rem))]"
                        }`}
                      >
                        <ul
                          className={`grid gap-1 p-2.5 ${
                            group.width === "lg" ? "grid-cols-2" : "grid-cols-1"
                          }`}
                        >
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            const itemActive = isActivePath(pathname, item.href);
                            return (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  aria-current={itemActive ? "page" : undefined}
                                  className={`group/item flex items-start gap-3.5 rounded-xl p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47735] ${
                                    itemActive ? "bg-white/[0.06]" : "hover:bg-white/[0.05]"
                                  }`}
                                >
                                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#141414] transition-colors group-hover/item:border-[#F47735]/50">
                                    <Icon className="h-4 w-4 text-[#F47735]" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="flex items-center gap-2 text-sm font-semibold text-white">
                                      {item.label}
                                      {item.badge && (
                                        <span className="rounded-full border border-[#F47735]/40 bg-[#F47735]/10 px-2 py-px font-mono text-[9px] uppercase tracking-wider text-[#F47735]">
                                          {item.badge}
                                        </span>
                                      )}
                                    </span>
                                    <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-[#A1A1AA]">
                                      {item.desc}
                                    </span>
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>

                        {group.footer && (
                          <Link
                            href={group.footer.href}
                            className="flex items-center justify-between border-t border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-white/[0.06] hover:text-[#F47735] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F47735]"
                          >
                            {group.footer.label}
                            <ArrowRight className="h-3.5 w-3.5 text-[#F47735]" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* ── Desktop actions ── */}
          <div className="hidden items-center gap-2 lg:flex">
            {me ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#101010] py-1.5 pl-1.5 pr-3.5 text-xs font-medium text-white transition-colors hover:border-[#F47735]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47735]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F47735] font-display text-[11px] font-bold text-[#080808]">
                  {initials(me.fullName)}
                </span>
                <span className="max-w-[110px] truncate">{me.fullName.split(" ")[0]}</span>
                <LayoutDashboard className="h-3.5 w-3.5 text-[#A1A1AA] transition-colors group-hover:text-[#F47735]" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-xl px-3.5 py-2 text-xs font-medium text-[#A1A1AA] transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47735]"
              >
                Sign in
              </Link>
            )}

            <Link
              href="/book-consultation"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#F47735] px-4 py-2 text-xs font-semibold text-[#080808] shadow-orange-subtle transition-all hover:bg-[#FF884B] hover:shadow-orange-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
            >
              Book Consultation
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* ── Mobile toggle ── */}
          <button
            ref={mobileToggleRef}
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls={`${uid}-drawer`}
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#101010] text-white transition-colors hover:border-[#F47735]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47735] lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Reading-progress hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] overflow-hidden"
        >
          <div
            className="h-full origin-left bg-gradient-to-r from-[#F47735] via-[#FF9B66] to-transparent transition-opacity duration-300"
            style={{ transform: `scaleX(${progress})`, opacity: scrolled ? 1 : 0 }}
          />
        </div>
      </header>

      {/* ───────────── Mobile slide-over ───────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="presentation">
          <div
            className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          <div
            id={`${uid}-drawer`}
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="absolute inset-y-0 right-0 flex w-[min(92vw,420px)] animate-slide-in-right flex-col border-l border-white/10 bg-[#0a0a0a] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="font-display text-base font-bold tracking-wider text-white">
                XAVAN<span className="text-[#F47735]">XAI</span>
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#101010] text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav
              aria-label="Mobile navigation"
              className="flex-1 overflow-y-auto overscroll-contain px-3 py-4"
            >
              <ul className="space-y-1">
                {NAV.map((group) => {
                  const active = groupIsActive(pathname, group);

                  if (group.kind === "link") {
                    return (
                      <li key={group.href}>
                        <Link
                          href={group.href}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-medium ${
                            active
                              ? "bg-[#F47735]/15 text-[#F47735]"
                              : "text-white/90 hover:bg-white/5"
                          }`}
                        >
                          {group.label}
                        </Link>
                      </li>
                    );
                  }

                  const expanded = mobileGroup === group.id;
                  return (
                    <li key={group.id}>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => setMobileGroup(expanded ? null : group.id)}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-[15px] font-medium ${
                          active ? "text-[#F47735]" : "text-white/90"
                        } hover:bg-white/5`}
                      >
                        {group.label}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            expanded ? "rotate-180 text-[#F47735]" : "text-[#A1A1AA]"
                          }`}
                        />
                      </button>

                      <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <ul className="space-y-0.5 pb-2 pl-2 pr-1 pt-1">
                            {group.items.map((item) => {
                              const Icon = item.icon;
                              const itemActive = isActivePath(pathname, item.href);
                              return (
                                <li key={item.href}>
                                  <Link
                                    href={item.href}
                                    tabIndex={expanded ? 0 : -1}
                                    aria-current={itemActive ? "page" : undefined}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                                      itemActive
                                        ? "bg-white/[0.07] text-white"
                                        : "text-[#A1A1AA] hover:bg-white/5 hover:text-white"
                                    }`}
                                  >
                                    <Icon className="h-4 w-4 shrink-0 text-[#F47735]" />
                                    <span>{item.label}</span>
                                  </Link>
                                </li>
                              );
                            })}
                            {group.footer && (
                              <li>
                                <Link
                                  href={group.footer.href}
                                  tabIndex={expanded ? 0 : -1}
                                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-[#F47735]"
                                >
                                  {group.footer.label}
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="space-y-3 border-t border-white/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {me ? (
                <Link
                  href="/dashboard"
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-sm font-medium text-white"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F47735] font-display text-xs font-bold text-[#080808]">
                      {initials(me.fullName)}
                    </span>
                    {me.fullName}
                  </span>
                  <LayoutDashboard className="h-4 w-4 text-[#F47735]" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-sm font-medium text-white"
                >
                  Sign in to portal
                </Link>
              )}
              <Link
                href="/book-consultation"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#F47735] px-4 py-3 text-sm font-semibold text-[#080808] shadow-orange-subtle"
              >
                Book Consultation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Animated underline indicator shared by link + trigger. */
function ActiveBar({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-3.5 -bottom-0.5 h-[2px] origin-center rounded-full bg-[#F47735] transition-transform duration-300 ease-out ${
        active ? "scale-x-100" : "scale-x-0"
      }`}
    />
  );
}
