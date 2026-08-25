import { DIARY_FOODS, MILESTONES, type Reaction } from "@/lib/food-diary";
import type { Baby } from "@/lib/types";

export const MIN_BOOK_DIARY_ENTRIES = 10;
export const BOOK_PRICE_CENTS = 11_900;
export const BOOK_PRIVACY_POLICY_VERSION = "openai-api-2026-08-22";

export type BookStatus = "draft" | "generating" | "review_pending" | "ready" | "failed";

export interface BookDiaryEntry {
  food_key: string;
  reaction: Reaction;
  tried_at: string;
}

export interface BookMilestone {
  milestone_key: string;
  achieved_at: string;
}

export interface BookPageScript {
  page: number;
  title: string;
  text: string;
  scene: string;
  imagePath?: string;
  review?: { approved: boolean; reason?: string };
}

const foodByKey = new Map(DIARY_FOODS.map((food) => [food.key, food]));
const milestoneByKey = new Map(MILESTONES.map((milestone) => [milestone.key, milestone]));

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "seu bebe";
}

function foodName(key: string) {
  return foodByKey.get(key)?.name ?? "um novo sabor";
}

/**
 * `illustrated_books.script`/`reference_photo_path` sao colunas que a propria
 * usuaria consegue sobrescrever via RLS (a API precisa disso pra persistir
 * progresso com o client comum, sem service role). Isso significa que os
 * caminhos de arquivo dentro desses campos NAO sao confiaveis por si so: uma
 * usuaria mal-intencionada pode editar o JSON do proprio livro apontando
 * `imagePath`/`reference_photo_path` pra dentro da pasta de outra usuaria.
 * Rotas que usam o client admin (que ignora RLS do Storage) pra baixar esses
 * arquivos SEMPRE precisam confirmar o prefixo antes de usar o caminho.
 */
export function assertOwnedStoragePath(path: string, userId: string, bookId: string) {
  if (!path.startsWith(`${userId}/${bookId}/`)) {
    throw new Error("Caminho de arquivo fora do escopo da usuaria");
  }
}

/**
 * Monta o roteiro apenas com fatos registrados pela responsavel. Nada e
 * inferido como orientacao de saude e recusas aparecem como exploracao.
 */
export function buildBookScript(
  baby: Baby,
  entries: BookDiaryEntry[],
  milestones: BookMilestone[],
): BookPageScript[] {
  const name = firstName(baby.name);
  const ordered = [...entries].sort((a, b) => a.tried_at.localeCompare(b.tried_at));
  const first = ordered[0];
  const loved = ordered.find((entry) => entry.reaction === "gostou") ?? first;
  const explored = ordered.find((entry) => entry.reaction === "nao_gostou");
  const milestone = [...milestones]
    .sort((a, b) => a.achieved_at.localeCompare(b.achieved_at))
    .map((item) => milestoneByKey.get(item.milestone_key))
    .find(Boolean);

  const pages: Omit<BookPageScript, "page">[] = [
    {
      title: `O livro de ${name}`,
      text: `Uma historia feita com os sabores e momentos reais de ${name}.`,
      scene: "capa delicada, cozinha acolhedora, frutas e legumes coloridos sobre a mesa",
    },
    {
      title: "Era uma vez um novo sabor",
      text: first
        ? `${name} comecou esta aventura conhecendo ${foodName(first.food_key)}.`
        : `${name} estava pronto para descobrir um mundo de cores, cheiros e texturas.`,
      scene: `crianca em cadeira de alimentacao conhecendo ${first ? foodName(first.food_key) : "um alimento colorido"}`,
    },
    {
      title: "Um sabor especial",
      text: loved
        ? `${foodName(loved.food_key)} ganhou um sorriso especial durante essa descoberta.`
        : "Cada pequena descoberta encontrou seu lugar nesta historia.",
      scene: `crianca sorrindo diante de ${loved ? foodName(loved.food_key) : "um prato infantil colorido"}`,
    },
    {
      title: "Explorar tambem e aprender",
      text: explored
        ? `${foodName(explored.food_key)} precisou de mais tempo. E tudo bem: conhecer um sabor novo tambem e uma aventura.`
        : `${name} aprendeu que cada alimento pode trazer uma surpresa diferente.`,
      scene: `crianca curiosa observando ${explored ? foodName(explored.food_key) : "novos alimentos"}, expressao tranquila e divertida`,
    },
    {
      title: milestone?.title ?? "Um marco para guardar",
      text: milestone
        ? `${milestone.title} virou uma lembranca bonita para guardar com carinho.`
        : "Entre colheradas e descobertas, surgiram momentos que merecem ser lembrados.",
      scene: `momento familiar acolhedor representando ${milestone?.title ?? "uma conquista alimentar"}`,
    },
    {
      title: `${ordered.length} sabores na historia`,
      text: `${name} ja registrou ${ordered.length} sabores. Cada registro ajudou a contar esta aventura unica.`,
      scene: "mesa alegre com variedade de frutas, legumes, graos e alimentos, ambiente domestico simples",
    },
    {
      title: "A aventura continua",
      text: `Este livro guarda o comeco. Ainda existem muitos sabores, risadas e momentos de ${name} esperando pelas proximas paginas.`,
      scene: "crianca e responsavel juntos em cozinha iluminada, clima de carinho e seguranca",
    },
  ];

  return pages.map((page, index) => ({ page: index + 1, ...page }));
}

export function buildIllustrationPrompt(page: BookPageScript, baby: Baby, hasReference: boolean) {
  const descriptor = hasReference
    ? "preserve os tracos principais da crianca da foto de referencia, em versao ilustrada"
    : `personagem infantil generico, ${baby.gender === "male" ? "menino" : "menina"}, sem parecer uma crianca real especifica`;

  return [
    "Ilustracao editorial infantil premium em aquarela digital suave.",
    descriptor + ".",
    `Cena: ${page.scene}.`,
    "Mesmo personagem, roupas e paleta em todas as paginas.",
    "Ambiente domestico simples, acolhedor e seguro; apenas crianca, responsavel e alimentos pertinentes.",
    "Sem texto, sem logotipos, sem marcas, sem anatomia estranha e sem contexto medico.",
    "Composicao vertical 4:5, espaco visual limpo para diagramacao.",
  ].join(" ");
}
