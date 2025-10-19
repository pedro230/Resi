import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import icon from "@/assets/maintenance-icon.png";

type Provider = {
  id: string;
  name: string;
  category: string;
  city: string;
  rating: number;
  discount: number;
};

const CATEGORIES = ["Eletricista", "Encanador", "Pintor", "Jardinagem", "Limpeza", "Geral"];

const makeProviders = (offset: number, count: number): Provider[] =>
  Array.from({ length: count }).map((_, i) => {
    const n = offset + i + 1;
    return {
      id: `prov-${n}`,
      name: `Prestador ${n}`,
      category: CATEGORIES[n % CATEGORIES.length],
      city: ["Itajaí", "Baln. Camboriú", "Ilhota", "Navegantes"][n % 4],
      rating: 3 + (n % 3) + Math.random() * 0.5,
      discount: [5, 10, 15, 20][n % 4],
    };
  });

const Feed = () => {
  const [items, setItems] = useState<Provider[]>(() => makeProviders(0, 20));
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !loadingMore) {
          setLoadingMore(true);
          setTimeout(() => {
            setItems((prev) => prev.concat(makeProviders(prev.length, 20)));
            setPage((p) => p + 1);
            setLoadingMore(false);
          }, 400);
        }
      });
    });
    io.observe(el);
    return () => io.disconnect();
  }, [loadingMore]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-10">
        <h1 className="text-3xl font-bold mb-6">Prestadores perto de você</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => (
            <Card key={p.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <img src={icon} alt="Ícone" className="h-12 w-12 rounded" />
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.category} • {p.city}</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Avaliação {p.rating.toFixed(1)} ⭐</div>
              <div className="text-sm"><span className="text-primary font-semibold">{p.discount}% OFF</span> para moradores</div>
              <Button className="mt-auto">Ver detalhes</Button>
            </Card>
          ))}
        </div>
        <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-6">
          {loadingMore && <span className="text-muted-foreground text-sm">Carregando mais…</span>}
        </div>
      </main>
    </div>
  );
};

export default Feed;

