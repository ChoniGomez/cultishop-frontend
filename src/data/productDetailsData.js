/**
 * Datos técnicos enriquecidos y especificaciones de cultivo para el catálogo de CultiShop.
 * Permite que la vista de detalle de producto presente información exhaustiva, profesional
 * y orientada al cultivo cannábico medicinal e industrial.
 */

export const PRODUCT_TECHNICAL_SPECS = {
  1: {
    brand: 'Namasté Nutrientes',
    origin: 'Argentina',
    cultivationStage: 'Fase Vegetativa & Enraizamiento',
    format: 'Líquido concentrado soluble',
    dosage: '2 a 4 ml por litro de agua sin cloro, cada 7 a 10 días.',
    phRecommended: '6.0 - 6.5',
    ecRecommended: '1.2 - 1.6 mS/cm',
    suitableFor: 'Indoor, Exterior, Sustrato orgánico, Fibra de coco e Hidroponia.',
    cannabisSpecs: {
      genotypeCompatibility: 'Apto para Índicas, Sativas, Híbridas y Autoflorecientes.',
      vegetativeImpact: 'Multiplica los brotes secundarios y acelera el desarrollo foliar.',
      chlorophyllBooster: 'Aumenta la síntesis de clorofila para hojas verde oscuro intensas.',
      stressProtection: 'Reduce el estrés por trasplantes, altas temperaturas y podas (FIM/Apical).'
    },
    keyBenefits: [
      'Contiene ácidos húmicos y fúlvicos de origen fósil que desbloquean nutrientes atrapados en el sustrato.',
      'Extracto de algas marinas Ascophyllum Nodosum cargadas de citoquininas y auxinas naturales.',
      'Aumenta la masa radicular facilitando una asimilación explosiva de nitrógeno y fósforo.',
      '100% orgánico certificado, no satura de sales los medios de cultivo.'
    ],
    applicationGuide: [
      'Agitar enérgicamente el envase antes de dosificar.',
      'Diluir en agua reposada o desclorada a temperatura ambiente (18°C - 22°C).',
      'Aplicar principalmente en el riego habitual. Opcionalmente puede aplicarse foliarmente a 2 ml/L al apagarse las luces.',
      'Suspender su uso al inicio de la 3ra semana de floración para dar paso a potenciadores de fósforo y potasio.'
    ]
  },
  2: {
    brand: 'Namasté Nutrientes',
    origin: 'Argentina',
    cultivationStage: 'Germinación, Esquejes, Trasplantes & Inicio de Floración',
    format: 'Polvo microbiano inoculable',
    dosage: '3 gramos por cada 5 litros de sustrato o 1 cucharadita diluida en 1L de agua.',
    phRecommended: '5.8 - 6.8',
    suitableFor: 'Sustratos con turba, compost, perlita, vermiculita y fibra de coco.',
    cannabisSpecs: {
      genotypeCompatibility: 'Esencial para todo tipo de variedades cannábicas en cualquier medio.',
      rootColonization: 'Coloniza el 85% de la masa radicular en menos de 7 días hábiles.',
      mycorrhizaType: 'Glomus intraradices y cepas nativas de micorrizas vesículo-arbusculares.',
      bioProtection: 'Barrera biológica contra patógenos de raíz (Fusarium oxysporum y Pythium).'
    },
    keyBenefits: [
      'Multiplica la superficie de contacto de las raíces con el medio hasta un 400%.',
      'Facilita la solubilización biológica del Fósforo, nutriente clave para floración pesada.',
      'Aumenta drásticamente la resistencia de las plantas a la sequía y al calor extremo en Posadas.',
      'Contiene bioestimulantes y levaduras seleccionadas que aceleran el arraigue de esquejes.'
    ],
    applicationGuide: [
      'En trasplantes: Espolvorear 1 cucharada directamente en el hoyo donde se alojará el cepellón para contacto directo con las raíces.',
      'En riego: Disolver en agua declorada tibia, mezclar bien y regar al pie del tallo.',
      'Aplicar cada 15 a 20 días durante el ciclo vegetativo para mantener la colonia microbiana activa.'
    ]
  },
  3: {
    brand: 'Namasté Nutrientes',
    origin: 'Argentina',
    cultivationStage: 'Fase Media y Avanzada de Floración (Semanas 4 a 7)',
    format: 'Líquido fertilizante PK concentrado',
    dosage: '1.5 a 3 ml por litro de agua sin cloro semanalmente.',
    phRecommended: '6.3 - 6.8',
    ecRecommended: '1.6 - 2.2 mS/cm',
    suitableFor: 'Cultivos orientados a máximo rendimiento, peso y producción de tricomas.',
    cannabisSpecs: {
      genotypeCompatibility: 'Ideal para cepas de alta producción y fenotipos resinosos.',
      budHardness: 'Engorda y compacta los cálices florales ("cogollos como piedras").',
      pkRatio: 'Fósforo (P) 10% - Potasio (K) 15% asimilables de acción rápida.',
      resinProduction: 'Estimula la producción de tricomas glandulares con alta densidad terpénica.'
    },
    keyBenefits: [
      'Aporte puro de fósforo y potasio quelatados sin exceso de sodio ni metales pesados.',
      'Acelera la maduración homogénea de las flores de abajo hacia arriba en la copa.',
      'Mejora la textura y compactación final evitando flores esponjosas.',
      'Fórmula equilibrada que previene el bloqueo de nutrientes por acumulación de sales.'
    ],
    applicationGuide: [
      'Iniciar su aplicación a partir de la 4ta semana de floración cuando los cogollos comienzan a unirse.',
      'Combinar con melazas naturales (como Trico+) para potenciar aún más la pegajosidad de la resina.',
      'Intercalar un riego con nutrientes y un riego únicamente con agua pura declorada para evitar sobrefertilizaciones.',
      'Suspender entre 10 y 14 días antes de la fecha prevista de cosecha para realizar el lavado de raíces.'
    ]
  },
  4: {
    brand: 'Namasté Nutrientes',
    origin: 'Argentina',
    cultivationStage: 'Pre-floración, Floración Completa & Final de Ciclo',
    format: 'Polvo soluble de carbohidratos y melazas puras',
    dosage: '2 a 5 gramos por litro de agua cada 7 a 10 días.',
    phRecommended: '6.0 - 6.5',
    suitableFor: 'Cultivo orgánico, biológico y mineral.',
    cannabisSpecs: {
      genotypeCompatibility: 'Universal: realza los aromas y terpenos característicos de cada cepa.',
      terpeneProfile: 'Incrementa la concentración de Mirceno, Limoneno y Cariofileno.',
      microbiologyFood: 'Nutre la flora bacteriana benéfica del suelo para una descomposición óptima.',
      energyReserve: 'Aporta azúcares simples y complejos que la planta gasta en engordar flores.'
    },
    keyBenefits: [
      'Elaborado con melazas de caña deshidratadas y extracto de Yucca que actúa como surfactante natural.',
      'Proporciona energía directa a los cálices florales para fabricar resina espesa y aromática.',
      'Endulza y suaviza el bouquet final de las flores curadas.',
      'Compatible con cualquier tabla de fertilización de marcas nacionales e importadas.'
    ],
    applicationGuide: [
      'Disolver la cantidad indicada en agua tibia (para acelerar la disolución completa) y luego llevar al volumen de riego deseado.',
      'Puede utilizarse hasta una semana antes del corte final.',
      'Es ideal para reactivar sustratos reutilizados y potenciar el té de compost.'
    ]
  },
  5: {
    brand: 'Mamboretá',
    origin: 'Argentina',
    cultivationStage: 'Uso Preventivo & Curativo en Todas las Etapas',
    format: 'Combo integral 6 frascos (Insecticidas, Fungicidas y Protectores)',
    dosage: 'Consultar prospecto individual según producto del combo.',
    suitableFor: 'Protección integral de invernaderos, carpas de cultivo interior y huertas exteriores.',
    cannabisSpecs: {
      actionSpectrum: 'Amplio espectro: insectos chupadores, masticadores, ácaros y hongos foliares.',
      targetPests: 'Trips, mosca blanca, pulgones, arañuela roja, cochinillas, oídio y botrytis.',
      comboItems: 'CONFI (sistémico), ABA (acaricida), D (fungicida), FOLI, H y Bio Oil 85E.',
      harvestSafety: 'Garantiza cosechas libres de plagas respetando tiempos de carencia especificados.'
    },
    keyBenefits: [
      'Solución integral definitiva: no necesitás comprar productos sueltos.',
      'Eficacia comprobada en cultivos intensivos de la región litoral.',
      'Incluye Bio Oil 85E para tratamientos preventivos ecológicos libres de venenos.',
      'Rendimiento superior: frascos concentrados con goteros dosificadores de precisión.'
    ],
    applicationGuide: [
      'Para prevención: Realizar aplicaciones quincenales rotando los productos para evitar generación de resistencia en las plagas.',
      'Para ataques activos: Aplicar el producto específico cada 4 o 5 días hasta erradicar la plaga.',
      'Siempre pulverizar en horario de baja intensidad lumínica (al apagarse el foco o al atardecer en exterior).'
    ]
  },
  6: {
    brand: 'Mamboretá',
    origin: 'Argentina',
    cultivationStage: 'Vegetativo y Floración Temprana',
    format: 'Líquido concentrado emulsionable con gotero',
    dosage: '10 a 15 gotas por litro de agua (0.5 a 0.75 ml/L).',
    suitableFor: 'Erradicación de plagas difíciles en indoor y exterior.',
    cannabisSpecs: {
      activeIngredient: 'Imidacloprid 35% de absorción sistémica y acción residual prolongada.',
      targetPests: 'Mosca blanca de los invernaderos, pulgones verdes/negros, cochinillas algodonosas y trips.',
      modeOfAction: 'Sistémico: penetra en el tejido celular protegiendo los brotes nuevos.',
      safetyInterval: 'Periodo de carencia: 21 días previos a la cosecha.'
    },
    keyBenefits: [
      'Acción prolongada: una sola aplicación protege a la planta durante 2 a 3 semanas.',
      'Efectivo incluso si la plaga se esconde debajo del envés de las hojas.',
      'Puede aplicarse tanto foliarmente como por riego para absorción radicular.',
      'Ideal para plantas madre y clones recién enraizados.'
    ],
    applicationGuide: [
      'Dosificar con el gotero provisto en agua tibia.',
      'Rociar cubriendo tanto la parte superior como el envés de todas las hojas.',
      'No aplicar bajo luz solar directa o lámparas de alta presión encendidas para evitar efecto lupa.'
    ]
  },
  7: {
    brand: 'Mamboretá',
    origin: 'Argentina',
    cultivationStage: 'Fase Vegetativa & Floración (Antes de la formación densa de resina)',
    format: 'Líquido acaricida de choque',
    dosage: '0.5 a 1 ml por litro de agua (15 a 20 gotas/L).',
    suitableFor: 'Ataques severos de ácaros y minadores de hojas.',
    cannabisSpecs: {
      activeIngredient: 'Abamectina de origen microbiológico puro.',
      targetPests: 'Arañuela roja (Tetranychus urticae), ácaros blancos y orugas minadoras.',
      translaminarAction: 'Penetra a través de la hoja eliminando plagas en ambas caras.',
      knockdownSpeed: 'Efecto de volteo inmediato en menos de 24 horas.'
    },
    keyBenefits: [
      'La solución más efectiva del mercado frente a la temida arañuela roja.',
      'Rompe el ciclo reproductivo del ácaro inhibiendo su alimentación.',
      'Poco nocivo para la fauna benéfica una vez que el producto se seca sobre la hoja.',
      'Frasco de 30 cm³ rinde más de 30 a 50 litros de caldo de aplicación.'
    ],
    applicationGuide: [
      'Pulverizar a punto de goteo mojando completamente la planta.',
      'Repetir una segunda aplicación a los 5 días para eliminar huevos que hayan eclosionado.',
      'Respetar un periodo de carencia mínimo de 14 a 20 días antes de la cosecha.'
    ]
  },
  8: {
    brand: 'Bio Mamboretá',
    origin: 'Argentina',
    cultivationStage: 'Todo el ciclo de cultivo (Vegetativo y Floración)',
    format: 'Aceite mineral parafínico puro emulsionable',
    dosage: '10 a 15 ml por litro de agua (1.5% v/v).',
    suitableFor: 'Cultivo 100% orgánico, sustentable y preventivo.',
    cannabisSpecs: {
      classification: 'Producto ecológico de banda verde y residuo cero.',
      modeOfAction: 'Mecánico / Físico: asfixia por contacto sin generar resistencia genética en plagas.',
      protectiveLayer: 'Crea una película lustrosa biodegradable que repele esporas fúngicas.',
      safetyInterval: 'Sin periodo de carencia químico (lavable con agua).'
    },
    keyBenefits: [
      'No genera acostumbramiento ni mutación en las plagas.',
      'Excelente adherente y humectante si se combina con otros productos orgánicos.',
      'Brinda brillo y elasticidad natural a las hojas.',
      'Apto para huertas domiciliarias y flores medicinales.'
    ],
    applicationGuide: [
      'Emulsionar primero en un vaso con un poco de agua tibia antes de agregar al pulverizador.',
      'Aplicar de forma preventiva cada 10 a 15 días durante todo el año.',
      'Evitar aplicar en horas de sol pleno o calor extremo superior a 32°C.'
    ]
  },
  9: {
    brand: 'Grower Medical',
    origin: 'Industria Nacional Argentina',
    cultivationStage: 'Curado, Cosecha & Transporte Legal de Flores',
    format: 'Contenedor hermético rígido de alta densidad (Capacidad 5gr)',
    dimensions: 'Diámetro 60 mm x Alto 40 mm',
    suitableFor: 'Pacientes registrados en el programa Reprocann / Ley 27.350.',
    cannabisSpecs: {
      uvFilter: 'Bloqueo UV-400 que previene la degradación de THC en CBN por radiación solar.',
      hermeticSeal: 'Junta de silicona médica de grado alimenticio aprobada por FDA.',
      odorProof: '100% inodoro: hermeticidad total contra escape de terpenos volátiles.',
      qrIntegration: 'Código QR grabado en relieve para trazabilidad y documentación legal de transporte.'
    },
    keyBenefits: [
      'Cumple estrictamente con las normativas vigentes de transporte medicinal seguro en la República Argentina.',
      'Mantiene la humedad relativa óptima (58%-62%) preservando la textura esponjosa de las flores.',
      'Fabricado con polímero anti-impacto irrompible ante caídas o golpes en bolsos y mochilas.',
      'Diseño discreto, profesional y compacto para llevar en el bolsillo.'
    ],
    applicationGuide: [
      'Introducir las flores una vez finalizado el secado estándar (ramas que crujen).',
      'Puede utilizarse en conjunto con sobres de control de humedad Boveda / Integra Boost de 4gr o 8gr.',
      'Mantener el contenedor cerrado en un lugar fresco para prolongar la vida útil de los terpenos por más de 12 meses.'
    ]
  },
  10: {
    brand: 'Grower Medical',
    origin: 'Industria Nacional Argentina',
    cultivationStage: 'Curado Profesional & Transporte Legal',
    format: 'Contenedor hermético de alta capacidad (GT25 y GT40)',
    dimensions: 'GT25: 85 mm x 65 mm / GT40: 110 mm x 80 mm',
    suitableFor: 'Cultivadores que requieren almacenar y transportar cantidades medianas de flores.',
    cannabisSpecs: {
      capacityRange: 'GT25 (25 gramos) / GT40 (40 gramos de flores secas manicuradas).',
      sealType: 'Tapa a rosca reforzada con doble labio de sellado al vacío.',
      uvShield: 'Cuerpo opaco con tratamiento absorbente ultravioleta total.',
      compliance: 'Homologado para la tenencia de cannabis medicinal regulada por el Ministerio de Salud.'
    },
    keyBenefits: [
      'Conserva las propiedades organolépticas, aroma original y potencia de la cosecha.',
      'El cierre hermético no permite la entrada de oxígeno ni humedad externa evitando hongos.',
      'Material libre de BPA y no desprende partículas ni olores plásticos sobre las flores.',
      'Base antideslizante y textura ergonómica de fácil agarre.'
    ],
    applicationGuide: [
      'Llenar el contenedor hasta un 75% - 80% de su capacidad sin prensar excesivamente las flores.',
      'Durante las primeras dos semanas de curado, abrir 5 a 10 minutos al día para renovar el aire interno.',
      'Luego de 1 mes de curado, mantener cerrado de forma permanente hasta su consumo medicinal.'
    ]
  },
  11: {
    brand: 'Roots Jardinería & Cultivo',
    origin: 'Argentina',
    cultivationStage: 'Riego foliar, Fertirriego & Aplicación de preventivos',
    format: 'Pulverizador manual a presión previa con boquilla metálica',
    capacity: '1 Litro con marcas de nivel en relieve',
    suitableFor: 'Carpas de cultivo indoor, microcultivos y huertas.',
    cannabisSpecs: {
      nozzleType: 'Boquilla de latón regulable: desde niebla ultrafina hasta chorro continuo.',
      pressureSystem: 'Émbolo de polipropileno de alta compresión con junta reforzada.',
      sprayAngle: 'Rango de abanico ajustable para pulverizar cómodamente el envés de las hojas.',
      safetyValve: 'Válvula de alivio automático ante sobrepresión para máxima durabilidad.'
    },
    keyBenefits: [
      'Gatillo ergonómico con botón de bloqueo para pulverizado continuo sin fatiga en la mano.',
      'Material translúcido de alta durabilidad resistente a fertilizantes y aceites agrícolas.',
      'Produce una llovizna ultrafina que no apelmaza los tricomas ni dobla los tallos jóvenes.',
      'Fácil desarmado y limpieza completa en segundos.'
    ],
    applicationGuide: [
      'Llenar con líquido hasta la marca máxima de 1 litro dejando espacio superior para el aire.',
      'Bombear el émbolo entre 10 y 15 veces hasta sentir resistencia firme.',
      'Girar la punta de bronce para regular el tipo de rocío deseado.',
      'Al terminar el uso, despresurizar tirando de la válvula de alivio para alargar la vida útil de los sellos.'
    ]
  },
  12: {
    brand: 'Roots Jardinería & Cultivo',
    origin: 'Argentina',
    cultivationStage: 'Riego habitual de sustrato en macetas',
    format: 'Regadera ergonómica con pico difusor extraíble (2L / 5L)',
    dimensions: 'Diseño compacto de cuello estilizado',
    suitableFor: 'Macetas sopladas, geotextiles (Mad Rocket / Geotextil) y canteros.',
    cannabisSpecs: {
      flowControl: 'Cuello largo y fino que permite regar al fondo de carpas indoor saturadas sin mover macetas.',
      diffuserHead: 'Flor difusora microperforada de acero inoxidable desmontable.',
      antiWashout: 'Riego suave tipo lluvia que evita el lavado y compactación del sustrato.',
      ergonomics: 'Doble punto de agarre balanceado para volcado suave sin derrames.'
    },
    keyBenefits: [
      'Fabricada en plástico virgen 100% reciclable resistente a caídas y rayos UV.',
      'No vuelca agua al inclinarla suavemente gracias al diseño de borde superior invertido.',
      'Pico largo ideal para alcanzar las macetas más alejadas en tu indoor 80x80 o 100x100.',
      'Fácil de almacenar ocupando el mínimo espacio en tu cuarto de cultivo.'
    ],
    applicationGuide: [
      'Preparar la mezcla de riego y nutrientes en el balde de preparación.',
      'Verter en la regadera y regar en círculos alrededor del tallo para estimular el avance lateral de las raíces.',
      'Limpiar con agua limpia después de aplicar fertilizantes pesados con melazas para evitar sarro en la flor.'
    ]
  }
};

/**
 * Retorna las especificaciones completas para un producto dado, combinando
 * datos existentes o generando una plantilla profesional para insumos nuevos.
 */
export const getProductDetails = (product) => {
  if (!product) return null;

  const specific = PRODUCT_TECHNICAL_SPECS[product.id] || {};

  const defaultBenefits = [
    `Insumo de primera calidad seleccionado por CultiShop para cultivadores de Posadas y toda la región.`,
    `Apto para optimizar el rendimiento y la salud de tu cultivo en exterior, indoor y huerta.`,
    `Garantía de originalidad con stock físico verificado y asesoramiento personalizado post-venta.`,
    `Embalaje discreto y seguro para retiro en local o despacho rápido por encomienda.`
  ];

  const defaultCannabisSpecs = {
    genotypeCompatibility: 'Apto para todo tipo de variedades e híbridos cannábicos.',
    cultivationStage: specific.cultivationStage || 'Vegetativo, Floración o Mantenimiento',
    environment: 'Optimizado para carpas de cultivo interior, invernaderos y exterior.',
    qualityGrade: 'Grado Agrícola Profesional para Cultivo Medicinal'
  };

  const defaultGuide = [
    'Verificar las instrucciones específicas de la etiqueta del fabricante.',
    'Almacenar en un lugar fresco, seco y al resguardo de la luz solar directa.',
    'Consultanos por WhatsApp para recibir una tabla de dosis personalizada para tu carpa o jardín.'
  ];

  return {
    brand: specific.brand || 'CultiShop Selección',
    origin: specific.origin || 'Argentina',
    cultivationStage: specific.cultivationStage || 'Todo el ciclo de cultivo',
    format: specific.format || (product.options && product.options.length > 0 ? product.options.join(', ') : 'Estándar'),
    dosage: specific.dosage || 'Consultar según fase del cultivo',
    phRecommended: specific.phRecommended || '5.8 - 6.5',
    ecRecommended: specific.ecRecommended || 'N/A',
    suitableFor: specific.suitableFor || 'Indoor, Exterior, Sustratos orgánicos y huertas.',
    cannabisSpecs: { ...defaultCannabisSpecs, ...(specific.cannabisSpecs || {}) },
    keyBenefits: specific.keyBenefits || defaultBenefits,
    applicationGuide: specific.applicationGuide || defaultGuide,
    dimensions: specific.dimensions || null,
    capacity: specific.capacity || null
  };
};
