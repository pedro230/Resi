import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Percent, Shield } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import qrBadge from "@/assets/qr-badge.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Cidade vibrante com comércios locais" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-2xl animate-fade-in">
          {/* Brand name as logo (no background) */}
          <div className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary mb-4">
            Resi
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-6 border border-primary/20">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Para moradores locais</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Vantagens exclusivas na{" "}
            <span className="gradient-hero bg-clip-text text-transparent">
              sua cidade
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Comprove que você é morador e desbloqueie descontos especiais em restaurantes, 
            atrações, eventos e muito mais. Economia local, benefícios reais.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" className="shadow-glow group" onClick={() => window.location.href = '/auth'}>
              Começar agora
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => {
              const el = document.getElementById('como-funciona');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.history.pushState(null, '', '#como-funciona');
              } else {
                window.location.href = '/#como-funciona';
              }
            }}>
              Como funciona
            </Button>
          </div>

          {/* QR code for discount */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border w-fit mb-12">
            <img
              src={qrBadge}
              alt="QR Code de desconto - mostre no estabelecimento"
              className="h-24 w-24 rounded-md border border-border"
            />
            <div>
              <div className="font-semibold">Seu desconto de morador</div>
              <div className="text-sm text-muted-foreground">
                Mostre este QR no estabelecimento participante para obter desconto.
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border">
              <div className="text-3xl font-bold text-primary mb-1">20+</div>
              <div className="text-sm text-muted-foreground">Parceiros</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border">
              <div className="text-3xl font-bold text-secondary mb-1">Até 15%</div>
              <div className="text-sm text-muted-foreground">de desconto sendo premium</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border">
              <div className="text-3xl font-bold text-accent mb-1">100%</div>
              <div className="text-sm text-muted-foreground">Seguro</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cards */}
      <div className="absolute right-10 top-1/4 hidden lg:block animate-slide-up">
        <div className="bg-card p-6 rounded-2xl shadow-card border border-border max-w-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Percent className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold">Restaurante Praia Sol</div>
              <div className="text-sm text-muted-foreground">20% OFF</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">Morador Ouro • Seg-Qui</div>
        </div>
      </div>

      <div className="absolute right-10 bottom-1/4 hidden lg:block animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <div className="bg-card p-6 rounded-2xl shadow-card border border-border max-w-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Shield className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="font-semibold">Verificação segura</div>
              <div className="text-sm text-muted-foreground">LGPD</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">Seus dados protegidos</div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
