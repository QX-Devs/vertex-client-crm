import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { TokenPayload } from './types';

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
};

export async function signClientToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecretKey());
}

export async function verifyClientToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  response.cookies.set({
    name: 'crm_client_token',
    value: token,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 86400,
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: 'crm_client_token',
    value: '',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
  });
  response.cookies.set({
    name: 'vertex_client_token',
    value: '',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
  });
  response.cookies.delete('crm_client_token');
  response.cookies.delete('vertex_client_token');
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const cookieToken = req.cookies.get('crm_client_token')?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

export async function requireClient(req: NextRequest): Promise<TokenPayload | NextResponse> {
  const token = getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const payload = await verifyClientToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  return payload;
}
