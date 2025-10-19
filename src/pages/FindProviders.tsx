import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, MapPin, Star, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  phone: string;
  categories: string[];
  city: string;
  address: string | null;
  rating: number;
  total_jobs: number;
  active: boolean;
}

const categories = [
  { value: "all", label: "Todos os serviços", icon: "🔍" },
  { value: "electrical", label: "⚡ Elétrica", icon: "⚡" },
  { value: "plumbing", label: "🚰 Hidráulica", icon: "🚰" },
  { value: "appliances", label: "📺 Eletrodomésticos", icon: "📺" },
  { value: "cleaning", label: "🧹 Limpeza", icon: "🧹" },
  { value: "general", label: "🔧 Geral", icon: "🔧" },
];

const FindProviders = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [searchTerm, selectedCategory, selectedCity, providers]);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .eq("active", true)
        .order("rating", { ascending: false });

      if (error) throw error;

      setProviders(data || []);
      
      // Extract unique cities
      const uniqueCities = [...new Set((data || []).map(p => p.city))];
      setCities(uniqueCities);
    } catch (error) {
      console.error("Erro ao carregar prestadores:", error);
      toast.error("Erro ao carregar prestadores");
    } finally {
      setLoading(false);
    }
  };

  const filterProviders = () => {
    let filtered = [...providers];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p =>
        p.categories.includes(selectedCategory)
      );
    }

    // Filter by city
    if (selectedCity !== "all") {
      filtered = filtered.filter(p => p.city === selectedCity);
    }

    setFilteredProviders(filtered);
  };

  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-bold">Buscar Prestadores</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Search & Filters */}
        <Card className="p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search Bar with Autocomplete */}
            <div className="md:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria de serviço" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City Filter */}
            <div>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filters */}
            <div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedCity("all");
                }}
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {loading ? "Carregando..." : `${filteredProviders.length} prestador(es) encontrado(s)`}
          </p>
        </div>

        {/* Providers Grid */}
        {loading ? (
          <div className="text-center py-12">Carregando prestadores...</div>
        ) : filteredProviders.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Nenhum prestador encontrado com os filtros selecionados.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <Card
                key={provider.id}
                className="p-6 hover:shadow-glow transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">{provider.name}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-semibold">{provider.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-muted-foreground">
                        ({provider.total_jobs} trabalhos)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.categories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {getCategoryLabel(cat)}
                    </Badge>
                  ))}
                </div>

                {/* Location */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{provider.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{provider.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{provider.email}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button asChild variant="outline">
                    <a href={`tel:${provider.phone.replace(/\D/g,'')}`}>
                      Ligar
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <a target="_blank" rel="noreferrer" href={`https://wa.me/55${provider.phone.replace(/\D/g,'')}?text=${encodeURIComponent('Olá! Vi seu perfil no Resi e gostaria de um orçamento.')}`}>
                      WhatsApp
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href={`mailto:${provider.email}?subject=${encodeURIComponent('Contato via Resi')}`}>
                      E-mail
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindProviders;
