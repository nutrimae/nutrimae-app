import type { Pool } from "./menu";

/**
 * Pool de sugestões de cardápio para o locale "es" (espanhol
 * latino-americano genérico). Estrutura idêntica ao pool pt-BR
 * (src/lib/menu.ts) — mesmo número de itens por faixa/refeição, pratos
 * adaptados aos ingredientes mais comuns na América Latina (não é
 * tradução literal do prato brasileiro).
 *
 * IDs prefixados com "es-" para não colidir com as fotos pt-BR em
 * /public/images/meals/{id}.webp — cada id aqui precisa da sua própria
 * foto gerada (mesmo estilo visual: tigela de bebê, pano com bolinhas,
 * luz suave).
 */
export const MENU_POOL_ES: Pool = {
  "6-7": {
    cafe: [
      {
        id: "es-6-7-cafe-1",
        title: "Papilla de plátano con avena",
        description: "Plátano bien maduro triturado con avena finita.",
        prep: "Triture medio plátano con un tenedor hasta hacer puré. Mezcle una cucharada de avena en copos finos y un poco de agua o leche materna/fórmula hasta lograr una textura suave.",
        ingredients: [
          { name: "Plátano", category: "feira" },
          { name: "Avena en copos finos", category: "mercado" },
        ],
      },
      {
        id: "es-6-7-cafe-2",
        title: "Papilla de manzana cocida",
        description: "Manzana cocida y triturada, textura lisa.",
        prep: "Cocine la manzana pelada y picada al vapor por 8 minutos. Triture bien con un tenedor hasta que quede homogénea.",
        ingredients: [{ name: "Manzana", category: "feira" }],
      },
      {
        id: "es-6-7-cafe-3",
        title: "Papilla de papaya triturada",
        description: "Papaya bien madura triturada, sin colar.",
        prep: "Retire las semillas y triture la pulpa de la papaya con un tenedor hasta que quede lisa.",
        ingredients: [{ name: "Papaya", category: "feira" }],
      },
    ],
    almoco: [
      {
        id: "es-6-7-almoco-1",
        title: "Papilla de calabacín con arroz y frijoles",
        description: "Puré de verduras con arroz y caldo de frijoles bien triturados.",
        prep: "Cocine el calabacín hasta que esté bien blando. Triture junto con un poco de arroz y el caldo espeso de los frijoles hasta formar una papilla lisa, sin sal.",
        ingredients: [
          { name: "Calabacín", category: "feira" },
          { name: "Arroz", category: "mercado" },
          { name: "Frijoles", category: "mercado" },
        ],
      },
      {
        id: "es-6-7-almoco-2",
        title: "Papilla de camote con pollo desmenuzado",
        description: "Camote triturado con pollo cocido bien desmenuzado y molido.",
        prep: "Cocine el camote hasta que se deshaga. Cocine el pollo, desmenúcelo bien fino y muélalo junto con el camote y un poco del agua de cocción.",
        ingredients: [
          { name: "Camote", category: "feira" },
          { name: "Pechuga de pollo", category: "mercado" },
        ],
      },
      {
        id: "es-6-7-almoco-3",
        title: "Papilla de zanahoria y chayote",
        description: "Verduras cocidas y trituradas con un chorrito de aceite de oliva.",
        prep: "Cocine la zanahoria y el chayote al vapor hasta que estén bien blandos. Triture todo junto y termine con un chorrito de aceite de oliva.",
        ingredients: [
          { name: "Zanahoria", category: "feira" },
          { name: "Chayote", category: "feira" },
          { name: "Aceite de oliva", category: "outros" },
        ],
      },
      {
        id: "es-6-7-almoco-regional-mexico-1",
        title: "Papilla de elote con calabaza",
        description: "Elote y calabaza cocidos y bien triturados — sabor típico mexicano.",
        prep: "Cocine los granos de elote y la calabaza al vapor hasta que estén muy blandos. Licúe con un poco de agua de cocción hasta lograr una papilla lisa, colando si quedan cáscaras.",
        ingredients: [
          { name: "Elote", category: "feira" },
          { name: "Calabaza", category: "feira" },
        ],
        regiao: ["mexico"],
      },
      {
        id: "es-6-7-almoco-regional-andina-1",
        title: "Papilla de quinua con zapallo",
        description: "Quinua bien cocida con zapallo triturado — clásico andino.",
        prep: "Lave bien la quinua y cocine 15 minutos hasta que esté muy blanda. Cocine el zapallo al vapor. Triture todo junto hasta lograr una papilla suave.",
        ingredients: [
          { name: "Quinua", category: "mercado" },
          { name: "Zapallo", category: "feira" },
        ],
        regiao: ["andina"],
      },
    ],
    lanche: [
      {
        id: "es-6-7-lanche-1",
        title: "Papilla de pera",
        description: "Pera cocida y triturada.",
        prep: "Cocine la pera pelada al vapor por unos minutos y triture hasta que quede lisa.",
        ingredients: [{ name: "Pera", category: "feira" }],
      },
      {
        id: "es-6-7-lanche-2",
        title: "Papilla de mango",
        description: "Mango bien maduro triturado.",
        prep: "Triture la pulpa del mango maduro con un tenedor hasta que quede homogénea.",
        ingredients: [{ name: "Mango", category: "feira" }],
      },
      {
        id: "es-6-7-lanche-3",
        title: "Agua de coco natural",
        description: "Ofrecida en pequeñas cantidades, en vaso de entrenamiento.",
        prep: "Ofrezca un poco de agua de coco natural en vasito o taza de entrenamiento, sin azúcar añadida.",
        ingredients: [{ name: "Agua de coco", category: "mercado" }],
      },
    ],
    jantar: [
      {
        id: "es-6-7-jantar-1",
        title: "Puré de papa con calabacín",
        description: "Puré de papa con calabacín bien cocido.",
        prep: "Cocine la papa y el calabacín hasta que estén bien blandos y triture todo junto.",
        ingredients: [
          { name: "Papa", category: "feira" },
          { name: "Calabacín", category: "feira" },
        ],
      },
      {
        id: "es-6-7-jantar-2",
        title: "Papilla de zapallo con carne molida",
        description: "Zapallo triturado con carne molida bien cocida y molida.",
        prep: "Cocine el zapallo hasta que se deshaga. Cocine la carne molida, escúrrala bien y muélala junto con el zapallo.",
        ingredients: [
          { name: "Zapallo", category: "feira" },
          { name: "Carne molida", category: "mercado" },
        ],
      },
      {
        id: "es-6-7-jantar-3",
        title: "Papilla de brócoli con papa",
        description: "Puré liviano de brócoli y papa.",
        prep: "Cocine el brócoli y la papa al vapor hasta que estén blandos y triture bien juntos.",
        ingredients: [
          { name: "Brócoli", category: "feira" },
          { name: "Papa", category: "feira" },
        ],
      },
    ],
  },
  "8-9": {
    cafe: [
      {
        id: "es-8-9-cafe-1",
        title: "Plátano machacado grueso con avena",
        description: "Textura más gruesa, con pequeños trocitos.",
        prep: "Machaque el plátano dejando trocitos pequeños. Mezcle avena en copos y sirva con una cucharita.",
        ingredients: [
          { name: "Plátano", category: "feira" },
          { name: "Avena en copos", category: "mercado" },
        ],
      },
      {
        id: "es-8-9-cafe-2",
        title: "Bastones de pera suave",
        description: "Pera cocida en bastones para tomar con la mano.",
        prep: "Cocine la pera al vapor hasta que esté blanda, corte en bastones lo bastante grandes para que el bebé los sostenga.",
        ingredients: [{ name: "Pera", category: "feira" }],
      },
      {
        id: "es-8-9-cafe-3",
        title: "Papilla espesa de maíz",
        description: "Papilla espesada, sin colar.",
        prep: "Cocine la harina de maíz con leche (materna, fórmula o vegetal) hasta espesar, dejando pequeños grumos.",
        ingredients: [{ name: "Harina de maíz", category: "mercado" }],
      },
    ],
    almoco: [
      {
        id: "es-8-9-almoco-1",
        title: "Arroz, frijoles y pollo desmenuzado grueso",
        description: "Ya con trocitos pequeños y textura más firme.",
        prep: "Sirva arroz y frijoles machacados con el tenedor, junto con pollo desmenuzado en hebras un poco más gruesas.",
        ingredients: [
          { name: "Arroz", category: "mercado" },
          { name: "Frijoles", category: "mercado" },
          { name: "Pechuga de pollo", category: "mercado" },
        ],
      },
      {
        id: "es-8-9-almoco-2",
        title: "Bastones de camote y brócoli",
        description: "Verduras cocidas en trozos que el bebé sostiene solo.",
        prep: "Cocine el camote y el brócoli al vapor hasta que estén blandos, cortados en bastones y floretes fáciles de sostener.",
        ingredients: [
          { name: "Camote", category: "feira" },
          { name: "Brócoli", category: "feira" },
        ],
      },
      {
        id: "es-8-9-almoco-3",
        title: "Puré grueso de zapallo con carne molida",
        description: "Textura menos lisa, con trocitos de carne.",
        prep: "Cocine el zapallo y triture dejando trocitos. Mezcle la carne molida bien cocida, sin triturar del todo.",
        ingredients: [
          { name: "Zapallo", category: "feira" },
          { name: "Carne molida", category: "mercado" },
        ],
      },
      {
        id: "es-8-9-almoco-regional-caribe-1",
        title: "Puré de yuca con carne molida",
        description: "Yuca cocida con carne molida desmenuzada, textura triturada.",
        prep: "Cocine la yuca hasta que esté blanda. Cocine la carne molida en agua. Triture todo junto con aceite de oliva.",
        ingredients: [
          { name: "Yuca", category: "feira" },
          { name: "Carne molida", category: "mercado" },
          { name: "Aceite de oliva", category: "mercado" },
        ],
        regiao: ["caribe"],
      },
      {
        id: "es-8-9-almoco-regional-rio_de_la_plata-1",
        title: "Caldo de zapallo con pollo y fideos chicos",
        description: "Caldo casero y nutritivo, muy bien cocido.",
        prep: "Cocine el zapallo y el pollo hasta que estén muy blandos. Agregue fideos chicos bien cocidos. Triture o desmenuce todo bien fino.",
        ingredients: [
          { name: "Zapallo", category: "feira" },
          { name: "Pechuga de pollo", category: "mercado" },
          { name: "Fideos chicos", category: "mercado" },
        ],
        regiao: ["rio_de_la_plata"],
      },
    ],
    lanche: [
      {
        id: "es-8-9-lanche-1",
        title: "Cubos suaves de mango",
        description: "Mango maduro en cubitos pequeños.",
        prep: "Corte el mango maduro en cubitos pequeños y suaves, fáciles de aplastar con la encía.",
        ingredients: [{ name: "Mango", category: "feira" }],
      },
      {
        id: "es-8-9-lanche-2",
        title: "Yogur natural con plátano machacado",
        description: "Yogur entero sin azúcar con plátano.",
        prep: "Mezcle el yogur natural entero con plátano bien machacado.",
        ingredients: [
          { name: "Yogur natural entero", category: "mercado" },
          { name: "Plátano", category: "feira" },
        ],
      },
      {
        id: "es-8-9-lanche-3",
        title: "Bastones de melón",
        description: "Melón en bastones suaves.",
        prep: "Corte el melón maduro en bastones o cubos grandes, fáciles de sostener.",
        ingredients: [{ name: "Melón", category: "feira" }],
      },
    ],
    jantar: [
      {
        id: "es-8-9-jantar-1",
        title: "Sopa espesada de verduras con pollo",
        description: "Sopa menos líquida, con trocitos visibles.",
        prep: "Cocine las verduras y el pollo, triture parcialmente dejando trozos pequeños y una consistencia más espesa.",
        ingredients: [
          { name: "Zanahoria", category: "feira" },
          { name: "Chayote", category: "feira" },
          { name: "Pechuga de pollo", category: "mercado" },
        ],
      },
      {
        id: "es-8-9-jantar-2",
        title: "Puré grueso de papa con huevo revuelto",
        description: "Papa triturada con huevo revuelto suave.",
        prep: "Cocine y triture la papa dejando trocitos. Mezcle el huevo revuelto bien cocido y deshecho.",
        ingredients: [
          { name: "Papa", category: "feira" },
          { name: "Huevo", category: "mercado" },
        ],
      },
      {
        id: "es-8-9-jantar-3",
        title: "Bastones de calabacín grillado",
        description: "Calabacín en bastones suaves con arroz machacado.",
        prep: "Grille o cocine el calabacín en tiras hasta que esté blando. Sirva con arroz levemente triturado.",
        ingredients: [
          { name: "Calabacín", category: "feira" },
          { name: "Arroz", category: "mercado" },
        ],
      },
    ],
  },
  "10-12": {
    cafe: [
      {
        id: "es-10-12-cafe-1",
        title: "Pan suave con plátano en rodajas",
        description: "Pequeños trozos de pan con fruta.",
        prep: "Corte el pan suave (sin corteza dura) en tiras y sirva con rodajas de plátano.",
        ingredients: [
          { name: "Pan integral de molde", category: "mercado" },
          { name: "Plátano", category: "feira" },
        ],
      },
      {
        id: "es-10-12-cafe-2",
        title: "Omelette en tiras con verduras picadas",
        description: "Huevo en tiras con trocitos de verduras.",
        prep: "Prepare un omelette simple con verduras bien picaditas y corte en tiras largas.",
        ingredients: [
          { name: "Huevo", category: "mercado" },
          { name: "Zanahoria", category: "feira" },
        ],
      },
      {
        id: "es-10-12-cafe-3",
        title: "Sémola de maíz con mango picado",
        description: "Sémola de maíz en trocitos con fruta picada.",
        prep: "Sirva pequeños trozos de sémola de maíz (polenta) junto con cubos de mango maduro.",
        ingredients: [
          { name: "Sémola de maíz", category: "mercado" },
          { name: "Mango", category: "feira" },
        ],
      },
      {
        id: "es-10-12-cafe-regional-mexico-1",
        title: "Atole de maíz con huevo picado",
        description: "Atole bien espeso, con huevo picado — clásico mexicano.",
        prep: "Prepare el atole de maíz bien espeso con leche o agua. Cocine el huevo y píquelo fino. Mezcle todo con un chorrito de aceite.",
        ingredients: [
          { name: "Harina de maíz para atole", category: "mercado" },
          { name: "Huevo", category: "mercado" },
        ],
        regiao: ["mexico"],
      },
    ],
    almoco: [
      {
        id: "es-10-12-almoco-1",
        title: "Arroz, frijoles, carne en trocitos y verduras",
        description: "Plato completo, todo en trozos pequeños.",
        prep: "Sirva arroz, frijoles, carne bien cocida picadita y verduras cocidas en trozos pequeños.",
        ingredients: [
          { name: "Arroz", category: "mercado" },
          { name: "Frijoles", category: "mercado" },
          { name: "Carne de res", category: "mercado" },
          { name: "Vainitas", category: "feira" },
        ],
      },
      {
        id: "es-10-12-almoco-2",
        title: "Ñoquis suaves de papa con salsa de tomate",
        description: "Masita suave con salsa casera sencilla.",
        prep: "Sirva pequeños trozos de ñoquis de papa caseros con salsa de tomate liviana, sin exceso de sal.",
        ingredients: [
          { name: "Papa", category: "feira" },
          { name: "Tomate", category: "feira" },
        ],
      },
      {
        id: "es-10-12-almoco-3",
        title: "Pescado desmenuzado con puré grueso de zapallo",
        description: "Pescado sin espinas en trozos con puré.",
        prep: "Cocine el pescado, verifique bien que no tenga espinas y desmenuce en trozos. Sirva con puré grueso de zapallo.",
        ingredients: [
          { name: "Filete de pescado", category: "mercado" },
          { name: "Zapallo", category: "feira" },
        ],
      },
      {
        id: "es-10-12-almoco-regional-andina-1",
        title: "Papas andinas con pollo desmenuzado",
        description: "Variedades de papa andina cocidas con pollo desmenuzado.",
        prep: "Cocine las papas andinas hasta que estén blandas. Desmenuce el pollo cocido. Mezcle todo con un chorrito de aceite de oliva.",
        ingredients: [
          { name: "Papa andina", category: "feira" },
          { name: "Pechuga de pollo", category: "mercado" },
          { name: "Aceite de oliva", category: "mercado" },
        ],
        regiao: ["andina"],
      },
      {
        id: "es-10-12-almoco-regional-rio_de_la_plata-1",
        title: "Puré de zapallo con choclo",
        description: "Zapallo bien cocido triturado con granos de choclo — cremoso y nutritivo.",
        prep: "Cocine el zapallo al vapor. Cocine los granos de choclo hasta que estén bien blandos. Triture todo junto con aceite de oliva.",
        ingredients: [
          { name: "Zapallo", category: "feira" },
          { name: "Choclo", category: "feira" },
          { name: "Aceite de oliva", category: "mercado" },
        ],
        regiao: ["rio_de_la_plata"],
      },
    ],
    lanche: [
      {
        id: "es-10-12-lanche-1",
        title: "Cubos de queso fresco con uva sin cáscara",
        description: "Queso y fruta en trozos pequeños.",
        prep: "Corte queso fresco suave y uvas sin cáscara (y sin semillas) en trozos muy pequeños.",
        ingredients: [
          { name: "Queso fresco", category: "mercado" },
          { name: "Uva", category: "feira" },
        ],
      },
      {
        id: "es-10-12-lanche-2",
        title: "Batido de plátano con avena",
        description: "Batido liviano, servido en vaso.",
        prep: "Licúe el plátano con leche (materna, fórmula o vegetal) y una cucharada de avena. Sirva en el vaso de entrenamiento.",
        ingredients: [
          { name: "Plátano", category: "feira" },
          { name: "Avena en copos", category: "mercado" },
        ],
      },
      {
        id: "es-10-12-lanche-3",
        title: "Galletitas caseras de plátano y avena",
        description: "Mini galletitas suaves.",
        prep: "Triture el plátano, mezcle con avena y hornee en pequeñas porciones hasta dorar levemente.",
        ingredients: [
          { name: "Plátano", category: "feira" },
          { name: "Avena en copos", category: "mercado" },
        ],
      },
    ],
    jantar: [
      {
        id: "es-10-12-jantar-1",
        title: "Puré grueso de papa con pollo picado",
        description: "Puré con trocitos de pollo.",
        prep: "Triture la papa dejando trozos y mezcle pollo cocido bien picadito.",
        ingredients: [
          { name: "Papa", category: "feira" },
          { name: "Pechuga de pollo", category: "mercado" },
        ],
      },
      {
        id: "es-10-12-jantar-2",
        title: "Sopa espesa de verduras con carne molida",
        description: "Sopa con cuerpo, con trozos visibles.",
        prep: "Cocine las verduras y la carne molida, dejando una buena parte en trozos pequeños.",
        ingredients: [
          { name: "Chayote", category: "feira" },
          { name: "Zanahoria", category: "feira" },
          { name: "Carne molida", category: "mercado" },
        ],
      },
      {
        id: "es-10-12-jantar-3",
        title: "Panquequito de verduras",
        description: "Panqueque suave cortado en tiras.",
        prep: "Prepare un panqueque simple con verduras ralladas y huevo, corte en tiras finas.",
        ingredients: [
          { name: "Huevo", category: "mercado" },
          { name: "Calabacín", category: "feira" },
        ],
      },
    ],
  },
  "13-24": {
    cafe: [
      {
        id: "es-13-24-cafe-1",
        title: "Pan integral con queso y fruta picada",
        description: "Desayuno de la familia, en porción pequeña.",
        prep: "Sirva pan integral con queso, acompañado de fruta picada en trozos que el niño ya mastica bien.",
        ingredients: [
          { name: "Pan integral", category: "mercado" },
          { name: "Queso fresco", category: "mercado" },
          { name: "Papaya", category: "feira" },
        ],
      },
      {
        id: "es-13-24-cafe-2",
        title: "Panqueque de plátano",
        description: "Panqueque en rodajas, sin azúcar.",
        prep: "Prepare un panqueque simple de plátano y avena, corte en trozos pequeños.",
        ingredients: [
          { name: "Plátano", category: "feira" },
          { name: "Avena en copos", category: "mercado" },
        ],
      },
      {
        id: "es-13-24-cafe-3",
        title: "Quesadilla suave de queso",
        description: "Quesadilla en trozos con queso derretido.",
        prep: "Prepare una quesadilla sencilla con tortilla suave y queso, corte en trozos fáciles de tomar.",
        ingredients: [
          { name: "Tortilla de maíz o trigo", category: "mercado" },
          { name: "Queso fresco", category: "mercado" },
        ],
      },
    ],
    almoco: [
      {
        id: "es-13-24-almoco-1",
        title: "Arroz con frijoles y carne de la familia (versión suave)",
        description: "Versión con poca sal y sin condimentos fuertes.",
        prep: "Separe una porción de la comida familiar antes de condimentar fuerte, con arroz, frijoles, carne y verduras en trozos pequeños.",
        ingredients: [
          { name: "Arroz", category: "mercado" },
          { name: "Frijoles", category: "mercado" },
          { name: "Carne de cerdo", category: "mercado" },
          { name: "Col rizada", category: "feira" },
        ],
      },
      {
        id: "es-13-24-almoco-2",
        title: "Fideos con salsa de tomate y carne molida",
        description: "Pasta en trozos pequeños con salsa casera.",
        prep: "Sirva fideos bien cocidos, cortados en trozos, con salsa de tomate casera y carne molida.",
        ingredients: [
          { name: "Fideos", category: "mercado" },
          { name: "Tomate", category: "feira" },
          { name: "Carne molida", category: "mercado" },
        ],
      },
      {
        id: "es-13-24-almoco-3",
        title: "Pescado a la plancha con arroz y verduras",
        description: "Plato completo de pescado sin espinas.",
        prep: "Cocine el pescado a la plancha (verificando espinas), sirva con arroz y verduras cocidas en trozos.",
        ingredients: [
          { name: "Filete de pescado", category: "mercado" },
          { name: "Arroz", category: "mercado" },
          { name: "Vainitas", category: "feira" },
        ],
      },
      {
        id: "es-13-24-almoco-regional-chile-1",
        title: "Porotos granados suaves con choclo y zapallo",
        description: "Porotos, choclo y zapallo bien cocidos — plato típico chileno.",
        prep: "Cocine los porotos hasta que estén muy blandos. Agregue choclo y zapallo en trozos pequeños y cocine hasta que todo se integre. Triture parcialmente para bebés más chicos.",
        ingredients: [
          { name: "Porotos", category: "mercado" },
          { name: "Choclo", category: "feira" },
          { name: "Zapallo", category: "feira" },
        ],
        regiao: ["chile"],
      },
    ],
    lanche: [
      {
        id: "es-13-24-lanche-1",
        title: "Frutas picadas variadas",
        description: "Mix de frutas de estación en trozos.",
        prep: "Corte frutas variadas (manzana, plátano, papaya) en trozos pequeños y sirva juntas.",
        ingredients: [
          { name: "Manzana", category: "feira" },
          { name: "Plátano", category: "feira" },
          { name: "Papaya", category: "feira" },
        ],
      },
      {
        id: "es-13-24-lanche-2",
        title: "Yogur con granola suave",
        description: "Yogur natural con un poco de granola sin azúcar.",
        prep: "Mezcle yogur natural entero con una cucharada de granola sin azúcar y sin trozos duros.",
        ingredients: [
          { name: "Yogur natural entero", category: "mercado" },
          { name: "Granola", category: "mercado" },
        ],
      },
      {
        id: "es-13-24-lanche-3",
        title: "Bizcocho casero de zanahoria (poca azúcar)",
        description: "Porción pequeña de bizcocho casero simple.",
        prep: "Sirva una porción pequeña de bizcocho de zanahoria casero, con poca azúcar y sin cobertura.",
        ingredients: [
          { name: "Zanahoria", category: "feira" },
          { name: "Harina de trigo", category: "mercado" },
        ],
      },
    ],
    jantar: [
      {
        id: "es-13-24-jantar-1",
        title: "Sopa de verduras con pollo de la familia",
        description: "Sopa con cuerpo, porción reservada antes de la sal extra.",
        prep: "Separe una porción de la sopa familiar antes de condimentar fuerte, con trozos suaves de pollo y verduras.",
        ingredients: [
          { name: "Pechuga de pollo", category: "mercado" },
          { name: "Papa", category: "feira" },
          { name: "Zanahoria", category: "feira" },
        ],
      },
      {
        id: "es-13-24-jantar-2",
        title: "Puré de papa con huevo y verduras",
        description: "Plato suave y nutritivo, en trozos.",
        prep: "Sirva puré de papa con huevo revuelto y verduras cocidas en trozos pequeños.",
        ingredients: [
          { name: "Papa", category: "feira" },
          { name: "Huevo", category: "mercado" },
        ],
      },
      {
        id: "es-13-24-jantar-3",
        title: "Risotto sencillo de verduras",
        description: "Arroz cremoso con verduras picadas.",
        prep: "Prepare un risotto sencillo de verduras, con poca sal, y sirva en porción pequeña.",
        ingredients: [
          { name: "Arroz arbóreo", category: "mercado" },
          { name: "Calabacín", category: "feira" },
        ],
      },
    ],
  },
};
