import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Camera, ArrowLeft, Upload } from "lucide-react";

const categories = [
  { value: "electrical", label: "⚡ Elétrica", icon: "⚡" },
  { value: "plumbing", label: "🚰 Hidráulica", icon: "🚰" },
  { value: "appliances", label: "📺 Eletrodomésticos", icon: "📺" },
  { value: "cleaning", label: "🧹 Limpeza", icon: "🧹" },
  { value: "general", label: "🔧 Geral", icon: "🔧" },
];

const RequestMaintenance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  type ProfileLite = { id?: string; resident_score?: number; resident_level?: "gold" | "silver" | "bronze" | "visitor"; address_street?: string; address_number?: string; city?: string };
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      if (profileData?.resident_score < 40) {
        toast.error("Você precisa ser morador Bronze ou superior para solicitar manutenção");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      let photoUrl = "";

      // Upload photo if exists
      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("maintenance-photos")
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("maintenance-photos")
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      // Obter ou criar o imóvel do morador, com fallback pelo endereço salvo no perfil
      let propertyId: string | null = null;
      let realEstateId: string | null = null;
      try {
        const { data: prop } = await supabase
          .from("properties")
          .select("id, real_estate_id")
          .eq("tenant_id", user.id)
          .single();
        if (prop) {
          const p = prop as { id: string; real_estate_id: string | null };
          propertyId = p.id;
          realEstateId = p.real_estate_id ?? null;
        } else {
          // tenta criar um imóvel básico a partir do endereço do perfil
          const addr = [profile?.address_street, profile?.address_number, profile?.city].filter(Boolean).join(", ");
          const { data: created } = await supabase
            .from("properties")
            .insert({ tenant_id: user.id, address: addr })
            .select("id, real_estate_id")
            .single();
          if (created) {
            const c = created as { id: string; real_estate_id: string | null };
            propertyId = c.id;
            realEstateId = c.real_estate_id ?? null;
          }
        }
      } catch {
        // se não conseguir acessar/criar, seguimos sem property_id
      }

      // Se mesmo após a tentativa não houver propertyId, bloqueia com instrução clara
      if (!propertyId) {
        toast.error("Associe um imóvel ao seu perfil e salve o endereço no painel antes de solicitar manutenção.");
        navigate("/dashboard");
        return;
      }

      // Calculate priority based on resident level
      const priority = profile?.resident_level === "gold" ? 1 : 
                      profile?.resident_level === "silver" ? 2 : 3;

      const estimatedHours = profile?.resident_level === "gold" ? 2 : 
                            profile?.resident_level === "silver" ? 4 : 24;

      // Create maintenance request
      const { error: requestError } = await supabase
        .from("maintenance_requests")
        .insert([{
          tenant_id: user.id,
          property_id: propertyId,
          real_estate_id: realEstateId,
          category: category as "electrical" | "plumbing" | "appliances" | "cleaning" | "general",
          title,
          description,
          photo_url: photoUrl || null,
          priority,
          estimated_response_hours: estimatedHours,
          status: "pending_approval" as const
        }]);

      if (requestError) throw requestError;

      toast.success("Solicitação enviada! Aguarde aprovação da imobiliária.");
      navigate("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao enviar solicitação";
      console.error("Erro ao criar solicitação:", error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-bold">Resi - Solicitar Manutenção</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
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

            {/* Title */}
            <div>
              <Label htmlFor="title">Título do problema *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex: TV não está ligando"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Descrição detalhada *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Descreva o problema com o máximo de detalhes possível..."
                rows={5}
              />
            </div>

            {/* Photo Upload */}
            <div>
              <Label>Foto do problema *</Label>
              <div className="mt-2">
                {photoPreview ? (
                  <div className="relative">
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="w-full h-64 object-cover rounded-lg border-2 border-border"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview("");
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-12 h-12 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Clique para tirar foto</span> ou arrastar
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG até 10MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      required
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Info Alert */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <p className="text-sm">
                <strong>Tempo estimado de resposta:</strong>{" "}
                {profile?.resident_level === "gold" && "2 horas (Morador Ouro)"}
                {profile?.resident_level === "silver" && "4 horas (Morador Prata)"}
                {profile?.resident_level === "bronze" && "24 horas (Morador Bronze)"}
              </p>
            </Card>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Solicitação"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RequestMaintenance;
