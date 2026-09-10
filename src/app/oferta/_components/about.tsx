import Image from "next/image";

export function About() {
  return (
    <section className="mx-auto w-full max-w-sm px-5 py-8">
      <div className="mx-auto max-w-[260px] overflow-hidden rounded-3xl border border-sage-100/80 shadow-strong">
        <Image
          src="/persona/camille_historia_01.jpg"
          alt="Camille, especialista por trás do NutriMama, na cozinha de casa"
          width={800}
          height={1421}
          className="h-auto w-full"
        />
      </div>

      <p
        className="mt-5 text-xl font-bold text-primary-600"
        style={{ fontFamily: "var(--font-caveat)" }}
      >
        Acolhimento por trás de cada pratinho
      </p>
      <h2 className="mt-1 font-heading text-lg font-extrabold leading-snug text-brown-900">
        "Cuidar de cada refeição não deveria significar descobrir tudo sozinha."
      </h2>

      <p className="mt-3 text-sm leading-relaxed text-brown-700">
        Sou Camille. Estou aqui para te mostrar um jeito mais simples de organizar uma rotina cheia de
        pequenas decisões: o que oferecer, como preparar e o que comprar para a semana.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-brown-700">
        Imagine a cena: a hora da refeição se aproxima, a geladeira está aberta e aquela receita que você
        salvou desapareceu entre tantas mensagens. É para facilitar esses momentos que o NutriMama reúne
        cardápios por fase, guia visual de cortes, receitas e substituições em um só lugar — até a lista de
        compras pode seguir direto para o WhatsApp.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-brown-700">
        Para que você passe menos tempo procurando e tenha mais espaço para aproveitar as descobertas à
        mesa, no ritmo da sua família.
      </p>

      <p
        className="mt-4 text-lg font-bold text-brown-900"
        style={{ fontFamily: "var(--font-caveat)" }}
      >
        Com carinho, Camille 💛
      </p>
    </section>
  );
}
