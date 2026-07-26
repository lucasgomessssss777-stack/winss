import { useEffect, useState } from "react";
import { Star, ThumbsUp } from "lucide-react";

type Comment = {
  name: string;
  avatar: string;
  time: string;
  text: string;
  likes: number;
};

const COMMENTS: Comment[] = [
  {
    name: "Mariana Silva",
    avatar: "https://i.pravatar.cc/80?img=47",
    time: "há 2 horas",
    text: "Não acreditei quando caiu o Pix! Recebi R$ 850 direitinho. Super recomendo participar 💚",
    likes: 128,
  },
  {
    name: "Carlos Eduardo",
    avatar: "https://i.pravatar.cc/80?img=12",
    time: "há 4 horas",
    text: "Rapidinho fiz o quiz e ganhei meu prêmio. Magalu Brasil de parabéns!",
    likes: 92,
  },
  {
    name: "Juliana Ferreira",
    avatar: "https://i.pravatar.cc/80?img=32",
    time: "há 6 horas",
    text: "Achei que era golpe, mas recebi R$ 1.000 no meu Pix. Simplesmente incrível! 🙌",
    likes: 214,
  },
  {
    name: "Rafael Souza",
    avatar: "https://i.pravatar.cc/80?img=15",
    time: "há 8 horas",
    text: "Levei menos de 5 minutos pra completar. Já compartilhei com toda família.",
    likes: 76,
  },
  {
    name: "Patrícia Oliveira",
    avatar: "https://i.pravatar.cc/80?img=45",
    time: "há 10 horas",
    text: "Muito obrigada Magalu Brasil! Vou usar o prêmio pra comprar o presente do meu filho ❤️",
    likes: 156,
  },
  {
    name: "Fernando Lima",
    avatar: "https://i.pravatar.cc/80?img=8",
    time: "há 12 horas",
    text: "Confesso que fiquei desconfiado, mas o dinheiro caiu na hora. Recomendo demais!",
    likes: 103,
  },
];

export function CommentsCarousel() {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % COMMENTS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  function toggleLike(i: number) {
    setLiked((prev) => ({ ...prev, [i]: !prev[i] }));
  }


  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
          Comentários recentes
        </h2>
        <span className="text-xs text-muted-foreground">
          {COMMENTS.length} avaliações
        </span>
      </div>

      <div className="relative h-[168px] overflow-hidden rounded-md border border-border bg-white">
        <div
          className="flex flex-col transition-transform duration-500 ease-out"
          style={{ transform: `translateY(-${index * 168}px)` }}
        >
          {COMMENTS.map((c, i) => (
            <article
              key={i}
              className="flex h-[168px] shrink-0 gap-3 p-4"
            >
              <img
                src={c.avatar}
                alt={c.name}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
                loading="lazy"
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-foreground">
                    {c.name}
                  </p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {c.time}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className="h-3 w-3 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="mt-1.5 line-clamp-3 text-sm text-foreground/90">
                  {c.text}
                </p>
                <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{c.likes} curtidas</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {COMMENTS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
