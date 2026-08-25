import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/auth/callback",
  "/auth/auth-code-error",
  // Convite/recuperação de senha chegam sem sessão nenhuma no cookie (o
  // token vem no #hash da URL, que o servidor nunca vê) — a sessão só é
  // capturada pelo SDK no navegador, depois que a página carrega. Sem
  // isso aqui, todo cliente novo (sem sessão anterior) era redirecionado
  // pro /login antes de o JS ter a chance de rodar, perdendo o token.
  "/auth/set-password",
  "/politica-privacidade",
  "/sos",
  "/manual-sos",
  "/oferta",
  "/acesso-pendente",
  // Funil de compra inteiro precisa ser público: quem está comprando ainda
  // não tem conta (a conta só é criada pelo webhook após confirmação de
  // pagamento — ver SECURITY_PURCHASE_ONLY.md). Sem isso aqui, todo
  // visitante anônimo era redirecionado pro /login antes de ver o
  // checkout, bloqueando qualquer venda nova.
  "/checkout",
  "/upsell",
  "/downsell",
  // O navegador busca o manifest (link declarado no <head> pelo layout raiz)
  // em QUALQUER página, inclusive antes de logar — sem isso aqui, quem nunca
  // entrou no app recebe o HTML de /login no lugar do JSON, e "Adicionar à
  // tela de início" nunca vira um app instalável de verdade.
  "/manifest.json",
];

function requiresPurchasedAccess(pathname: string) {
  return pathname === "/" || pathname.startsWith("/app") || pathname.startsWith("/onboarding");
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasPurchasedAccess = false;
  if (user && (requiresPurchasedAccess(pathname) || pathname === "/login")) {
    const [profileResult, purchaseResult] = await Promise.all([
      supabase.from("profiles").select("is_admin").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("user_products")
        .select("status")
        .eq("user_id", user.id)
        .eq("product_id", "nutrimae_assinatura")
        .maybeSingle(),
    ]);
    hasPurchasedAccess =
      !profileResult.error &&
      !purchaseResult.error &&
      (Boolean(profileResult.data?.is_admin) || purchaseResult.data?.status === "active");
  }

  if (!user && !isPublicPath(pathname) && pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && requiresPurchasedAccess(pathname) && !hasPurchasedAccess) {
    const url = request.nextUrl.clone();
    url.pathname = "/acesso-pendente";
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login" && hasPurchasedAccess) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
