import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ShieldCheck, Scale, Lock, Clock, BadgeCheck, AlertTriangle, Gem,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

const PILARES = [
  {
    icon: Lock,
    title: "Segurança em primeiro lugar",
    text: "O saldo, os depósitos e os saques só mudam dentro do servidor, por regras fechadas. Ninguém — nem quem usa a plataforma — consegue editar um valor direto pela tela ou pelo aplicativo.",
  },
  {
    icon: BadgeCheck,
    title: "Regras claras e transparentes",
    text: "Depósito mínimo de R$ 20, taxa de saque de 12% (você recebe 88% líquidos), CPF e chave PIX obrigatórios no saque. Nada é cobrado de surpresa.",
  },
  {
    icon: Scale,
    title: "Responsabilidade com o cliente",
    text: "Todo movimento fica registrado na sua conta: depósitos, saques, planos ativos e rendimentos. Você consegue conferir tudo pelo seu perfil a qualquer momento.",
  },
  {
    icon: Clock,
    title: "Prazos que respeitamos",
    text: "Análise de depósito em até 3 dias úteis e pagamento de saque em até 3 dias úteis após a aprovação. Se algo atrasar, o atendimento informa o motivo.",
  },
];

const SobreNos = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted pb-24">
      <header className="bg-primary text-primary-foreground px-4 pt-4 pb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/perfil")}
          aria-label="Voltar para o perfil"
          className="mb-2 -ml-2 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-serif tracking-wider">DE BEERS</h1>
        <p className="text-[10px] tracking-[0.3em] opacity-80">A DIAMOND IS FOREVER</p>
      </header>

      <main className="mx-auto max-w-lg px-4 -mt-4 space-y-5">
        <Card className="shadow-lg">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Gem className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">Quem somos</h2>
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              A <strong>De Beers</strong> é uma plataforma de investimento em diamantes. Nosso trabalho é
              oferecer acesso a planos de retorno com regras simples, prazos definidos e valores que o
              cliente consegue conferir de ponta a ponta.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Trabalhamos com seriedade porque sabemos que lidamos com o dinheiro de pessoas reais. Por isso,
              cada valor que entra, cada plano ativado e cada saque aprovado fica registrado de forma
              individual e protegida.
            </p>
          </CardContent>
        </Card>

        <section aria-labelledby="pilares">
          <h2 id="pilares" className="mb-3 text-lg font-semibold text-foreground">Nossos compromissos</h2>
          <div className="space-y-3">
            {PILARES.map((p) => (
              <Card key={p.title}>
                <CardContent className="p-4 flex gap-3">
                  <div className="h-11 w-11 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <p.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{p.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">Como protegemos sua conta</h2>
            </div>
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>• Cada conta enxerga apenas os próprios dados. Não há acesso cruzado entre clientes.</li>
              <li>• Saldo, bônus e indicações são calculados por regras do servidor, não pelo dispositivo.</li>
              <li>• Saques exigem CPF e chave PIX válidos e passam por conferência antes do pagamento.</li>
              <li>• Senhas são protegidas por criptografia e nunca ficam visíveis em texto simples.</li>
              <li>• Tentativas de fraude ou alteração indevida são bloqueadas e podem ser investigadas.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-semibold text-foreground">Leia com atenção</h2>
            </div>
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>• Todo investimento tem risco. Nenhum retorno é garantido, mesmo que o plano tenha prazo anunciado.</li>
              <li>• Os percentuais e valores mostrados nos planos são projeções, não promessa de lucro.</li>
              <li>• Esta página não é recomendação de investimento. Invista apenas o que não comprometa seu orçamento.</li>
              <li>• É proibido usar a plataforma para lavagem de dinheiro ou qualquer atividade ilegal.</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Dúvidas sobre risco, prazo ou pagamento? Fale com o atendimento antes de investir.
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate("/suporte")}>
              Falar com o atendimento
            </Button>
          </CardContent>
        </Card>

        <p className="pb-2 text-center text-xs text-muted-foreground">
          De Beers — A DIAMOND IS FOREVER. Conteúdo atualizado em outubro de 2026.
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default SobreNos;
