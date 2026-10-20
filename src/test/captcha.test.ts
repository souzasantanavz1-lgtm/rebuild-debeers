import { describe, expect, it } from "vitest";
import { validCaptcha } from "../../supabase/functions/register-with-captcha/validation";

describe("registration captcha enforcement", () => {
  const now = Date.parse("2026-10-20T04:00:00Z");
  const valid = { success: true, hostname: "redebeers-love.lovable.app", challenge_ts: "2026-10-20T03:59:30Z" };
  it("accepts a verified, recent challenge from the app", () => {
    expect(validCaptcha(valid, now)).toBe(true);
  });
  it("rejects unsuccessful verification", () => {
    expect(validCaptcha({ ...valid, success: false }, now)).toBe(false);
  });
  it("rejects challenges from another site", () => {
    expect(validCaptcha({ ...valid, hostname: "attacker.example" }, now)).toBe(false);
  });
  it("rejects expired challenges", () => {
    expect(validCaptcha({ ...valid, challenge_ts: "2026-10-20T03:57:59Z" }, now)).toBe(false);
  });
  it("rejects missing challenge data", () => {
    expect(validCaptcha({ success: true }, now)).toBe(false);
  });
});