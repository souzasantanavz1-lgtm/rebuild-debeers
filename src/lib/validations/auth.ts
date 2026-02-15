import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .min(6, "E-mail deve ter no mínimo 6 caracteres")
    .max(255, "E-mail deve ter no máximo 255 caracteres")
    .email("Formato de e-mail inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome é obrigatório")
      .min(2, "Nome deve ter no mínimo 2 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    email: z
      .string()
      .min(1, "E-mail é obrigatório")
      .min(6, "E-mail deve ter no mínimo 6 caracteres")
      .max(255, "E-mail deve ter no máximo 255 caracteres")
      .email("Formato de e-mail inválido"),
    phone: z.string().optional(),
    referralCode: z.string().optional(),
    password: z
      .string()
      .min(1, "Senha é obrigatória")
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .regex(/[a-zA-Z]/, "Senha deve conter letras")
      .regex(/[0-9]/, "Senha deve conter números"),
    passwordConfirmation: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não conferem",
    path: ["passwordConfirmation"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
