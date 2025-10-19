-- Corrigir search_path nas funções para segurança

-- 1. Recriar função update_updated_at_column com search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2. Recriar função calculate_priority_by_level com search_path
CREATE OR REPLACE FUNCTION public.calculate_priority_by_level(level public.resident_level)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE level
    WHEN 'gold' THEN RETURN 1;
    WHEN 'silver' THEN RETURN 2;
    WHEN 'bronze' THEN RETURN 3;
    ELSE RETURN 3;
  END CASE;
END;
$$;

-- 3. Recriar função update_resident_level com search_path
CREATE OR REPLACE FUNCTION public.update_resident_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;