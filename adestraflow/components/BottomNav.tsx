"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/",         label: "Agenda",   icon: CalendarIcon  },
  { href: "/sessions", label: "Sessões",  icon: NoteIcon      },
  { href: "/clients",  label: "Clientes", icon: PeopleIcon    },
  { href: "/dogs",     label: "Cães",     icon: PawIcon       },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegação principal">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link href={href}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs font-display ${active ? "text-primary" : "text-ink-muted"}`}
                aria-current={active ? "page" : undefined}>
                <Icon active={active} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
      <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
      <path d="M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
    </svg>
  );
}
function NoteIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
    </svg>
  );
}
function PeopleIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8.5" r="3.25" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
      <path d="M3 19.5c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
      <path d="M15.5 5.5c1.6.4 2.75 1.7 2.75 3.25S17.1 11.6 15.5 12" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
      <path d="M16.5 14.7c2 .5 3.5 2.1 3.5 4.3" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
    </svg>
  );
}
function PawIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="12" cy="16" rx="5" ry="4" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
      <circle cx="6.5" cy="9.5" r="1.8" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
      <circle cx="11" cy="6.5" r="1.8" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
      <circle cx="15.5" cy="6.8" r="1.8" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
      <circle cx="18.5" cy="10.3" r="1.8" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
    </svg>
  );
}
