import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Camera, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const services = [
  { icon: "⚡", name: "Elétrica", color: "bg-yellow-500/10 text-yellow-600" },
  { icon: "🚰", name: "Hidráulica", color: "bg-blue-500/10 text-blue-600" },
  { icon: "📺", name: "Eletrodomésticos", color: "bg-purple-500/10 text-purple-600" },
  { icon: "🧹", name: "Limpeza", color: "bg-green-500/10 text-green-600" },
  { icon: "🔧", name: "Geral", color: "bg-orange-500/10 text-orange-600" },
];

const howItWorks = [
  {
    step: "1",
    icon: Camera,
    title: "Tire uma foto",
    description: "Fotografe o item com problema e descreva o que aconteceu"
  },
  {
    step: "2",
    icon: AlertCircle,
    title: "Imobiliária aprova",
    description: "Sua solicitação é validada pela imobiliária responsável"
  },
  {
    step: "3",
    icon: Wrench,
    title: "Prestador atende",
    description: "Profissional mais próximo é acionado automaticamente"
  },
  {
    step: "4",
    icon: CheckCircle2,
    title: "Problema resolvido",
    description: "Acompanhe status e avalie o serviço no app"
  }
];

const Maintenance = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 mb-6 border border-secondary/20">
            <Wrench className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Novo: Manutenção Doméstica</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Conserto rápido,{" "}
            <span className="gradient-hero bg-clip-text text-transparent">
              direto no app
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Problemas em casa? Solicite manutenção profissional em segundos. 
            Sem burocracia, com aprovação da sua imobiliária.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16 max-w-4xl mx-auto">
          {services.map((service, index) => (
            <Card
              key={index}
              className={`p-6 text-center hover:shadow-glow transition-all duration-300 animate-slide-up cursor-pointer ${service.color}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="text-4xl mb-2">{service.icon}</div>
              <div className="text-sm font-semibold">{service.name}</div>
            </Card>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-12">Como funciona</h3>
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {howItWorks.map((item, index) => (
              <div
                key={index}
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                <h4 className="font-semibold mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Priority by level */}
        <Card className="p-8 max-w-4xl mx-auto bg-gradient-card border-2 animate-fade-in">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Atendimento prioritário por nível</h3>
            <p className="text-muted-foreground">Quanto maior seu ResidentScore, mais rápido o atendimento</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-gold/10 border border-gold/20">
              <div className="text-3xl font-bold text-gold mb-1">
                <Clock className="w-6 h-6 inline mr-2" />
                2h
              </div>
              <div className="text-sm font-semibold mb-1">Morador Ouro</div>
              <div className="text-xs text-muted-foreground">Resposta prioritária</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-silver/10 border border-silver/20">
              <div className="text-3xl font-bold text-silver mb-1">
                <Clock className="w-6 h-6 inline mr-2" />
                4h
              </div>
              <div className="text-sm font-semibold mb-1">Morador Prata</div>
              <div className="text-xs text-muted-foreground">Resposta rápida</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-bronze/10 border border-bronze/20">
              <div className="text-3xl font-bold text-bronze mb-1">
                <Clock className="w-6 h-6 inline mr-2" />
                24h
              </div>
              <div className="text-sm font-semibold mb-1">Morador Bronze</div>
              <div className="text-xs text-muted-foreground">Resposta padrão</div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button size="lg" className="shadow-glow" onClick={() => window.location.href = '/auth'}>
            <Camera className="mr-2 w-5 h-5" />
            Solicitar manutenção agora
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Disponível para moradores Bronze ou superior
          </p>
        </div>
      </div>
    </section>
  );
};

export default Maintenance;
