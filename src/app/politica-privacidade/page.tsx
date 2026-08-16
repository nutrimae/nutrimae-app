import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PoliticaPrivacidadePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col gap-6 px-4 py-8">
      <Link
        href="/app"
        className="flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-sage-600"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Voltar
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-100">
          <ShieldCheck className="h-6 w-6 text-sage-600" strokeWidth={2} />
        </div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">
          Política de Privacidade
        </h1>
      </div>

      <div className="flex flex-col gap-4 text-brown-800">
        <p>
          O NutriMäe leva a sério a privacidade da sua família e trata seus dados em
          conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
        </p>

        <section>
          <h2 className="font-heading text-lg font-bold text-brown-800">
            Quais dados coletamos
          </h2>
          <p className="mt-1">
            Dados de cadastro (e-mail), dados do bebê que você opta por informar (nome,
            data de nascimento, foto opcional) e registros de uso do app, como itens do
            cardápio, alimentos experimentados e mensagens de suporte.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-brown-800">
            Como usamos seus dados
          </h2>
          <p className="mt-1">
            Usamos esses dados exclusivamente para personalizar o conteúdo do app para a
            fase do seu bebê e para dar suporte a você. Não vendemos nem compartilhamos
            dados do seu bebê com terceiros para fins de marketing.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-brown-800">
            Onde seus dados ficam guardados
          </h2>
          <p className="mt-1">
            As informações são armazenadas de forma segura, com controle de acesso restrito
            à sua própria conta (cada mãe só acessa os dados dos seus próprios bebês).
            Fotos são guardadas em armazenamento privado, nunca públicas.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-brown-800">Seus direitos</h2>
          <p className="mt-1">
            Você pode editar ou apagar os dados do seu bebê a qualquer momento em Perfil e
            configurações, e pode solicitar a exclusão completa da sua conta pelo Canal de
            Suporte.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-brown-800">Dúvidas</h2>
          <p className="mt-1">
            Para qualquer dúvida sobre privacidade ou tratamento de dados, fale com a gente
            pelo Canal de Suporte dentro do app.
          </p>
        </section>
      </div>
    </main>
  );
}
