-- ============================================
-- MORADOR+ SISTEMA DE MANUTENÇÃO DOMÉSTICA
-- ============================================

-- 1. Criar enum para níveis de morador
CREATE TYPE public.resident_level AS ENUM ('bronze', 'silver', 'gold', 'visitor');

-- 2. Criar enum para status de manutenção
CREATE TYPE public.maintenance_status AS ENUM ('pending_approval', 'approved', 'in_progress', 'completed', 'rejected', 'cancelled');

-- 3. Criar enum para categorias de serviço
CREATE TYPE public.service_category AS ENUM ('electrical', 'plumbing', 'appliances', 'cleaning', 'general');

-- 4. Tabela de perfis de usuários (moradores)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  resident_score INTEGER DEFAULT 0 CHECK (resident_score >= 0 AND resident_score <= 100),
  resident_level public.resident_level DEFAULT 'visitor',
  address TEXT,
  city TEXT,
  verified_at TIMESTAMPTZ,
  months_in_region INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de imobiliárias
CREATE TABLE public.real_estate_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  plan_type TEXT DEFAULT 'essential' CHECK (plan_type IN ('essential', 'professional', 'enterprise')),
  max_properties INTEGER DEFAULT 20,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de imóveis gerenciados
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  real_estate_id UUID NOT NULL REFERENCES public.real_estate_companies(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  property_code TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela de prestadores de serviço
CREATE TABLE public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cpf_cnpj TEXT UNIQUE,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  categories public.service_category[] DEFAULT ARRAY[]::public.service_category[],
  city TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_jobs INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela principal de solicitações de manutenção
CREATE TABLE public.maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  real_estate_id UUID NOT NULL REFERENCES public.real_estate_companies(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.service_providers(id) ON DELETE SET NULL,
  
  category public.service_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  
  status public.maintenance_status DEFAULT 'pending_approval',
  priority INTEGER DEFAULT 2 CHECK (priority >= 1 AND priority <= 3), -- 1=high, 2=medium, 3=low
  
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  
  rejection_reason TEXT,
  completion_notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  estimated_response_hours INTEGER,
  actual_response_hours INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies para profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 11. RLS Policies para maintenance_requests
CREATE POLICY "Tenants can view own requests"
  ON public.maintenance_requests FOR SELECT
  USING (auth.uid() = tenant_id);

CREATE POLICY "Tenants can create requests"
  ON public.maintenance_requests FOR INSERT
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Tenants can update own pending requests"
  ON public.maintenance_requests FOR UPDATE
  USING (auth.uid() = tenant_id AND status = 'pending_approval');

-- 12. RLS Policies para properties (inquilinos veem apenas seu imóvel)
CREATE POLICY "Tenants can view own property"
  ON public.properties FOR SELECT
  USING (auth.uid() = tenant_id);

-- 13. RLS Policy para service_providers (público para busca)
CREATE POLICY "Anyone can view active providers"
  ON public.service_providers FOR SELECT
  USING (active = true);

-- 14. Criar bucket de storage para fotos de manutenção
INSERT INTO storage.buckets (id, name, public)
VALUES ('maintenance-photos', 'maintenance-photos', false);

-- 15. Storage RLS policies
CREATE POLICY "Users can upload own maintenance photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'maintenance-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own maintenance photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'maintenance-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own maintenance photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'maintenance-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 16. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at
  BEFORE UPDATE ON public.maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 17. Função para calcular prioridade baseada no nível do morador
CREATE OR REPLACE FUNCTION public.calculate_priority_by_level(level public.resident_level)
RETURNS INTEGER AS $$
BEGIN
  CASE level
    WHEN 'gold' THEN RETURN 1;    -- 2h response
    WHEN 'silver' THEN RETURN 2;  -- 4h response
    WHEN 'bronze' THEN RETURN 3;  -- 24h response
    ELSE RETURN 3;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 18. Função para atualizar resident_level baseado no score
CREATE OR REPLACE FUNCTION public.update_resident_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.resident_score >= 80 AND NEW.months_in_region >= 6 THEN
    NEW.resident_level := 'gold';
  ELSIF NEW.resident_score >= 60 AND NEW.months_in_region >= 3 THEN
    NEW.resident_level := 'silver';
  ELSIF NEW.resident_score >= 40 THEN
    NEW.resident_level := 'bronze';
  ELSE
    NEW.resident_level := 'visitor';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_level_on_score_change
  BEFORE INSERT OR UPDATE OF resident_score, months_in_region ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_resident_level();

-- 19. Índices para performance
CREATE INDEX idx_maintenance_requests_tenant ON public.maintenance_requests(tenant_id);
CREATE INDEX idx_maintenance_requests_status ON public.maintenance_requests(status);
CREATE INDEX idx_maintenance_requests_real_estate ON public.maintenance_requests(real_estate_id);
CREATE INDEX idx_properties_tenant ON public.properties(tenant_id);
CREATE INDEX idx_service_providers_city ON public.service_providers(city);
CREATE INDEX idx_profiles_level ON public.profiles(resident_level);