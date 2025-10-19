import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Building2, Search, Bell, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type RequestItem = {
  id: string;
  created_at?: string;
  name: string;
  phone?: string;
  city?: string;
  service: string;
  description?: string;
  status: "novo" | "em_andamento" | "concluido" | "rejeitado";
  read?: boolean;
};

type NotificationItem = {
  id: string;
  created_at?: string;
  title: string;
  body?: string;
  read?: boolean;
};

const mockRequests: RequestItem[] = [
  { id: "r1", name: "Pedro L.", city: "Itajaí", service: "Hidráulica", description: "Torneira vazando no apto 302.", status: "novo" },
  { id: "r2", name: "Ana C.", city: "Baln. Camboriú", service: "Elétrica", description: "Tomada sem energia.", status: "em_andamento" },
  { id: "r3", name: "Ricardo S.", city: "Itajaí", service: "Pintura", description: "Retoque sala.", status: "concluido" },
];

const RealEstate = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
    const channel = supabase
      .channel("requests-list")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "requests" }, (payload: { new: Partial<RequestItem> }) => {
        const r = payload.new as RequestItem;
        setRequests((prev) => [{ ...r, status: (r.status as RequestItem["status"]) || "novo" }, ...prev]);
        pushNotification({
          title: "Novo pedido",
          body: `${r.name} solicitou ${r.service}`,
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadData() {
    try {
      const { data, error } = await supabase.from("requests").select("*").order("created_at", { ascending: false });
      if (error || !data) throw error;
      setRequests(Array.isArray(data) ? (data as RequestItem[]) : []);
    } catch {
      setRequests(mockRequests);
    }
    try {
      const { data: ndata } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
      if (ndata) setNotifications(Array.isArray(ndata) ? (ndata as NotificationItem[]) : []);
    } catch {
      // ignore
    }
  }

  function pushNotification(n: { title: string; body?: string }) {
    const item: NotificationItem = { id: `n${Date.now()}`, title: n.title, body: n.body, read: false, created_at: new Date().toISOString() };
    setNotifications((prev) => [item, ...prev]);
  }

  async function updateStatus(id: string, status: RequestItem["status"]) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try { await supabase.from("requests").update({ status }).eq("id", id); } catch (e) { /* ignore realtime update error */ }
    toast.success("Status atualizado");
  }

  function markRead(id: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, read: true } : r)));
  }

  const filtered = useMemo(() => {
    return requests.filter((r) => (filterStatus === "todos" || r.status === filterStatus) && (r.name.toLowerCase().includes(search.toLowerCase()) || r.service.toLowerCase().includes(search.toLowerCase())));
  }, [requests, filterStatus, search]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground"><Building2 className="w-5 h-5" /></div>
            <h1 className="text-2xl font-bold">Painel da Imobiliária</h1>
          </div>
          <Button variant={unreadCount ? "default" : "outline"} className="relative">
            <MessageSquare className="w-4 h-4 mr-2" /> Caixa de mensagens
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </Button>
        </div>

        <Tabs defaultValue="pedidos">
          <TabsList>
            <TabsTrigger value="pedidos"><Search className="w-4 h-4 mr-1" /> Pedidos</TabsTrigger>
            <TabsTrigger value="mensagens"><MessageSquare className="w-4 h-4 mr-1" /> Mensagens</TabsTrigger>
            <TabsTrigger value="avisos"><Bell className="w-4 h-4 mr-1" /> Avisos</TabsTrigger>
          </TabsList>

          <TabsContent value="pedidos" className="mt-4">
            <Card className="p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <Label>Buscar</Label>
                  <Input placeholder="Nome ou serviço" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="novo">Novos</SelectItem>
                      <SelectItem value="em_andamento">Em andamento</SelectItem>
                      <SelectItem value="concluido">Concluídos</SelectItem>
                      <SelectItem value="rejeitado">Rejeitados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => (
                <Card key={r.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{r.name}</div>
                    {!r.read && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">novo</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">{r.city || "Cidade"} • {r.service}</div>
                  {r.description && <div className="text-sm">{r.description}</div>}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => { markRead(r.id); updateStatus(r.id, "em_andamento"); }}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Aceitar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { markRead(r.id); updateStatus(r.id, "rejeitado"); }}>
                      <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                    </Button>
                  </div>
                </Card>
              ))}
              {filtered.length === 0 && (
                <Card className="p-6 text-center text-muted-foreground">Nenhum pedido encontrado.</Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mensagens" className="mt-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">As mensagens trocadas com moradores e prestadores aparecerão aqui (em breve).</div>
            </Card>
          </TabsContent>

          <TabsContent value="avisos" className="mt-4">
            <div className="grid gap-3">
              {notifications.map((n) => (
                <Card key={n.id} className="p-4">
                  <div className="font-semibold">{n.title}</div>
                  {n.body && <div className="text-sm text-muted-foreground">{n.body}</div>}
                </Card>
              ))}
              {notifications.length === 0 && (
                <Card className="p-6 text-center text-muted-foreground">Sem avisos.</Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default RealEstate;

