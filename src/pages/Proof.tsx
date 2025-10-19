import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Proof = () => {
  const [type, setType] = useState<string>("agua");
  const [fileName, setFileName] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const t = searchParams.get("type");
    if (t) setType(t);
  }, [searchParams]);

  const upload = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    try {
      const min = 50 * 1024;
      if (file.size < min) { toast.error("Arquivo muito pequeno"); setLoading(false); return; }
      const isImage = file.type.startsWith("image/");
      if (isImage) {
        const tmp = URL.createObjectURL(file);
        const img = new Image();
        img.onload = async () => {
          if (img.width < 600 || img.height < 600) {
            toast.error("Resolução mínima 600x600"); URL.revokeObjectURL(tmp); setLoading(false); return;
          }
          await doUpload(file);
          URL.revokeObjectURL(tmp);
        };
        img.onerror = () => { toast.error("Falha ao ler imagem"); URL.revokeObjectURL(tmp); setLoading(false); };
        img.src = tmp;
      } else {
        await doUpload(file);
      }
    } catch (e) {
      console.error(e); toast.error("Falha no envio"); setLoading(false);
    }
  };

  const doUpload = async (file: File) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { toast.error("Faça login"); setLoading(false); return; }
      const path = `proofs/${auth.user.id}-${Date.now()}-${type}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('proofs').upload(path, file);
      if (error) throw error;
      const { data: pub } = supabase.storage.from('proofs').getPublicUrl(path);
      setUrl(pub.publicUrl);
      setFileName(file.name);
      await supabase.from('profiles').update({ proof_type: type, proof_url: pub.publicUrl }).eq('id', auth.user.id);
      toast.success("Comprovante enviado");
    } catch (e) {
      console.error(e); toast.error("Falha ao enviar comprovante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Enviar comprovante de endereço</h1>
          <p className="text-muted-foreground mb-6">Selecione o tipo e envie uma foto (≥600x600) ou PDF (≥50KB).</p>

          <Card className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agua">Conta de água</SelectItem>
                    <SelectItem value="luz">Conta de luz</SelectItem>
                    <SelectItem value="iptu">IPTU</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) { setLoading(true); doUpload(f); } }}
                />
              </div>
            </div>

            {url && (
              <div className="text-sm">
                Enviado: <a className="text-primary" href={url} target="_blank" rel="noreferrer">{fileName || 'arquivo'}</a>
                <div className="text-xs text-muted-foreground">Status: em análise</div>
              </div>
            )}

            <div className="flex gap-3">
              <Button disabled>{loading ? 'Enviando...' : 'Salvar'}</Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default Proof
