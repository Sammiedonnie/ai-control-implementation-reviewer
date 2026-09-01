import Link from "next/link";
import { LayoutDashboard, FilePlus2, Library, History, Info, ShieldCheck } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/new-review", label: "New Review", icon: FilePlus2 },
  { href: "/control-library", label: "Control Library", icon: Library },
  { href: "/history", label: "Review History", icon: History },
  { href: "/about", label: "About This Project", icon: Info },
];

export function SiteNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="md:w-60 md:min-h-screen border-b md:border-b-0 md:border-r border-line bg-paper-raised"
    >
      <div className="px-5 py-5 border-b border-line">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-accent" aria-hidden="true" />
          <span className="font-display font-semibold text-[15px] leading-tight text-ink">
            Control Implementation
            <br />
            Reviewer
          </span>
        </Link>
      </div>
      <ul className="p-2 flex md:flex-col overflow-x-auto md:overflow-visible">
        {links.map(({ href, label, icon: Icon }) => (
          <li key={href} className="shrink-0">
            <Link
              href={href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-ink-soft hover:bg-accent-soft hover:text-accent transition-colors"
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="hidden md:block px-5 py-4 mt-auto text-xs text-ink-faint border-t border-line">
        NIST SP 800-53 Rev. 5 · MCP-validated
      </div>
    </nav>
  );
}
