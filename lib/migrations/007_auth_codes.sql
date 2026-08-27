-- Migration 007: Auth Codes for Email Code Login and Password Reset
CREATE TABLE IF NOT EXISTS public.auth_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  type VARCHAR(32) NOT NULL, -- 'login_code' | 'reset_password'
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_codes_lookup ON public.auth_codes(email, code, type, used);
CREATE INDEX IF NOT EXISTS idx_auth_codes_expires ON public.auth_codes(expires_at);
