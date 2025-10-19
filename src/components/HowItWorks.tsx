import { Card } from "@/components/ui/card";
import { Upload, CheckCircle2, QrCode, Gift } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "1. Comprove residência",
    description: "Envie comprovante de endereço (luz/água) + localização por 6 meses para Ouro.",
    color: "text-primary"
  },
  {
    icon: CheckCircle2,
    title: "2. Receba seu nível",
    description: "Bronze (básico), Prata (3+ meses) ou Ouro (6+ meses verificado).",
    color: "text-gold"
  },
  {
    icon: QrCode,
    title: "3. Use seus benefícios",
    description: "QR para descontos + solicite manutenção doméstica via app.",
    color: "text-secondary"
  },
  {
    icon: Gift,
    title: "4. Atendimento prioritário",
    description: "Quanto maior seu nível, mais rápido o atendimento em manutenções.",
    color: "text-accent"
  }
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-24 bg-muted/30 scroll-mt-24 md:scroll-mt-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Como funciona?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Em 4 passos simples, você já está aproveitando vantagens exclusivas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-glow transition-shadow duration-300 animate-slide-up border-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`p-3 rounded-xl bg-muted w-fit mb-4 ${step.color}`}>
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
