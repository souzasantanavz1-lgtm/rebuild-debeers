import { z } from "zod";

export const moneySchema = z.number().finite().positive().refine(
  (value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.000001,
  "Use no máximo duas casas decimais.",
);
export const depositAmountSchema = moneySchema.refine(
  (value) => value >= 20 && value <= 50000, "Deposite entre R$ 20 e R$ 50.000.",
);
export const withdrawalAmountSchema = moneySchema.refine(
  (value) => value >= 25, "O saque mínimo é R$ 25.",
);

export function withdrawalAmounts(amount: number): { fee: number; net: number } {
  moneySchema.parse(amount);
  const cents = Math.round(amount * 100);
  const feeCents = Math.round(cents * 12 / 100);
  return { fee: feeCents / 100, net: (cents - feeCents) / 100 };
}

export function validCpf(value: string): boolean {
  const cpf = value.replace(/\D/g, "");
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  for (const size of [9, 10]) {
    const sum = [...cpf.slice(0, size)].reduce((total, digit, index) => total + Number(digit) * (size + 1 - index), 0);
    const check = (sum * 10) % 11;
    if (Number(cpf[size]) !== (check === 10 ? 0 : check)) return false;
  }
  return true;
}

export function businessDate(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bahia", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}