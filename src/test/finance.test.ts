import { describe, expect, it } from "vitest";
import { businessDate, depositAmountSchema, withdrawalAmountSchema, validCpf, withdrawalAmounts } from "@/lib/finance";

describe("financial rules", () => {
  it("enforces the R$25 gross withdrawal minimum before the 12% fee", () => {
    expect(withdrawalAmountSchema.safeParse(24.99).success).toBe(false);
    expect(withdrawalAmountSchema.safeParse(25).success).toBe(true);
    expect(withdrawalAmounts(25)).toEqual({ fee: 3, net: 22 });
  });
  it("applies the mandatory 12% withdrawal fee", () => {
    expect(withdrawalAmounts(100)).toEqual({ fee: 12, net: 88 });
  });
  it("rounds cent amounts without losing money", () => {
    expect(withdrawalAmounts(28.57)).toEqual({ fee: 3.43, net: 25.14 });
    expect(withdrawalAmounts(199.99)).toEqual({ fee: 24, net: 175.99 });
  });
  it("enforces the R$20 deposit minimum", () => {
    expect(depositAmountSchema.safeParse(19.99).success).toBe(false);
    expect(depositAmountSchema.safeParse(20).success).toBe(true);
  });
  it("enforces the R$50000 deposit maximum", () => {
    expect(depositAmountSchema.safeParse(50000).success).toBe(true);
    expect(depositAmountSchema.safeParse(50000.01).success).toBe(false);
  });
  it("rejects non-finite and fractional-cent money", () => {
    for (const amount of [Infinity, NaN, -1, 0, 1.001]) expect(() => withdrawalAmounts(amount)).toThrow();
  });
  it("requires valid CPF check digits", () => {
    expect(validCpf("52998224725")).toBe(true);
    expect(validCpf("52998224724")).toBe(false);
    expect(validCpf("11111111111")).toBe(false);
  });
  it("uses the Bahia day near UTC midnight", () => {
    expect(businessDate(new Date("2026-10-17T01:00:00Z"))).toBe("2026-10-16");
    expect(businessDate(new Date("2026-10-17T03:00:00Z"))).toBe("2026-10-17");
  });
});