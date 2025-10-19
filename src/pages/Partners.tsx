import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import qrBadge from "@/assets/qr-badge.png";
import { toast } from "sonner";

const formatCNPJ = (value: string) => {
  const v = (value || "").replace(/\D/g, "").slice(0, 14);
  return v
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{2}\.\d{3})(\d)/, "$1.$2")
    .replace(/(\d{2}\.\d{3}\.\d{3})(\d)/, "$1/$2")
    .replace(/(\d{2}\.\d{3}\.\d{3}\/\d{4})(\d)/, "$1-$2");
};

const validateCNPJ = (value: string) => {
  const c = (value || "").replace(/\D/g, "");
  if (c.length !== 14 || /(\d)\1{13}/.test(c)) return false;
  const calc = (base: string) => {
    const size = base.length; let sum = 0; let pos = size - 7;
    for (let i = size; i >= 1; i--) { sum += parseInt(base[size - i]) * pos--; if (pos < 2) pos = 9; }
    const res = sum % 11 < 2 ? 0 : 11 - (sum % 11); return res;
  };
  const d1 = calc(c.substring(0, 12));
  const d2 = calc(c.substring(0, 12) + String(d1));
  return c.endsWith(String(d1) + String(d2));
};

const formatExpiry = (v: string) => {
  const d = (v || "").replace(/\D/g, "").slice(0, 4);
  const mm = d.slice(0, 2); const yy = d.slice(2, 4);
  return yy ? `${mm}/${yy}` : mm;
};

const isValidExpiry = (v: string) => {
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m) return false;
  const mm = parseInt(m[1], 10);
  return mm >= 1 && mm <= 12;
};

const luhn = (num: string) => {
  const s = (num || "").replace(/\D/g, "");
  let sum = 0, dbl = false;
  for (let i = s.length - 1; i >= 0; i--) { let n = parseInt(s[i]); if (dbl) { n *= 2; if (n > 9) n -= 9; } sum += n; dbl = !dbl; }
  return s.length >= 12 && sum % 10 === 0;
};

const Partners = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<string>("pix");
  const [amount, setAmount] = useState<string>("");
  const [generated, setGenerated] = useState<boolean>(false);
  const [planName, setPlanName] = useState<string>("");
  const [searchParams] = useSearchParams();
  const [baseAmount, setBaseAmount] = useState<string>("");
  const [cnpj, setCnpj] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [ccNumber, setCcNumber] = useState<string>("");
  const [ccName, setCcName] = useState<string>("");
  const [ccExp, setCcExp] = useState<string>("");
  const [ccCvv, setCcCvv] = useState<string>("");
  const [pixCode, setPixCode] = useState<string>("");
  const [txId, setTxId] = useState<string>("");

  useEffect(() => {
    const a = searchParams.get("amount") || "";
    const p = searchParams.get("plan") || "";
    if (a) { setAmount(a); setBaseAmount(a); }
    if (p) setPlanName(p);
  }, [searchParams]);

  const handleGenerate = () => {
    setGenerated(true);
    if (method === "pix") {
      const tx = `TX${Date.now()}`;
      const valor = Number((amount || "0").replace(/\D/g, "")) / 100;
      const code = buildPixPayload({
        chave: "pix-chave@exemplo.com",
        nome: company || "Resi Pagamentos",
        cidade: "ITAJAI",
        valor: valor.toFixed(2),
        txid: tx.slice(0,25)
      });
      setPixCode(code);
      setTxId(tx);
    }
  };

  const saveTransaction = async (status: string, details: Record<string, unknown> = {}) => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id || null;
      const payload: {
        user_id: string | null;
        plan: string;
        method: string;
        amount: number;
        status: string;
        metadata: Record<string, unknown>;
        created_at: string;
      } = {
        user_id: userId,
        plan: planName,
        method,
        amount: Number((amount || "0").replace(/\D/g, "")) / 100,
        status,
        metadata: details,
        created_at: new Date().toISOString(),
      };
      await supabase.from("transactions").insert(payload);
    } catch (e) {
      console.error("Erro ao salvar transação:", e);
    }
  };

  function buildPixPayload({ chave, nome, cidade, valor, txid }:{ chave:string; nome:string; cidade:string; valor:string; txid:string }){
    const f = (id:string, v:string) => `${id}${(v.length).toString().padStart(2,'0')}${v}`;
    const merchantAcctInfo = f("00","BR.GOV.BCB.PIX") + f("01", chave);
    const gui = f("26", merchantAcctInfo);
    const merchant = f("00","BR") + f("01", nome) + f("02", cidade);
    const tx = f("05", txid);
    const additional = f("62", tx);
    const amountField = f("54", valor);
    const payloadNoCRC = f("00","01") + f("01","12") + gui + merchant + amountField + f("53","986") + additional + "6304";
    const crc = crc16(payloadNoCRC).toUpperCase();
    return payloadNoCRC + crc;
  }

  function crc16(str:string){
    let crc = 0xFFFF;
    for (const c of str) {
      crc ^= c.charCodeAt(0) << 8;
      for (let i=0;i<8;i++) crc = (crc & 0x8000) ? (crc<<1) ^ 0x1021 : (crc<<1);
      crc &= 0xFFFF;
    }
    return crc.toString(16).padStart(4,'0');
  }

  const formatCardDots = (v: string) => {
    const d = (v || "").replace(/\D/g, "").slice(0,16);
    return d.replace(/(.{4})/g, "$1.").replace(/\.$/, "");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Pagamento Parceiro / Imobiliária</h1>
          <p className="text-muted-foreground mb-4">
            Informe seus dados para gerar um pagamento seguro para taxas, mensalidades ou repasses.
          </p>
          {planName && (
            <div className="mb-6 text-sm">
              <span className="font-semibold">Plano selecionado:</span> {planName}
            </div>
          )}

          <Card className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partnerId">CNPJ / Código do Parceiro</Label>
                <Input id="partnerId" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(formatCNPJ(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Razão Social / Nome</Label>
                <Input id="company" placeholder="Resi Imobiliária LTDA" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input id="amount" type="text" readOnly value={amount} className="bg-muted cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label>Método de Pagamento</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button size="lg" className="shadow-glow" onClick={handleGenerate}>
                Gerar pagamento de teste
              </Button>
              {generated && (
                <span className="text-sm text-muted-foreground">Pagamento gerado para R$ {amount || "0,00"}</span>
              )}
            </div>

            {generated && method === "pix" && (
              <div className="mt-2 p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border w-fit">
                <div className="font-semibold mb-2">Pague com PIX</div>
                <div className="flex items-center gap-4">
                  <img src={qrBadge} alt="QR Code PIX" className="h-40 w-40 rounded-md border border-border" />
                  <div className="text-sm text-muted-foreground max-w-xs">
                    Escaneie o QR ou copie o código PIX abaixo e pague no seu banco.
                    <div className="mt-2 p-2 rounded border text-xs break-all bg-card">{pixCode || 'Código PIX'}</div>
                    <Button size="sm" className="mt-2" variant="outline" onClick={async () => { navigator.clipboard.writeText(pixCode); toast.success('Código PIX copiado'); }}>Copiar código</Button>
                  </div>
                </div>
                <Button className="mt-4 w-full" onClick={async () => {
                  await saveTransaction('pix_generated', { txId, pixCode });
                  toast.success('PIX gerado');
                }}>Confirmar geração PIX</Button>
              </div>
            )}

            {generated && method === "boleto" && (
              <div className="mt-2 p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border">
                <div className="font-semibold mb-2">Boleto gerado</div>
                <div className="text-sm text-muted-foreground">
                  Link do boleto disponível após integração real. Este é um placeholder.
                </div>
              </div>
            )}

            {generated && method === "cartao" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cc-number">Número do cartão</Label>
                  <Input id="cc-number" placeholder="XXXX.XXXX.XXXX.XXXX" value={ccNumber} onChange={(e) => setCcNumber(formatCardDots(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cc-name">Nome impresso</Label>
                  <Input id="cc-name" placeholder="NOME COMPLETO" value={ccName} onChange={(e) => setCcName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cc-exp">Validade (MM/AA)</Label>
                  <Input id="cc-exp" placeholder="MM/AA" value={ccExp} onChange={(e) => setCcExp(formatExpiry(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cc-cvv">CVV</Label>
                  <Input id="cc-cvv" placeholder="000" value={ccCvv} onChange={(e) => setCcCvv(e.target.value.replace(/\D/g, "").slice(0,4))} />
                </div>
                <div className="md:col-span-2">
                  <Button className="w-full" onClick={async () => {
                    if (amount !== baseAmount) { toast.error('Valor inválido'); return; }
                    if (!validateCNPJ(cnpj)) { toast.error('CNPJ inválido'); return; }
                    if (!luhn(ccNumber)) { toast.error('Cartão inválido'); return; }
                    if (!isValidExpiry(ccExp)) { toast.error('Validade inválida'); return; }
                    if (ccCvv.length < 3) { toast.error('CVV inválido'); return; }
                    await saveTransaction('paid', { brand: 'simulado', last4: ccNumber.replace(/\\D/g,'').slice(-4) });
                    toast.success('Pagamento aprovado');
                    navigate(`/payment/success?plan=${encodeURIComponent(planName || '')}&amount=${amount}`);
                  }}>Pagar</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Partners;


