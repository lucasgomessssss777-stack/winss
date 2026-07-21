import { createFileRoute, useNavigate } from "@tanstack/react-router";
import promoBanner from "../assets/promo-banner.jpg";
import { ArrowRight, Gift } from "lucide-react";
import { useEffect } from "react";
import { trackVisit, trackQuizStart } from "../lib/tracking.functions";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { home_promo_url } = useSiteSettings();
  const promoSrc = home_promo_url || promoBanner;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("mb_visit_tracked") === "1") return;
    sessionStorage.setItem("mb_visit_tracked", "1");
    trackVisit().catch(() => {});
  }, []);

  function handleStart() {
    trackQuizStart().catch(() => {});
    navigate({ to: "/quiz" });
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="overflow-hidden rounded-md border border-border">
        <img
          src={promoSrc}
          alt="Banner promocional de aniversário Magazine Brasil"
          width={1600}
          height={900}
          className="h-auto w-full"
        />
      </div>

      <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-strong">
        <Gift className="h-3.5 w-3.5" /> Pesquisa oficial de aniversário
      </div>

      <h1 className="mt-4 text-xl font-extrabold leading-snug text-foreground sm:text-2xl">
        Aniversário Magazine Brasil{" "}
        <span className="text-primary">ganhe até R$1000 em prêmios</span>
      </h1>

      <p className="mt-4 max-w-2xl text-base text-muted-foreground">
        Você recebeu um convite para participar de uma pesquisa de satisfação
        Magazine. Complete as 4 etapas da pesquisa para concorrer.
      </p>

      <button
        type="button"
        onClick={handleStart}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-8 py-4 text-lg font-extrabold uppercase tracking-wide text-primary-foreground shadow-sm transition-colors hover:bg-primary-strong"
      >
        Começar <ArrowRight className="h-5 w-5" />
      </button>

      <ul className="mt-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
        <li className="rounded-md border border-border bg-white p-3"><b className="text-foreground">4 etapas</b><br />rápidas para participar</li>
        <li className="rounded-md border border-border bg-white p-3"><b className="text-foreground">Prêmios em dinheiro</b><br />via chave Pix</li>
        <li className="rounded-md border border-border bg-white p-3"><b className="text-foreground">100% online</b><br />sem sair de casa</li>
      </ul>
    </div>
  );
}
