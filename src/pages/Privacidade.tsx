import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ShieldCheck, Eye, Database, Share2, UserCog, Trash2, Clock, Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

const DATA_COLETADA = [
  { icon: UserCog, title: "Cadastro", text: "Nome, telefone, e-mail e código de indicação informado no momento do registro." },
  { icon: Database, title: "Movimentações", text: "Depósitos, saques, planos ativados, rendimentos e check-ins diários da sua conta." },
  { icon: Lock, title: "Saque", text: "CPF e chave PIX, usados apenas para pagar você e conferir a titularidade da conta." },
  { icon: Clock, title: "Segurança", text: "Registros de acesso e de tentativas de alteração indevida, para prevenir fraudes." },
];

const Privacidade = () => {
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
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">Sua privacidade é levada a sério</h2>
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              Seus dados servem para uma coisa só: fazer a sua conta funcionar. Não vendemos, não alugamos e
              não compartilhamos suas informações com quem queira usar isso para vender algo para você.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Esta página explica, em português claro, o que coletamos, para que serve, com quem falamos e
              quais são os seus direitos.
            </p>
          </CardContent>
        </Card>

        <section aria-labelledby="coleta">
          <h2 id="coleta" className="mb-3 text-lg font-semibold text-foreground">O que coletamos</h2>
          <div className="space-y-3">
            {DATA_COLETADA.map((d) => (
              <Card key={d.title}>
                <CardContent className="p-4 flex gap-3">
                  <div className="h-11 w-11 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <d.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{d.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d.text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">Como protegemos</h2>
            </div>
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>• Isolamento por conta: cada pessoa acessa apenas os próprios registros.</li>
              <li>• Valores financeiros só são alterados por regras do servidor, nunca pelo aplicativo.</li>
              <li>• Senhas são armazenadas de forma protegida e não podem ser lidas por ninguém.</li>
              <li>• CPF e chave PIX ficam restritos à sua conta e são usados apenas no pagamento de saques.</li>
              <li>• Registros financeiros são guardados pelo tempo exigido pela legislação brasileira.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">Com quem falamos sobre seus dados</h2>
            </div>
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>• Com o provedor de pagamento PIX, quando você faz um depósito ou um saque.</li>
              <li>• Com o atendimento, quando você mesmo abre um chamado e nos escreve.</li>
              <li>• Com órgãos oficiais, somente quando a lei obriga e mediante solicitação formal.</li>
              <li>• Nunca com empresas de publicidade, revendedores de lista ou parceiros comerciais.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">Seus direitos (LGPD)</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pela Lei Geral de Proteção de Dados, você pode a qualquer momento:
            </p>
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
              <li>• Confirmar que temos seus dados e pedir uma cópia deles;</li>
              <li>• Corrigir nome, telefone ou e-mail desatualizados;</li>
              <li>• Pedir a eliminação da sua conta e dos dados que não precisamos guardar por lei;</li>
              <li>• Revogar o consentimento e saber as finalidades do uso;</li>
              <li>• Pedir informações sobre com quem seus dados foram compartilhados.</li>
            </ul>
            <Button variant="outline" className="w-full" onClick={() => navigate("/suporte")}>
              Fazer um pedido sobre meus dados
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">Encerrar a conta</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Você pode sair da sua conta quando quiser. Para excluir o cadastro, abra um chamado pedindo o
              encerramento. Antes de apagar, é preciso que não haja saldo, saque em análise ou pendência
              financeira aberta. Registros obrigatórios por lei continuam guardados nesse período.
            </p>
          </CardContent>
        </Card>

        <p className="pb-2 text-center text-xs text-muted-foreground">
          Aviso legal: todo investimento tem risco e nenhum retorno é garantido. Esta plataforma não é
          recomendação de investimento. Texto atualizado em outubro de 2026.
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default Privacidade;
