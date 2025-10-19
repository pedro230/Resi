import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LocationGate from "@/components/LocationGate";
import { toast } from "sonner";
import { Camera, LogOut, User, Award, Search } from "lucide-react";
import qrBadge from "@/assets/qr-badge.png";

type Profile = {
  id: string;
  full_name?: string;
  phone?: string;
  city?: string;
  address_street?: string;
  address_number?: string;
  address_district?: string;
  address_zip?: string;
  address_complement?: string;
  address?: string;
  resident_score?: number;
  resident_level?: "visitor" | "bronze" | "silver" | "gold";
  avatar_url?: string;
  proof_url?: string;
  proof_type?: string;
  location_enabled?: boolean;
  lat?: number;
  lng?: number;
  months_in_region?: number;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [zip, setZip] = useState("");
  const [complement, setComplement] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [proofUrl, setProofUrl] = useState<string>("");
  const [proofType, setProofType] = useState<string>("agua");
  const [proofStatus, setProofStatus] = useState<string>("");
  const [locationEnabled, setLocationEnabled] = useState<boolean>(false);
  const [qrVisible, setQrVisible] = useState<boolean>(false);
  const [showLocGate, setShowLocGate] = useState<boolean>(false);
  const proofInputRef = useRef<HTMLInputElement | null>(null);

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

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(profileData);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      setCity(profile.city || "");
      setStreet(profile.address_street || "");
      setNumber(profile.address_number || "");
      setDistrict(profile.address_district || "");
      setZip(profile.address_zip || "");
      setComplement(profile.address_complement || "");
      setPhone(profile.phone || "");
      setAvatarUrl(profile.avatar_url || "");
      setProofUrl(profile.proof_url || "");
      setProofType(profile.proof_type || "agua");
      setLocationEnabled(!!profile.location_enabled);
    }
  }, [profile]);

  // Se já tem coords no localStorage (ativado antes), some a tarefa imediatamente
  useEffect(() => {
    try {
      const hasCoords = !!localStorage.getItem('resi_coords');
      if (hasCoords && !locationEnabled) setLocationEnabled(true);
    } catch (e) { /* ignore localStorage access errors */ }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const uploadProof = async (file?: File) => {
    if (!file) return;
    const minSize = 50 * 1024;
    if (file.size < minSize) {
      toast.error("Arquivo muito pequeno");
      return;
    }
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = async () => {
        if (img.width < 600 || img.height < 600) {
          toast.error("Resolução mínima 600x600");
          URL.revokeObjectURL(url);
          return;
        }
        try {
          const path = `proofs/${profile.id}-${Date.now()}.${file.name.split('.').pop()}`;
          const { error } = await supabase.storage.from('proofs').upload(path, file);
          if (error) throw error;
          const { data: pub } = supabase.storage.from('proofs').getPublicUrl(path);
          setProofUrl(pub.publicUrl);
          await supabase.from('profiles').update({ proof_url: pub.publicUrl }).eq('id', profile.id);
          toast.success('Comprovante enviado');
        } catch (e) {
          console.error(e);
          toast.error('Falha ao enviar comprovante');
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      img.onerror = () => {
        toast.error('Falha ao ler imagem');
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } else {
      try {
        const path = `proofs/${profile.id}-${Date.now()}.${file.name.split('.').pop()}`;
        const { error } = await supabase.storage.from('proofs').upload(path, file);
        if (error) throw error;
        const { data: pub } = supabase.storage.from('proofs').getPublicUrl(path);
        setProofUrl(pub.publicUrl);
        await supabase.from('profiles').update({ proof_url: pub.publicUrl }).eq('id', profile.id);
        toast.success('Comprovante enviado');
      } catch (e) {
        console.error(e);
        toast.error('Falha ao enviar comprovante');
      }
    }
  };

  const formatPhoneBRIntl = (raw: string = "") => {
    const digits = (raw || "").replace(/\D/g, "");
    // Remove prefix 55 if present, we will add it formatted
    const d = digits.startsWith("55") ? digits.slice(2) : digits;
    const area = d.slice(0, 2);
    const p2 = d.slice(2, 4);
    const p5 = d.slice(4, 9);
    const last = d.slice(9, 13);
    let out = "+55";
    if (area) out += ` (${area})`;
    if (p2) out += ` ${p2}`;
    if (p5) out += ` ${p5}`;
    if (last) out += `-${last}`;
    return out;
  };
  // Auto-complete bairro (district) via CEP
  useEffect(() => {
    const c = (zip || "").replace(/\D/g, "");
    if (c.length === 8) {
      fetch(`https://viacep.com.br/ws/${c}/json/`)
        .then((r) => r.json())
        .then((d) => {
          if (!d?.erro) {
            if (!district && d.bairro) setDistrict(d.bairro);
          }
        })
        .catch(() => {});
    }
  }, [zip]);
  const formatCEP = (v: string = "") => (v || "").replace(/\D/g, "").slice(0,8).replace(/(\d{5})(\d)/, "$1-$2");

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ city, phone, avatar_url: avatarUrl })
        .eq("id", profile.id);
      if (error) throw error;
      setProfile({ ...profile, city, phone });
      toast.success("Perfil atualizado");
      setEditing(false);
    } catch (e) {
      console.error("Erro ao salvar perfil:", e);
      toast.error("Não foi possível salvar");
    }
  };

  const levelFromScore = (score: number) => {
    if (score >= 80) return "gold";
    if (score >= 60) return "silver";
    if (score >= 40) return "bronze";
    return "visitor";
  };

  const awardPoints = async (delta: number) => {
    try {
      const newScore = Math.min(100, (profile?.resident_score || 0) + delta);
      const newLevel = levelFromScore(newScore);
      await supabase.from("profiles").update({ resident_score: newScore, resident_level: newLevel }).eq("id", profile.id);
      setProfile({ ...profile, resident_score: newScore, resident_level: newLevel });
    } catch (e) {
      console.error("Falha ao conceder pontos", e);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "gold": return "bg-gold/10 text-gold border-gold/20";
      case "silver": return "bg-silver/10 text-silver border-silver/20";
      case "bronze": return "bg-bronze/10 text-bronze border-bronze/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getLevelName = (level: string) => {
    switch (level) {
      case "gold": return "Premium";
      case "silver": return "Prata";
      case "bronze": return "Bronze";
      default: return "Visitante";
    }
  };

  const getLevelDiscount = (level: string) => {
    switch (level) {
      case "gold": return "15%";
      case "silver": return "10%";
      case "bronze": return "5%";
      default: return "0%";
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden input for quick upload in Próximos passos */}
      <input className="hidden" ref={proofInputRef} type="file" accept="image/*,application/pdf" onChange={(e) => uploadProof(e.target.files?.[0])} />
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold">Resi</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Card */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">{profile?.full_name}</h2>
              <p className="text-muted-foreground">{formatPhoneBRIntl(profile?.phone) || "Telefone não cadastrado"}</p>
              <p className="text-sm text-primary font-semibold mt-1">
                Desconto ativo: {getLevelDiscount(profile?.resident_level)} em serviços
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getLevelColor(profile?.resident_level)}>
                <Award className="w-4 h-4 mr-1" />
                {getLevelName(profile?.resident_level)} - {getLevelDiscount(profile?.resident_level)} OFF
              </Badge>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Editar</Button>
              ) : (
                <>
                  <Button size="sm" onClick={handleSaveProfile}>Salvar</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setCity(profile?.city || ""); setPhone(profile?.phone || ""); }}>Cancelar</Button>
                </>
              )}
            </div>
          </div>

          {/* Score Progress */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ResidentScore</span>
              <span className="font-semibold">{profile?.resident_score}/100</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${profile?.resident_score}%` }}
              />
            </div>
          </div>

          {/* Info Grid */}
          {!editing ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Tempo na região</p>
                <p className="font-semibold">{profile?.months_in_region || 0} meses</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Cidade</p>
                <p className="font-semibold">{profile?.city || "Não informado"}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex.: Itajaí" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(formatPhoneBRIntl(e.target.value))} placeholder="+55 (11) 11 11111-1111" />
              </div>

              <div className="space-y-2">
                <Label>Foto de perfil</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback>{profile?.full_name?.[0] || 'R'}</AvatarFallback>
                  </Avatar>
                  <Input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const path = `avatars/${profile.id}.png`;
                      const { data, error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
                      if (error) throw error;
                      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
                      setAvatarUrl(pub.publicUrl);
                      toast.success('Avatar atualizado');
                    } catch (err) {
                      console.error(err);
                      toast.error('Falha ao enviar avatar (verifique bucket avatars)');
                    }
                  }} />
                </div>
              </div>

              {/* Upload de comprovante movido para "Próximos passos" */}

              {/* Localização removida desta área; fica apenas em Próximos passos */}

              <div className="space-y-2">
                <Label>Meu QR Code de morador</Label>
                <div className="flex items-center gap-3">
                  <Button type="button" onClick={() => setQrVisible((v) => !v)}>
                    {qrVisible ? 'Ocultar QR' : 'Gerar QR'}
                  </Button>
                </div>
                {qrVisible && (
                  <img src={qrBadge} alt="QR Code de morador" className="h-40 w-40 rounded border border-border" />
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Address Card */}
        <Card id="address-card" className="p-6 mb-8">
          <h3 className="font-semibold mb-4">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-3">
              <Label htmlFor="street">Rua/Avenida</Label>
              <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Ex.: Av. Brasil" />
            </div>
            <div>
              <Label htmlFor="number">Número</Label>
              <Input id="number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="123" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="district">Bairro</Label>
              <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Centro" />
            </div>
            <div>
              <Label htmlFor="zip">CEP</Label>
              <Input id="zip" value={zip} onChange={(e) => setZip(formatCEP(e.target.value))} placeholder="00000-000" />
            </div>
            <div className="md:col-span-5">
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto, bloco, ponto de referência" />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={async () => {
              const payload: { [key: string]: string | null } = {
                address_street: street || null,
                address_number: number || null,
                address_district: district || null,
                address_zip: zip || null,
                address_complement: complement || null,
                city: city || null,
              };
              try {
                const { error } = await supabase.from('profiles').update(payload).eq('id', profile.id);
                if (error) throw error;
                setProfile({ ...profile, ...payload });
                toast.success('Endereço salvo');
              } catch (e) {
                // Fallback: salva em campo único 'address' quando as colunas específicas não existem
                try {
                  const line = [street, number && `nº ${number}`, district, city, zip && `CEP ${zip}`, complement]
                    .filter(Boolean)
                    .join(', ');
                  const { error: e2 } = await supabase.from('profiles').update({ address: line || null, city: city || null }).eq('id', profile.id);
                  if (e2) throw e2;
                  setProfile({ ...profile, address: line, city });
                  toast.success('Endereço salvo');
                } catch (e3) {
                  console.error('Falha ao salvar endereço:', e3);
                  toast.error('Falha ao salvar endereço');
                }
              }
            }}>Salvar endereço</Button>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid gap-4">
          <Button 
            size="lg" 
            className="w-full justify-start h-auto p-6"
            onClick={() => navigate("/find-providers")}
            variant="outline"
          >
            <Search className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-lg mb-1">Buscar Prestadores</div>
              <div className="text-sm opacity-90">Encontre profissionais qualificados</div>
            </div>
          </Button>

          <Button 
            size="lg" 
            className="w-full justify-start h-auto p-6"
            onClick={() => navigate("/request-maintenance")}
          >
            <Camera className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold text-lg mb-1">Solicitar Manutenção</div>
              <div className="text-sm opacity-90">Tire foto e descreva o problema</div>
            </div>
          </Button>

          {/* Serviços e Contato */}
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Serviços e contato</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => navigate('/feed')}>Explorar serviços</Button>
              <Button variant="outline" asChild>
                <a href="mailto:contato@resi.app?subject=Ajuda%20com%20servi%C3%A7os%20Resi">Falar com suporte</a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Precisa de ajuda? Entre em contato para dúvidas sobre prestadores ou descontos.</p>
          </Card>

          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold mb-4">Próximos passos para subir de nível</h3>
            <ul className="space-y-3 text-sm">
              {!(profile?.address_street || profile?.address) && (
                <li className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    <span>Preencha e salve seu endereço</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => { const el = document.getElementById('address-card'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Abrir</Button>
                </li>
              )}
              {!proofUrl && (
                <li className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    <span>Envie comprovante de endereço (+50 pontos)</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate('/proof')}>
                    Enviar agora
                  </Button>
                </li>
              )}
              {!locationEnabled && (
                <li className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    <span>Ative verificação de localização (+20 pontos)</span>
                  </div>
                  <Button size="sm" onClick={() => setShowLocGate(true)}>Ativar</Button>
                </li>
              )}
              {profile?.resident_level === "bronze" && (
                <>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-silver mt-1.5" />
                    <span>Permaneça na região por 3+ meses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-silver mt-1.5" />
                    <span>Complete perfil para alcançar 60+ pontos</span>
                  </li>
                </>
              )}
              {profile?.resident_level === "silver" && (
                <>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5" />
                    <span>Permaneça na região por 6+ meses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5" />
                    <span>Alcance 80+ pontos no ResidentScore para Premium (15% OFF)</span>
                  </li>
                </>
              )}
              {profile?.resident_level === "gold" && (
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5" />
                  <span>Você está no nível Premium! 15% de desconto 🎉</span>
                </li>
              )}
            </ul>
          </Card>
        </div>
        {showLocGate && (
          <div className="mt-4">
            <LocationGate onReady={async (c) => {
              setLocationEnabled(true)
              setShowLocGate(false)
              try {
                await supabase.from('profiles').update({ lat: c.lat, lng: c.lng, location_enabled: true }).eq('id', profile.id)
                setProfile({ ...profile, location_enabled: true })
                toast.success('Localização ativada')
                if (!profile?.location_enabled) {
                  await awardPoints(20)
                }
              } catch {
                toast.error('Falha ao salvar localização')
              }
            }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
