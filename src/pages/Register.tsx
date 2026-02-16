import { useState } from "react";
import { Eye, EyeOff, UserPlus, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import deBeersLogo from "@/assets/de-beers-logo.svg";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      referralCode: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name: data.name,
            phone: data.phone || "",
          },
        },
      });

      if (error) {
        toast({
          title: "Erro ao criar conta",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Conta criada com sucesso! 🎉",
        description: "Verifique seu e-mail para confirmar sua conta antes de fazer login.",
      });
      navigate("/");
    } catch {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="mb-8">
        <img src={deBeersLogo} alt="De Beers Logo" className="h-16 w-auto" />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-primary mb-2">Crie sua conta ✨</h1>
        <p className="text-muted-foreground">Comece a investir em diamantes hoje</p>
      </div>

      <Card className="w-full max-w-md shadow-lg border-border">
        <CardContent className="pt-6 pb-8 px-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">Nome Completo *</Label>
              <Input id="name" type="text" placeholder="Seu nome completo" {...registerField("name")}
                className={`h-12 ${errors.name ? "border-destructive" : "border-input"}`} disabled={isLoading} />
              {errors.name && <p className="text-sm text-destructive flex items-center gap-1"><span>⚠</span> {errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">E-mail *</Label>
              <Input id="email" type="email" placeholder="seu@email.com" {...registerField("email")}
                className={`h-12 ${errors.email ? "border-destructive" : "border-input"}`} disabled={isLoading} />
              {errors.email && <p className="text-sm text-destructive flex items-center gap-1"><span>⚠</span> {errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground font-medium">Telefone (Opcional)</Label>
              <Input id="phone" type="tel" placeholder="(00) 00000-0000" {...registerField("phone")}
                className="h-12 border-input" disabled={isLoading} />
            </div>

            <div className="space-y-2">
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                <Label htmlFor="referralCode" className="text-foreground font-medium flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />Código de Indicação (Opcional)
                </Label>
                <Input id="referralCode" type="text" placeholder="Digite o código de quem te indicou"
                  {...registerField("referralCode")} className="h-12 border-input mt-2 bg-secondary/50" disabled={isLoading} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">Senha *</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  {...registerField("password")}
                  className={`h-12 pr-12 ${errors.password ? "border-destructive" : "border-input"}`} disabled={isLoading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" disabled={isLoading}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive flex items-center gap-1"><span>⚠</span> {errors.password.message}</p>}
              <p className="text-xs text-muted-foreground">Mínimo 8 caracteres, deve conter letras e números</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation" className="text-foreground font-medium">Confirmar Senha *</Label>
              <div className="relative">
                <Input id="passwordConfirmation" type={showPasswordConfirmation ? "text" : "password"} placeholder="••••••••"
                  {...registerField("passwordConfirmation")}
                  className={`h-12 pr-12 ${errors.passwordConfirmation ? "border-destructive" : "border-input"}`} disabled={isLoading} />
                <button type="button" onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" disabled={isLoading}>
                  {showPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.passwordConfirmation && <p className="text-sm text-destructive flex items-center gap-1"><span>⚠</span> {errors.passwordConfirmation.message}</p>}
            </div>

            <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Criando conta...</>
              ) : (
                <><UserPlus className="mr-2 h-5 w-5" />Criar conta</>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">ou</span></div>
          </div>

          <p className="text-center text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/" className="text-primary font-semibold hover:underline transition-all">Faça login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
