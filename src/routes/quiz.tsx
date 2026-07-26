import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { trackQuizCompletion } from "../lib/tracking.functions";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Pesquisa Magalu Brasil — Etapa 1 de 4" },
      { name: "description", content: "Responda 5 perguntas rápidas para concorrer aos prêmios." },
      { property: "og:title", content: "Pesquisa Magalu Brasil" },
      { property: "og:description", content: "Responda 5 perguntas rápidas." },
    ],
  }),
  component: QuizPage,
});

const LETTERS = ["A", "B", "C", "D"] as const;

const QUESTIONS: { question: string; options: string[] }[] = [
  {
    question: "Com que frequência você compra na Magalu Brasil?",
    options: ["Toda semana", "Uma vez por mês", "A cada 2-3 meses", "Raramente"],
  },
  {
    question: "Qual categoria você mais compra?",
    options: ["Eletrônicos", "Moda", "Casa e decoração", "Beleza"],
  },
  {
    question: "Como você avalia nosso atendimento?",
    options: ["Excelente", "Bom", "Regular", "Precisa melhorar"],
  },
  {
    question: "Você recomendaria a Magalu Brasil a um amigo?",
    options: ["Com certeza", "Provavelmente sim", "Talvez", "Não"],
  },
  {
    question: "Qual meio de pagamento você prefere?",
    options: ["Pix", "Cartão de crédito", "Boleto", "Cartão de débito"],
  },
];

function QuizPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const total = QUESTIONS.length;
  const current = QUESTIONS[step];

  function handleSelect(index: number) {
    if (selected !== null) return;
    setSelected(index);
    setTimeout(() => {
      if (step + 1 >= total) {
        trackQuizCompletion().catch(() => {});
        navigate({ to: "/premiacao" });
      } else {
        setStep(step + 1);
        setSelected(null);
      }
    }, 400);
  }

  const progress = ((step + (selected !== null ? 1 : 0)) / total) * 100;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-foreground">
          Etapa {step + 1} de {total}
        </span>
        <span className="text-muted-foreground">Pesquisa Magalu</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-sm bg-primary-soft">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h1 className="mt-6 text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">
        {current.question}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Escolha a opção que melhor representa a sua resposta.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {current.options.map((opt, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(i)}
              className={[
                "flex w-full items-center gap-4 rounded-md border px-4 py-4 text-left transition-colors duration-200",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-white text-foreground hover:border-primary hover:bg-primary-soft",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-bold transition-colors",
                  isSelected
                    ? "bg-white text-primary"
                    : "bg-primary-soft text-primary-strong",
                ].join(" ")}
              >
                {LETTERS[i]}
              </span>
              <span className="text-lg font-semibold">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}