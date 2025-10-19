import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin } from "lucide-react";

const partners = [
  { id: 1, name: 'Restaurante Praia Sol', city: 'Itajaí', category: 'Restaurante', discount: 15 },
  { id: 2, name: 'Kiano Serralheria', city: 'Baln. Camboriú', category: 'Serralheria', discount: 10 },
  { id: 3, name: 'Mercado Bom Preço', city: 'Navegantes', category: 'Mercado', discount: 8 },
  { id: 4, name: 'Farmácia Vida+', city: 'Itajaí', category: 'Farmácia', discount: 12 },
  { id: 5, name: 'Academia StrongFit', city: 'Itajaí', category: 'Academia', discount: 15 },
];

const PartnersList = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-bold mb-6">Empresas parceiras</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((p) => (
            <Card key={p.id} className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {p.city} • {p.category}
                  </div>
                </div>
              </div>
              <div className="text-sm"><span className="text-primary font-semibold">Até {p.discount}% OFF</span> para Premium</div>
              <Button className="mt-auto" variant="outline">Ver condições</Button>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PartnersList;

