export const PRODUCTS = [
  // Fertilizantes Namasté (Flyer 2)
  {
    id: 1,
    title: 'Oro Negro Namasté Nutrientes',
    category: 'Fertilizantes',
    badge: 'STOCK DISPONIBLE',
    badgeType: 'gold',
    description: 'Bioestimulante de crecimiento y follaje con ácidos húmicos, fúlvicos y algas.',
    price: '$14.500,00',
    options: ['100 cc', '250 cc', '500 cc'],
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 2,
    title: 'Amazonia Micorrizas Namasté',
    category: 'Fertilizantes',
    badge: 'TOP VENTAS',
    badgeType: 'green',
    description: 'Microorganismos benéficos y micorrizas para un sistema radicular explosivo.',
    price: '$16.200,00',
    options: ['150 gr', '300 gr'],
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d691a4bf5?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 3,
    title: 'Flora Booster Namasté (PK Floración)',
    category: 'Fertilizantes',
    badge: 'STOCK DISPONIBLE',
    badgeType: 'gold',
    description: 'Potenciador de floración rico en Fósforo y Potasio para flores compactas.',
    price: '$15.800,00',
    options: ['100 ml', '250 ml'],
    image: 'https://images.unsplash.com/photo-1628543606553-66239922f533?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 4,
    title: 'Trico+ Namasté (Melazas y Carbohidratos)',
    category: 'Fertilizantes',
    badge: 'STOCK DISPONIBLE',
    badgeType: 'gold',
    description: 'Aporte de carbohidratos, azúcares y energía para resina y terpenos.',
    price: '$13.900,00',
    options: ['100 gr', '250 gr'],
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400'
  },

  // Control de Plagas Mamboretá (Flyer 4)
  {
    id: 5,
    title: 'Kit Completo Contra Plagas Mamboretá',
    category: 'Kits',
    badge: 'KIT COMPLETO',
    badgeType: 'gold',
    description: 'Solución integral: D, CONFI, FOLI, ABA, H y Bio Oil 85E para proteger tu cultivo.',
    price: '$58.900,00',
    options: ['Combo 6 Productos Mamboretá'],
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 6,
    title: 'Mamboretá CONFI Sistémico',
    category: 'Control de Plagas',
    badge: 'NUEVO INGRESO',
    badgeType: 'gold',
    description: 'Control eficaz contra mosca blanca, cochinillas y pulgones por riego o follaje.',
    price: '$11.800,00',
    options: ['30 cm³'],
    image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 7,
    title: 'Mamboretá ABA Acaricida',
    category: 'Control de Plagas',
    badge: 'STOCK DISPONIBLE',
    badgeType: 'green',
    description: 'Acción de choque y penetración translaminar contra arañuela roja y minador.',
    price: '$12.900,00',
    options: ['30 cm³'],
    image: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 8,
    title: 'Bio Mamboretá OIL 85 E',
    category: 'Control de Plagas',
    badge: 'ECOLÓGICO',
    badgeType: 'green',
    description: 'Aceite refinado emulsionable apto para uso preventivo en todo el año.',
    price: '$13.200,00',
    options: ['100 cm³'],
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=400'
  },

  // Contenedores Herméticos Grower Ley 27.350 (Flyer 5)
  {
    id: 9,
    title: 'Contenedor GT5 Grower (5gr)',
    category: 'Transporte Legal',
    badge: 'LEY 27.350',
    badgeType: 'gold',
    description: 'Contenedor hermético compacto con filtro UV y código QR Ley 27.350 Reprocann.',
    price: '$8.500,00',
    options: ['5 Gramos'],
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 10,
    title: 'Contenedores GT25 / GT40 Herméticos Grower',
    category: 'Transporte Legal',
    badge: 'CURADO ÓPTIMO',
    badgeType: 'gold',
    description: 'Alto impacto con sellado hermético. Conserva terpenos, humedad y potencia.',
    price: '$18.900,00',
    options: ['25 Gramos (GT25)', '40 Gramos (GT40)'],
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400'
  },

  // Herramientas y Riego Roots (Flyer 3)
  {
    id: 11,
    title: 'Pulverizador a Presión 1L Roots',
    category: 'Riego',
    badge: 'ALTA DURABILIDAD',
    badgeType: 'green',
    description: 'Válvula de compresión con boquilla metálica regulable para rociado uniforme.',
    price: '$15.400,00',
    options: ['1 Litro'],
    image: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 12,
    title: 'Regadera Ergonómica Roots',
    category: 'Riego',
    badge: 'STOCK DISPONIBLE',
    badgeType: 'gold',
    description: 'Regadera liviana y resistente con pico difusor para riego suave de sustrato.',
    price: '$10.200,00',
    options: ['2 Litros', '5 Litros'],
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d691a4bf5?auto=format&fit=crop&q=80&w=400'
  }
];

