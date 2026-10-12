export const PRODUCTS = [
  // Fertilizantes Namasté (Flyer 2)
  {
    id: 1,
    title: 'Oro Negro Namasté Nutrientes',
    category: 'Fertilizantes',
    badge: 'STOCK DISPONIBLE',
    badgeType: 'gold',
    stock: 25,
    description: 'Bioestimulante de crecimiento y follaje con ácidos húmicos, fúlvicos y algas.',
    price: '$6.000,00',
    options: [
      { name: '100 cc', price: 6000 },
      { name: '250 cc', price: 14500 },
      { name: '500 cc', price: 28000 }
    ],
    image: 'https://images.unsplash.com/photo-1624990833801-56c1b6a56ba7?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 2,
    title: 'Amazonia Micorrizas Namasté',
    category: 'Fertilizantes',
    badge: 'TOP VENTAS',
    badgeType: 'green',
    stock: 18,
    description: 'Microorganismos benéficos y micorrizas para un sistema radicular explosivo.',
    price: '$16.200,00',
    options: [
      { name: '150 gr', price: 16200 },
      { name: '300 gr', price: 31000 }
    ],
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 3,
    title: 'Flora Booster Namasté (PK Floración)',
    category: 'Fertilizantes',
    badge: 'STOCK DISPONIBLE',
    badgeType: 'gold',
    stock: 20,
    description: 'Potenciador de floración rico en Fósforo y Potasio para flores compactas.',
    price: '$7.500,00',
    options: [
      { name: '100 ml', price: 7500 },
      { name: '250 ml', price: 15800 },
      { name: '1 Litro', price: 46200 }
    ],
    image: 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 4,
    title: 'Trico+ Namasté (Melazas y Carbohidratos)',
    category: 'Fertilizantes',
    badge: 'STOCK DISPONIBLE',
    badgeType: 'gold',
    stock: 15,
    description: 'Aporte de carbohidratos, azúcares y energía para resina y terpenos.',
    price: '$6.200,00',
    options: [
      { name: '100 gr', price: 6200 },
      { name: '250 gr', price: 13900 }
    ],
    image: 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&q=80&w=600'
  },

  // Control de Plagas Mamboretá (Flyer 4)
  {
    id: 5,
    title: 'Kit Completo Contra Plagas Mamboretá',
    category: 'Kits',
    badge: 'KIT COMPLETO',
    badgeType: 'gold',
    stock: 10,
    description: 'Solución integral: D, CONFI, FOLI, ABA, H y Bio Oil 85E para proteger tu cultivo.',
    price: '$58.900,00',
    options: [{ name: 'Combo 6 Productos Mamboretá', price: 58900 }],
    image: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 6,
    title: 'Mamboretá CONFI Sistémico',
    category: 'Control de Plagas',
    badge: 'NUEVO INGRESO',
    badgeType: 'gold',
    stock: 22,
    description: 'Control eficaz contra mosca blanca, cochinillas y pulgones por riego o follaje.',
    price: '$11.800,00',
    options: [{ name: '30 cm³', price: 11800 }],
    image: 'https://images.unsplash.com/photo-1536257104079-aa99c6460a5a?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 7,
    title: 'Mamboretá ABA Acaricida',
    category: 'Control de Plagas',
    badge: 'STOCK DISPONIBLE',
    badgeType: 'green',
    stock: 14,
    description: 'Acción de choque y penetración translaminar contra arañuela roja y minador.',
    price: '$12.900,00',
    options: [{ name: '30 cm³', price: 12900 }],
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 8,
    title: 'Bio Mamboretá OIL 85 E',
    category: 'Control de Plagas',
    badge: 'ECOLÓGICO',
    badgeType: 'green',
    stock: 12,
    description: 'Aceite refinado emulsionable apto para uso preventivo en todo el año.',
    price: '$13.200,00',
    options: [{ name: '100 cm³', price: 13200 }],
    image: 'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&q=80&w=600'
  },

  // Contenedores Herméticos Grower Ley 27.350 (Flyer 5)
  {
    id: 9,
    title: 'Contenedor GT5 Grower (5gr)',
    category: 'Transporte Legal',
    badge: 'LEY 27.350',
    badgeType: 'gold',
    stock: 30,
    description: 'Contenedor hermético compacto con filtro UV y código QR Ley 27.350 Reprocann.',
    price: '$8.500,00',
    options: [{ name: '5 Gramos', price: 8500 }],
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 10,
    title: 'Contenedores GT25 / GT40 Herméticos Grower',
    category: 'Transporte Legal',
    badge: 'CURADO ÓPTIMO',
    badgeType: 'gold',
    stock: 20,
    description: 'Alto impacto con sellado hermético. Conserva terpenos, humedad y potencia.',
    price: '$18.900,00',
    options: [
      { name: '25 Gramos (GT25)', price: 18900 },
      { name: '40 Gramos (GT40)', price: 26500 }
    ],
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=600'
  },

  // Herramientas y Riego Roots (Flyer 3)
  {
    id: 11,
    title: 'Pulverizador a Presión 1L Roots',
    category: 'Riego',
    badge: 'ALTA DURABILIDAD',
    badgeType: 'green',
    stock: 16,
    description: 'Válvula de compresión con boquilla metálica regulable para rociado uniforme.',
    price: '$15.400,00',
    options: [{ name: '1 Litro', price: 15400 }],
    image: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 12,
    title: 'Regadera Ergonómica Roots',
    category: 'Riego',
    badge: 'STOCK DISPONIBLE',
    badgeType: 'gold',
    stock: 8,
    description: 'Regadera liviana y resistente con pico difusor para riego suave de sustrato.',
    price: '$10.200,00',
    options: [
      { name: '2 Litros', price: 10200 },
      { name: '5 Litros', price: 18400 }
    ],
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=600'
  },

  // Producto Sin Stock de Ejemplo
  {
    id: 13,
    title: 'Medidor Digital pH & Temperatura Adwa AD11',
    category: 'Medición',
    badge: 'SIN STOCK',
    badgeType: 'red',
    stock: 0,
    description: 'Medidor profesional impermeable con electrodo reemplazable y calibración automática.',
    price: '$64.900,00',
    options: [{ name: 'Kit Medidor + Solución Buffer', price: 64900 }],
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600'
  }
];

