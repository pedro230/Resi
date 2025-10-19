import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setLoggedIn(!!s?.user));
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary">
            Resi
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/find-providers")}
          >
            Buscar Prestadores
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/feed")}
          >
            Explorar
          </Button>
          <Button variant="ghost" onClick={() => navigate("/partners")}>Parceiros</Button>
          {loggedIn && (
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              Meu Painel
            </Button>
          )}
          <Button
            onClick={() => navigate("/auth")}
          >
            Entrar
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
