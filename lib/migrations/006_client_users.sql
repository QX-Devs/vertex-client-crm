CREATE TABLE IF NOT EXISTS public.client_users (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(100) NOT NULL REFERENCES public.clients(client_id),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'owner',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_users_client_id ON public.client_users(client_id);
CREATE INDEX IF NOT EXISTS idx_client_users_email ON public.client_users(email);
