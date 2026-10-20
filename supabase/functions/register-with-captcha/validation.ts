export const allowedHosts = new Set([
  "redebeers-love.lovable.app",
  "id-preview--42be17a7-d386-4531-8213-94b0e5759d63.lovable.app",
]);

export interface CaptchaResult {
  success?: boolean;
  hostname?: string;
  challenge_ts?: string;
}

export function validCaptcha(result: CaptchaResult, now = Date.now()): boolean {
  const timestamp = Date.parse(result.challenge_ts ?? "");
  return result.success === true && allowedHosts.has(result.hostname ?? "") &&
    Number.isFinite(timestamp) && now >= timestamp && now - timestamp <= 120_000;
}