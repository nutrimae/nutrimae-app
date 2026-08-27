"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, createSessionValue, isValidPassword } from "@/lib/auth";

/**
 * Rate limit de login em memória: 5 tentativas por IP a cada 10 min.
 * Baseline para um painel de senha única — suficiente contra força bruta
 * casual; defesa em profundidade fica com a senha forte + cookie httpOnly.
 */
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const loginBuckets = new Map<string, { count: number; resetAt: number }>();

function isLoginLimited(ip: string): boolean {
  const bucket = loginBuckets.get(ip);
  return Boolean(bucket && bucket.resetAt > Date.now() && bucket.count >= LOGIN_MAX_ATTEMPTS);
}

function registerLoginFailure(ip: string): void {
  const now = Date.now();
  const bucket = loginBuckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    loginBuckets.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
  } else {
    bucket.count += 1;
  }
}

export async function login(formData: FormData) {
  const headerStore = await headers();
  const ip = (headerStore.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();

  if (isLoginLimited(ip)) {
    redirect("/login?erro=limite");
  }

  const candidate = String(formData.get("password") ?? "");
  if (!isValidPassword(candidate)) {
    registerLoginFailure(ip);
    // Pequeno atraso contra força bruta, sem vazar se a senha existe.
    await new Promise((resolve) => setTimeout(resolve, 500));
    redirect("/login?erro=1");
  }

  const sessionValue = createSessionValue();
  if (!sessionValue) {
    redirect("/login?erro=config");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
