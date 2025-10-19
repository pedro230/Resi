import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const plan = params.get('plan') || 'Plano';
  const amount = params.get('amount') || '';
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="max-w-xl mx-auto">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Pagamento aprovado</h1>
            <p className="text-muted-foreground mb-6">{plan} • R$ {amount}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/dashboard')}>Ir para o painel</Button>
              <Button variant="outline" onClick={() => navigate('/')}>Voltar ao início</Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default PaymentSuccess;

