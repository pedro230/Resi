import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { MapPin, ArrowLeft } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"resident" | "partner">("resident");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        // Descobrir a role do perfil; se a coluna não existir, apenas redireciona pela seleção atual
        const { data: { user } } = await supabase.auth.getUser();
        let redirect: string = "/dashboard";
        if (user) {
          let currentRole: string | undefined = undefined;
          try {
            const { data: prof } = await supabase
              .from("profiles")
              .select("role, id")
              .eq("id", user.id)
              .single();
            currentRole = (prof as { role?: "resident" | "partner" } | null)?.role;
            if (!currentRole && role === "partner") {
              try { await supabase.from("profiles").update({ role: "partner" }).eq("id", user.id); } catch (e) { /* ignore role update failure */ }
            }
          } catch {
            // coluna 'role' pode não existir: seguir com a seleção atual
          }
          redirect = (currentRole || role) === "partner" ? "/real-estate" : "/dashboard";
        }
        toast.success("Login realizado com sucesso!");
        navigate(redirect);
      } else {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // tenta inserir com a coluna 'role'; se a coluna não existir, insere sem ela
          try {
            const { error: profileError } = await supabase.from("profiles").insert({
              id: authData.user.id,
              full_name: fullName,
              phone,
              resident_score: 0,
              resident_level: "visitor",
              role: role,
            });
            if (profileError) throw profileError;
          } catch {
            const { error: profileError2 } = await supabase.from("profiles").insert({
              id: authData.user.id,
              full_name: fullName,
              phone,
              resident_score: 0,
              resident_level: "visitor",
            });
            if (profileError2) throw profileError2;
          }
        }

        toast.success("Conta criada! Faça login para continuar.");
        setIsLogin(true);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao processar solicitação";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md p-8">
          <div className="mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/') } aria-label="Voltar para a página inicial">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Resi</span>
          </div>

        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "Bem-vindo de volta" : "Criar conta"}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <Label htmlFor="loginAs">Entrar como</Label>
            <Select value={role} onValueChange={(v: "resident" | "partner") => setRole(v)}>
              <SelectTrigger id="loginAs">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resident">Morador</SelectItem>
                <SelectItem value="partner">Parceiro (Imobiliária)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!isLogin && (
            <>
              <div>
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="João Silva"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processando..." : isLogin ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
