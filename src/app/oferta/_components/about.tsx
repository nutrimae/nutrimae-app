export function About() {
  return (
    <section className="mx-auto w-full max-w-sm px-5 py-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-500 font-heading text-lg font-bold text-white">
        NM
      </div>
      <h2 className="mt-4 font-heading text-xl font-bold text-brown-800">Sobre o NutriMãe</h2>
      <p className="mt-3 text-sm text-brown-700">
        O NutriMãe nasceu de uma ideia simples: a introdução alimentar fica mais leve quando a mãe tem tudo
        organizado em um lugar só. Em vez de juntar informação solta de vários cantos, reunimos cardápio, lista de
        compras e o corte indicado de cada alimento — tudo separado por faixa etária e pronto para consultar com
        uma mão só, no meio da correria.
      </p>
      <p className="mt-3 text-sm text-brown-700">
        Nossa proposta é organização e praticidade no dia a dia, sempre como apoio ao acompanhamento do pediatra ou
        nutricionista que cuida do seu bebê — nunca como substituto dele.
      </p>
      {/* [PLACEHOLDER — se houver profissional de saúde realmente vinculado à marca,
          descreva aqui formação e registro. Não afirme validação que não existe.] */}
    </section>
  );
}
