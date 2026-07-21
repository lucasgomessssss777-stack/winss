import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function Header() {
  const { header_logo_url } = useSiteSettings();
  return (
    <header className="w-full border-b border-border bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
        <Link to="/" aria-label="Início" className="flex items-center">
          {header_logo_url ? (
            <img
              src={header_logo_url}
              alt="Logo do site"
              className="h-10 w-auto max-w-[180px] object-contain"
            />
          ) : (
            <div
              aria-label="Espaço para logo"
              className="flex h-10 w-[160px] items-center justify-center rounded-md border border-dashed border-border bg-primary-soft/40 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
            >
              Logo
            </div>
          )}
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden gap-6 text-sm font-medium text-muted-foreground sm:flex">
            <Link to="/" className="hover:text-primary">Início</Link>
            <a href="#" className="hover:text-primary">Ofertas</a>
            <a href="#" className="hover:text-primary">Ajuda</a>
          </nav>
          <button
            type="button"
            aria-label="Abrir menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-primary-soft hover:text-primary"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}