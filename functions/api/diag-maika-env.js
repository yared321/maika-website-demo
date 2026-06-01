import { readEnv } from "../_lib/cf_http.js";

/** GET `/api/diag-maika-env` — verify face-assess proxy env (no secrets exposed). */
export async function onRequest(context) {
  const env = context.env;
  const upstream = readEnv(env, "MAIKA_RPPG_UPSTREAM");
  const body = {
    maikaUpstreamConfigured: Boolean(upstream),
    maikaPublicKeyConfigured: Boolean(readEnv(env, "MAIKA_PUBLIC_KEY")),
    maikaCaptchaTokenConfigured: Boolean(readEnv(env, "MAIKA_CAPTCHA_TOKEN")),
  };
  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
