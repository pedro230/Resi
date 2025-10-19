import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, TrendingDown, BarChart3, Shield, Clock, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

const benefits = [
  {
    icon: TrendingDown,
    title: "Redução de custos",
    description: "Prestadores locais com preços competitivos. Economize até 30% vs. chamados emergenciais.",
    color: "text-primary"
  },
  {
    icon: Clock,
    title: "Agilidade no atendimento",
    description: "Sistema automatizado conecta prestadores mais próximos. Tempo médio de resposta: 2-4h.",
    color: "text-secondary"
  },
  {
    icon: Shield,
    title: "Aprovação prévia",
    description: "Valide cada solicitação antes do atendimento. Evite custos com pedidos desnecessários.",
    color: "text-accent"
  },
  {
    icon: BarChart3,
    title: "Dados e relatórios",
    description: "Dashboard com histórico de manutenções por imóvel. Identifique padrões e otimize custos.",
    color: "text-gold"
  }
];

const pricingPlans = [
  {
    name: "Essencial",
    price: "R$ 499",
    period: "/mês",
    properties: "Até 20 imóveis",
    features: [
      "Dashboard de aprovações",
      "Relatórios mensais",
      "5% take rate",
      "Suporte por e-mail"
    ]
  },
  {
    name: "Profissional",
    price: "R$ 999",
    period: "/mês",
    properties: "Até 50 imóveis",
    features: [
      "Tudo do Essencial",
      "Aprovação automática (IA)",
      "3% take rate",
      "Suporte prioritário",
      "API de integração"
    ],
    featured: true
  },
  {
    name: "Enterprise",
    price: "R$ 1.999",
    period: "/mês",
    properties: "50+ imóveis",
    features: [
      "Tudo do Profissional",
      "2% take rate",
      "Gerente de conta dedicado",
      "Integração com CRM",
      "SLA garantido"
    ]
  }
];

const ForRealEstate = () => {
  const navigate = useNavigate();
  return (
    <section id="planos" className="py-24 bg-muted/30 scroll-mt-24 md:scroll-mt-32">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-6 border border-primary/20">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Para imobiliárias</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Gestão inteligente de{" "}
            <span className="gradient-hero bg-clip-text text-transparent">
              manutenções
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Reduza custos, aumente satisfação dos inquilinos e tenha controle total 
            sobre as manutenções dos seus imóveis.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-glow transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`p-3 rounded-xl bg-muted w-fit mb-4 ${benefit.color}`}>
                <benefit.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </Card>
          ))}
        </div>

        {/* Pricing */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-12">Planos para imobiliárias</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`p-8 relative animate-slide-up ${
                  plan.featured ? 'border-primary border-2 shadow-glow' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Mais popular
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.properties}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${plan.featured ? '' : 'variant-outline'}`}
                  variant={plan.featured ? 'default' : 'outline'}
                  onClick={() => {
                    const amount = plan.price.replace(/\D/g, "");
                    const params = new URLSearchParams({ plan: plan.name, amount });
                    navigate(`/payment?${params.toString()}`);
                  }}
                >
                  Contratar plano
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <Card className="p-8 max-w-4xl mx-auto bg-gradient-card border-2">
          <h3 className="text-2xl font-bold text-center mb-8">Resultados comprovados</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">30%</div>
              <div className="text-sm text-muted-foreground">Redução de custos de manutenção</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">2-4h</div>
              <div className="text-sm text-muted-foreground">Tempo médio de atendimento</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Satisfação dos inquilinos</div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            className="shadow-glow"
            onClick={() => {
              const subject = "Agendar demonstração - Resi";
              const body = [
                "Olá, gostaria de agendar uma demonstração do Resi.",
                "",
                "Empresa:",
                "Contato:",
                "Melhor data/horário:",
              ].join("%0D%0A");
              window.location.href = `mailto:contato@resi.app?subject=${encodeURIComponent(subject)}&body=${body}`;
            }}
            aria-label="Agendar demonstração"
          >
            <Building2 className="mr-2 w-5 h-5" />
            Agendar demonstração
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Teste grátis por 30 dias • Sem cartão de crédito
          </p>
        </div>
      </div>
    </section>
  );
};

export default ForRealEstate;
