import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionValue } from "@/lib/auth";

/**
 * Guarda de autenticação ANTES do render (Next 16: "proxy" é o antigo
 * middleware, rodando em runtime Node.js — por isso pode usar o HMAC de
 * node:crypto de @/lib/auth). Cookie ausente/inválido → 307 pro login.
 * A página / mantém seu próprio requireAuth() como defesa em profundidade.
 */
export function proxy(request: NextRequest) {
  const sessionValue = request.cookies.get(SESSION_COOKIE)?.value;
  if (verifySessionValue(sessionValue)) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // Protege tudo, exceto: /login, assets do Next e arquivos com extensão (favicon etc.).
  matcher: ["/((?!login|_next/static|_next/image|.*\\..*).*)"],
};
