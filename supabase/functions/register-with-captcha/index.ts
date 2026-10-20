import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { allowedHosts, validCaptcha, type CaptchaResult } from "./validation.ts";

const bodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128).regex(/[a-zA-Z]/).regex(/[0-9]/),
  phone: z.string().max(20).regex(/^[\d\s()+-]*$/).optional(),
  referralCode: z.string().max(10).regex(/^[A-Za-z0-9]*$/).optional(),
  captchaToken: z.string().min(1).max(4096),
}).strict();

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigin = [...allowedHosts].some((host) => origin === `https://${host}`) ||
    origin === "http://localhost:8080";
  const headers = { ...corsHeaders, "Access-Control-Allow-Origin": allowedOrigin ? origin : "https://redebeers-love.lovable.app", "Content-Type": "application/json", "Vary": "Origin" };
  const respond = (status: number, body: object) => new Response(JSON.stringify(body), { status, headers });
  if (!allowedOrigin) return respond(403, { error: "Origem não permitida." });
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return respond(405, { error: "Método não permitido." });

  try {
    const text = await req.text();
    if (text.length > 12_000) return respond(413, { error: "Solicitação muito grande." });
    const parsed = bodySchema.safeParse(JSON.parse(text));
    if (!parsed.success) return respond(400, { error: "Confira os dados e conclua a verificação de segurança." });
    const secret = Deno.env.get("RECAPTCHA_SECRET_KEY");
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!secret || !url || !serviceKey) return respond(503, { error: "Cadastro temporariamente indisponível." });

    // Google's verification consumes each challenge once. Never trust the client checkbox alone.
    const verification = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: parsed.data.captchaToken }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!verification.ok) return respond(503, { error: "Verificação temporariamente indisponível." });
    const result = await verification.json() as CaptchaResult;
    if (!validCaptcha(result)) return respond(400, { error: "Verificação inválida ou expirada. Confirme novamente que não é um robô." });

    // Admin account creation bypasses native password checks: retain leaked-password protection here.
    const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(parsed.data.password));
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
    const leakCheck = await fetch(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`, {
      headers: { "Add-Padding": "true" }, signal: AbortSignal.timeout(10_000),
    });
    if (!leakCheck.ok) return respond(503, { error: "Verificação de senha indisponível. Tente novamente." });
    const leaked = (await leakCheck.text()).split(/\r?\n/).some((line) => {
      const [suffix, count] = line.split(":");
      return suffix === hash.slice(5) && Number(count) > 0;
    });
    if (leaked) return respond(400, { error: "Esta senha apareceu em vazamentos. Escolha outra senha." });

    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: { name: parsed.data.name, phone: parsed.data.phone ?? "", referral_code: parsed.data.referralCode?.toUpperCase() ?? "" },
    });
    if (error) return respond(400, { error: "Não foi possível criar a conta. Confira os dados ou tente entrar se já possui cadastro." });
    return respond(200, { success: true });
  } catch {
    // Never log requests: they contain credentials and a one-time challenge.
    return respond(503, { error: "Não foi possível concluir o cadastro. Tente novamente." });
  }
});