import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Crown } from "lucide-react";

const levels = [
  {
    icon: Award,
    name: "Bronze",
    score: "40-59 pontos",
    discount: "5%",
    benefits: ["5% de desconto médio", "Acesso básico a ofertas", "Comprovante de endereço válido", "Solicitação de manutenção básica"],
    color: "bronze",
    gradient: "from-bronze/20 to-bronze/5"
  },
  {
    icon: Star,
    name: "Prata",
    score: "60-79 pontos",
    discount: "10%",
    benefits: ["10% de desconto médio", "Ofertas prioritárias", "Georresidência validada (3+ meses)", "Manutenção em até 4h"],
    color: "silver",
    gradient: "from-silver/20 to-silver/5"
  },
  {
    icon: Crown,
    name: "Premium",
    score: "80+ pontos",
    discount: "15%",
    benefits: ["15% de desconto premium", "Filas prioritárias", "Eventos exclusivos", "Morador 6+ meses verificado", "Manutenção em até 2h"],
    color: "gold",
    gradient: "from-gold/30 to-gold/5",
    featured: true
  }
];

const Levels = () => {
  return (
    <section id="niveis" className="py-24 bg-background scroll-mt-24 md:scroll-mt-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Níveis de morador
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Quanto mais você comprova, mais benefícios você conquista
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {levels.map((level, index) => (
            <Card 
              key={index}
              className={`p-8 relative overflow-hidden animate-slide-up ${
                level.featured ? 'border-gold border-2 shadow-glow' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {level.featured && (
                <Badge className="absolute top-4 right-4 bg-gold text-foreground">
                  Mais popular
                </Badge>
              )}
              
              <div className={`absolute inset-0 bg-gradient-to-br ${level.gradient} -z-10`} />
              
              <div className={`p-4 rounded-2xl bg-${level.color}/10 w-fit mb-6`}>
                <level.icon className={`w-8 h-8 text-${level.color}`} />
              </div>
              
              <h3 className="text-2xl font-bold mb-2">{level.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{level.score}</p>
              <div className={`text-3xl font-bold text-${level.color} mb-6`}>
                {level.discount} OFF
              </div>
              
              <ul className="space-y-3">
                {level.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <div className={`w-1.5 h-1.5 rounded-full bg-${level.color} mt-1.5 flex-shrink-0`} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Levels;
