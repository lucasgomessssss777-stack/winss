import { Facebook, Instagram, Youtube, Twitter, Mail, Phone } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function Footer() {
  const { footer_logo_url } = useSiteSettings();
  return (
    <footer className="mt-16 border-t border-border bg-primary-soft/40">
      <div className="mx-auto max-w-3xl px-5 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div>
            {footer_logo_url ? (
              <img
                src={footer_logo_url}
                alt="Logo do site"
                className="h-10 w-auto max-w-[180px] object-contain"
              />
            ) : (
              <div
                aria-label="Espaço para logo"
                className="flex h-10 w-[160px] items-center justify-center rounded-md border border-dashed border-border bg-white/70 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
              >
                Logo
              </div>
            )}
            <p className="mt-2 max-w-xs">
              Ofertas, promoções e experiências para quem ama comprar.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" aria-label="Facebook" className="rounded-md bg-white p-2 text-primary hover:text-primary-strong"><Facebook className="h-4 w-4" /></a>
              <a href="#" aria-label="Instagram" className="rounded-md bg-white p-2 text-primary hover:text-primary-strong"><Instagram className="h-4 w-4" /></a>
              <a href="#" aria-label="Twitter" className="rounded-md bg-white p-2 text-primary hover:text-primary-strong"><Twitter className="h-4 w-4" /></a>
              <a href="#" aria-label="Youtube" className="rounded-md bg-white p-2 text-primary hover:text-primary-strong"><Youtube className="h-4 w-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">Contato</h4>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> contato@magazinebrasil.com.br</p>
            <p className="mt-1 flex items-center gap-2"><Phone className="h-4 w-4" /> 0800 000 0000</p>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">Institucional</h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:text-primary">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-primary">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-primary">Trocas e Devoluções</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-4 text-xs">
          Magazine Brasil Comércio Ltda. — CNPJ 48.970.950/0001-21 — Rua Voluntários da Franca, São Paulo/SP.
          <br />© {new Date().getFullYear()} Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}