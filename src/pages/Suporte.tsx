import { useEffect, useState } from "react";
import { HelpCircle, MessageCircle, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const FAQ = [
  { q: "Como faço um depósito?", a: "Acesse a aba Depósito, escolha o valor (mínimo R$ 50) e gere o código PIX. O saldo é creditado após a confirmação." },
  { q: "Qual a taxa de saque?", a: "12% sobre o valor solicitado. Você recebe 88% líquidos via PIX em até 24h úteis." },
  { q: "Como funciona o check-in diário?", a: "Toque em 'Check-in' no painel inicial uma vez por dia e ganhe R$ 1,00 de bônus direto no saldo." },
  { q: "Como ganho com indicações?", a: "Compartilhe seu código de indicação. A cada amigo que investir, você recebe bônus." },
  { q: "Meu saque foi rejeitado, e agora?", a: "Confira CPF e chave PIX cadastrados. Se persistir, abra um chamado abaixo." },
];

type Ticket = { id: string; subject: string; status: string; created_at: string };

const Suporte = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("support_tickets")
      .select("id, subject, status, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
    if (data) setTickets(data);
  };

  useEffect(() => { load(); }, [user]);

  const submit = async () => {
    if (!user) return;
    if (subject.trim().length < 3) return toast({ title: "Assunto muito curto", variant: "destructive" });
    if (message.trim().length < 10) return toast({ title: "Mensagem muito curta", description: "Mínimo de 10 caracteres", variant: "destructive" });
    setLoading(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id, subject: subject.trim(), message: message.trim(), status: "open",
    });
    setLoading(false);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Chamado enviado ✅", description: "Responderemos em até 24h." });
    setSubject(""); setMessage(""); load();
  };

  const openWhatsapp = () => {
    const text = encodeURIComponent("Olá, preciso de ajuda com a plataforma De Beers.");
    window.open(`https://wa.me/5511999999999?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-muted pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4">
        <h1 className="text-xl font-serif tracking-wider">DE BEERS</h1>
        <p className="text-[10px] tracking-[0.3em] opacity-80">A DIAMOND IS FOREVER</p>
      </header>

      <div className="px-4 mt-4 space-y-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">Suporte</h2>
            </div>
            <Button onClick={openWhatsapp} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-base font-semibold text-primary mb-2">Perguntas Frequentes</h3>
            <Accordion type="single" collapsible className="w-full">
              {FAQ.map((f, i) => (
                <AccordionItem key={i} value={`i-${i}`}>
                  <AccordionTrigger className="text-sm text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="text-base font-semibold text-primary">Abrir um chamado</h3>
            <div>
              <Label className="text-sm">Assunto</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm">Mensagem</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} rows={5} className="mt-1.5" />
            </div>
            <Button onClick={submit} disabled={loading} className="w-full">
              <Send className="h-4 w-4" /> {loading ? "Enviando..." : "Enviar"}
            </Button>
          </CardContent>
        </Card>

        {tickets.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <h3 className="text-base font-semibold text-primary mb-3">Meus chamados</h3>
              <div className="space-y-2">
                {tickets.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-sm font-medium truncate">{t.subject}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleString("pt-BR")}</p>
                    </div>
                    <Badge variant={t.status === "open" ? "secondary" : "default"}>
                      {t.status === "open" ? "Aberto" : "Respondido"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Suporte;
