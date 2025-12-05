export interface Medication {
  id: number;
  name: string;
  dose: string;
  price: number;
  originalPrice?: number;
  status?: 'proximo' | 'menor_valor';
  image?: string;
}

// Nomes de medicamentos comuns
const medicationNames = [
  'Dipirona',
  'Ibuprofen',
  'Amoxicilina',
  'Omeprazol',
  'Cetoconazol',
  'Azitromicina',
  'Atorvastatina',
  'Losartana',
  'Metformina',
  'Fluoxetina',
  'Paracetamol',
  'Naproxeno',
  'Nimesulida',
  'Cefalexina',
  'Ciprofloxacino',
  'Levotiroxina',
  'Atorvastatina',
  'Enalapril',
  'Glibenclamida',
  'Propranolol',
];

// Gerar 20 medicamentos aleatórios
export const generateMedications = (): Medication[] => {
  const medications: Medication[] = [];
  
  for (let i = 1; i <= 20; i++) {
    const basePrice = Math.floor(Math.random() * 80) + 10; // R$ 10 a 90
    const originalPrice = basePrice + Math.floor(Math.random() * 20);
    const randomStatus = Math.random() > 0.85 ? (Math.random() > 0.5 ? 'proximo' : 'menor_valor') : undefined;
    
    medications.push({
      id: i,
      name: medicationNames[Math.floor(Math.random() * medicationNames.length)],
      dose: '20g',
      price: basePrice,
      originalPrice: randomStatus ? originalPrice : undefined,
      status: randomStatus,
    });
  }
  
  return medications;
};

export const medications = generateMedications();
