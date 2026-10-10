/**
 * Demo catalogue. `fits` entries are "Make|Model|generationStartYear[|engine[|yearFrom[|yearTo]]]".
 * Fitment years default to the model generation's years.
 */
export type SeedProduct = {
  part: string
  vehicleLabel?: string
  oem: string
  brand: string
  condition: 'genuine' | 'oem' | 'aftermarket'
  category: string
  price: number
  compareAt?: number
  workshop?: number
  cost: number
  stock: number
  fits: string[]
  universal?: boolean
  specs?: Array<[string, string]>
  warranty?: string
  tags?: string[]
  featured?: boolean
  bestSeller?: boolean
  crossRefs?: Array<[string, string]>
  blurb: string
}

const COROLLA = 'Toyota|Corolla|2014'
const COROLLA_OLD = 'Toyota|Corolla|2009'
const CIVIC = 'Honda|Civic|2016'
const SPORTAGE = 'Kia|Sportage|2019'
const A4 = 'Audi|A4|2016'

export const PRODUCTS: SeedProduct[] = [
  // ——— Toyota Corolla 2014–2022 ———
  {
    part: 'Front Brake Pads', vehicleLabel: 'Toyota Corolla [14–22]', oem: '04465-02220', brand: 'Hitachi', condition: 'oem',
    category: 'Brake Pads', price: 8425, compareAt: 9200, workshop: 7600, cost: 6100, stock: 34, fits: [COROLLA, 'Toyota|Corolla|2009'],
    specs: [['Position', 'Front axle'], ['Material', 'Low-metallic NAO'], ['Wear indicator', 'Acoustic'], ['Pieces', '4']],
    warranty: '6 months / 10,000 km', tags: ['brake ki pads', 'brake pad', 'break pads'], featured: true, bestSeller: true,
    crossRefs: [['04465-12610', 'Toyota'], ['HP5236', 'Hitachi']],
    blurb: 'OEM-grade Hitachi front pads with quiet low-metallic compound, matched to the Corolla’s factory calipers.',
  },
  {
    part: 'Rear Brake Shoes', vehicleLabel: 'Toyota Corolla [14–22]', oem: '04495-02140', brand: 'Genuine', condition: 'genuine',
    category: 'Brake Shoes', price: 6250, workshop: 5600, cost: 4400, stock: 18, fits: [COROLLA],
    specs: [['Position', 'Rear drum'], ['Pieces', '4']], warranty: '6 months', tags: ['brake shoe', 'peechay brake'],
    blurb: 'Genuine Toyota rear shoes for drum-brake Corolla variants (GLi / XLi).',
  },
  {
    part: 'Oil Filter', vehicleLabel: 'Toyota Corolla / Yaris / Vitz', oem: '90915-YZZE1', brand: 'Genuine', condition: 'genuine',
    category: 'Oil Filters', price: 1150, workshop: 980, cost: 720, stock: 120,
    fits: [COROLLA, COROLLA_OLD, 'Toyota|Yaris|2019', 'Toyota|Vitz|2014', 'Toyota|Vitz|2019', 'Toyota|Premio|2007', 'Toyota|Aqua|2012'],
    specs: [['Thread', 'M20 x 1.5'], ['Height', '66 mm'], ['Bypass valve', 'Yes']], tags: ['oil filter', 'tail filter', 'oil ka filter'],
    bestSeller: true, crossRefs: [['W 68/3', 'Mann'], ['OC 217', 'Mahle']],
    blurb: 'The genuine Toyota spin-on filter. Change it with every oil change — every 5,000 km in Pakistani conditions.',
  },
  {
    part: 'Air Filter', vehicleLabel: 'Toyota Corolla [14–22]', oem: '17801-0T020', brand: 'Denso', condition: 'oem',
    category: 'Air Filters', price: 2450, workshop: 2150, cost: 1600, stock: 46, fits: [COROLLA, 'Toyota|Yaris|2019'],
    specs: [['Type', 'Panel'], ['Length', '254 mm'], ['Width', '178 mm']], tags: ['air filter', 'hawa filter'], bestSeller: true,
    blurb: 'Denso OE panel filter that keeps dust out of the 1.6/1.8 Dual VVT-i engine — vital on dusty Pakistani roads.',
  },
  {
    part: 'Cabin AC Filter', vehicleLabel: 'Toyota Corolla [14–22]', oem: '87139-02090', brand: 'Denso', condition: 'oem',
    category: 'Cabin AC Filters', price: 1850, workshop: 1600, cost: 1150, stock: 52, fits: [COROLLA, 'Toyota|Yaris|2019', 'Toyota|Fortuner|2016'],
    specs: [['Type', 'Activated carbon'], ['Layers', '3']], tags: ['ac filter', 'cabin filter'],
    blurb: 'Activated-carbon cabin filter that traps dust, smog and smells — noticeably fresher AC in summer.',
  },
  {
    part: 'Iridium Spark Plugs (Set of 4)', vehicleLabel: 'Toyota Corolla [14–22]', oem: '90919-01253', brand: 'Denso', condition: 'oem',
    category: 'Spark Plugs', price: 9800, compareAt: 10800, workshop: 8900, cost: 7200, stock: 25, fits: [COROLLA, COROLLA_OLD, 'Toyota|Yaris|2019'],
    specs: [['Denso code', 'SC16HR11'], ['Gap', '1.1 mm'], ['Life', '100,000 km']], tags: ['plug', 'spark plug', 'plugs'], featured: true,
    blurb: 'Long-life Denso iridium plugs: smoother idle, quicker starts and better fuel average.',
  },
  {
    part: 'Front Shock Absorber (Right)', vehicleLabel: 'Toyota Corolla [14–22]', oem: '48510-09Q70', brand: 'Genuine', condition: 'genuine',
    category: 'Shocks', price: 18900, workshop: 17200, cost: 14100, stock: 8, fits: [COROLLA],
    specs: [['Position', 'Front right'], ['Type', 'Gas-filled strut']], warranty: '12 months', tags: ['shocks', 'shock', 'jhatka'],
    blurb: 'Factory-spec gas strut that restores the Corolla’s ride and stops nose-dive under braking.',
  },
  {
    part: 'Engine Mounting (Right)', vehicleLabel: 'Toyota Corolla [14–22]', oem: '12305-0T150', brand: 'Genuine', condition: 'genuine',
    category: 'Engine Mountings', price: 14200, workshop: 12900, cost: 10400, stock: 6, fits: [COROLLA],
    specs: [['Side', 'Right (timing side)'], ['Type', 'Hydraulic']], warranty: '6 months', tags: ['engine mount', 'mounting'],
    blurb: 'Hydraulic mount that kills idle vibration — the usual fix for a shaking steering wheel at signals.',
  },
  {
    part: 'LED Headlight Assembly (Right)', vehicleLabel: 'Toyota Corolla [17–22]', oem: '81110-02P10', brand: 'Genuine', condition: 'genuine',
    category: 'Headlights', price: 68500, workshop: 64000, cost: 55000, stock: 3, fits: [`${COROLLA}|1.8 Altis Grande|2017`],
    specs: [['Side', 'Right / driver'], ['Type', 'LED with DRL'], ['Includes', 'Housing, lens, LED modules']], warranty: '6 months', tags: ['headlight', 'light'],
    featured: true, blurb: 'Complete genuine LED headlamp for the facelift Altis Grande — perfect fit, factory beam pattern.',
  },
  {
    part: 'Water Pump', vehicleLabel: 'Toyota Corolla [14–22]', oem: '16100-09P20', brand: 'Genuine', condition: 'genuine',
    category: 'Water Pumps', price: 16800, workshop: 15300, cost: 12400, stock: 7, fits: [COROLLA, COROLLA_OLD],
    specs: [['Drive', 'Belt'], ['Gasket', 'Included']], warranty: '6 months', tags: ['water pump', 'pani pump'],
    blurb: 'Genuine pump with gasket. Replace at the first sign of coolant loss or a whining belt.',
  },
  {
    part: 'Radiator', vehicleLabel: 'Toyota Corolla [14–22] Automatic', oem: '16400-0T040', brand: 'Denso', condition: 'oem',
    category: 'Radiators', price: 24500, compareAt: 27500, workshop: 22800, cost: 18900, stock: 5, fits: [COROLLA],
    specs: [['Core', 'Aluminium'], ['Transmission', 'CVT / automatic']], warranty: '12 months', tags: ['radiator', 'redator'],
    blurb: 'Denso aluminium-core radiator built for Lahore summers. Includes integrated CVT oil cooler.',
  },
  {
    part: 'Toyota Motor Oil 0W-20 (4L)', vehicleLabel: 'Toyota petrol engines', oem: '08880-83265', brand: 'Genuine', condition: 'genuine',
    category: 'Engine Oil', price: 8900, workshop: 8200, cost: 6900, stock: 60,
    fits: [COROLLA, 'Toyota|Yaris|2019', 'Toyota|Aqua|2012', 'Toyota|Prius|2016', 'Toyota|C-HR|2017'],
    specs: [['Grade', '0W-20 fully synthetic'], ['Volume', '4 litres'], ['API', 'SP']], tags: ['engine oil', 'mobil', 'oil'], bestSeller: true,
    blurb: 'Genuine Toyota fully synthetic 0W-20 for Dual VVT-i and hybrid engines.',
  },
  {
    part: 'Aerotwin Wiper Blades (Pair)', vehicleLabel: 'Toyota Corolla [14–22]', oem: 'A 296 S', brand: 'Bosch', condition: 'aftermarket',
    category: 'Wiper Blades', price: 4900, workshop: 4400, cost: 3300, stock: 30, fits: [COROLLA],
    specs: [['Sizes', '26" + 14"'], ['Type', 'Flat blade']], tags: ['wiper', 'vipers'],
    blurb: 'Bosch flat blades with streak-free wipe and quiet operation through monsoon rain.',
  },
  {
    part: 'Front Bumper', vehicleLabel: 'Toyota Corolla [17–22]', oem: '52119-02J10', brand: 'Genuine', condition: 'genuine',
    category: 'Front Bumper', price: 32000, workshop: 30000, cost: 25500, stock: 2, fits: [`${COROLLA}||2017`],
    specs: [['Finish', 'Unpainted primer'], ['Facelift', '2017–2022']], tags: ['bumper', 'agla bumper'],
    blurb: 'Genuine facelift bumper cover in primer, ready for paint matching.',
  },
  {
    part: 'Side Mirror (Right, Power Fold)', vehicleLabel: 'Toyota Corolla [14–22]', oem: '87910-02F90', brand: 'Genuine', condition: 'genuine',
    category: 'Side Mirrors', price: 28500, workshop: 26800, cost: 22100, stock: 4, fits: [COROLLA],
    specs: [['Side', 'Right'], ['Features', 'Power fold, indicator']], tags: ['mirror', 'side mirror', 'sheesha'],
    blurb: 'Complete genuine power-fold mirror with built-in indicator.',
  },
  {
    part: 'Super Long Life Coolant (Pink, 4L)', vehicleLabel: 'Toyota & Lexus', oem: '08889-80140', brand: 'Genuine', condition: 'genuine',
    category: 'Coolant', price: 5600, workshop: 5100, cost: 4100, stock: 40,
    fits: [COROLLA, COROLLA_OLD, 'Toyota|Yaris|2019', 'Toyota|Fortuner|2016', 'Toyota|Hilux Revo|2016', 'Lexus|LX570|2008'],
    specs: [['Type', 'Pre-mixed 50/50'], ['Volume', '4 litres']], tags: ['coolant', 'radiator water'],
    blurb: 'Pre-mixed genuine coolant — no mixing needed. Protects against overheating and corrosion.',
  },
  {
    part: 'Floor Mats (Set of 5)', vehicleLabel: 'Toyota Corolla [14–22]', oem: 'PZ49X-02130', brand: 'Genuine', condition: 'genuine',
    category: 'Floor Mats', price: 7500, compareAt: 8900, cost: 4800, stock: 15, fits: [COROLLA],
    specs: [['Material', 'Rubber + carpet'], ['Pieces', '5']], tags: ['mats', 'floor mat'],
    blurb: 'Tailored genuine mats with anti-slip backing and Corolla logo.',
  },

  // ——— Honda Civic 2016–2021 ———
  {
    part: 'Front Brake Pads', vehicleLabel: 'Honda Civic [16–21]', oem: '45022-TBA-A01', brand: 'Brembo', condition: 'aftermarket',
    category: 'Brake Pads', price: 11900, compareAt: 13200, workshop: 10800, cost: 8600, stock: 22, fits: [CIVIC, 'Honda|Civic|2022'],
    specs: [['Brembo code', 'P 28 079'], ['Position', 'Front'], ['Material', 'Ceramic']], warranty: '6 months / 10,000 km',
    tags: ['brake ki pads', 'brake pads civic'], featured: true, bestSeller: true,
    blurb: 'Brembo ceramic pads: strong bite, low dust and quiet stops for the 10th-gen Civic.',
  },
  {
    part: 'Oil Filter', vehicleLabel: 'Honda Civic / City', oem: '15400-RTA-003', brand: 'Genuine', condition: 'genuine',
    category: 'Oil Filters', price: 1350, workshop: 1150, cost: 850, stock: 140,
    fits: [CIVIC, 'Honda|Civic|2012', 'Honda|Civic|2008', 'Honda|City|2009', 'Honda|City|2021', 'Honda|BR-V|2017', 'Honda|Vezel|2014'],
    specs: [['Thread', '3/4"-16 UNF'], ['Height', '75 mm']], tags: ['oil filter', 'tail filter'], bestSeller: true,
    crossRefs: [['W 610/6', 'Mann']], blurb: 'Genuine Honda filter that fits almost every Honda on Pakistani roads.',
  },
  {
    part: 'Air Filter', vehicleLabel: 'Honda Civic [16–21] 1.8', oem: '17220-5BA-A00', brand: 'Mann', condition: 'aftermarket',
    category: 'Air Filters', price: 3100, workshop: 2750, cost: 2100, stock: 28, fits: [`${CIVIC}|1.8 i-VTEC`],
    specs: [['Mann code', 'C 2433'], ['Type', 'Panel']], tags: ['air filter'],
    blurb: 'German-made Mann filter with high dust capacity for the R18 engine.',
  },
  {
    part: 'Cabin AC Filter', vehicleLabel: 'Honda Civic [16–21]', oem: '80292-TBA-A11', brand: 'Mahle', condition: 'aftermarket',
    category: 'Cabin AC Filters', price: 2200, workshop: 1950, cost: 1400, stock: 35, fits: [CIVIC, 'Honda|City|2021'],
    specs: [['Mahle code', 'LAK 1203'], ['Type', 'Activated carbon']], tags: ['ac filter'],
    blurb: 'Mahle carbon cabin filter — fresh air and stronger AC flow.',
  },
  {
    part: 'Laser Iridium Spark Plugs (Set of 4)', vehicleLabel: 'Honda Civic / City', oem: '12290-R48-H01', brand: 'NGK', condition: 'oem',
    category: 'Spark Plugs', price: 12400, workshop: 11300, cost: 9100, stock: 20, fits: ['Honda|Civic|2012', 'Honda|Civic|2008', 'Honda|City|2009', 'Honda|City|2021'],
    specs: [['NGK code', 'IZFR6K-11'], ['Gap', '1.1 mm']], tags: ['plug', 'spark plug'],
    blurb: 'NGK Laser Iridium — the plug Honda fits at the factory.',
  },
  {
    part: 'Front Lower Control Arm (Left)', vehicleLabel: 'Honda Civic [16–21]', oem: '51360-TBA-A02', brand: 'Genuine', condition: 'genuine',
    category: 'Control Arms', price: 21500, workshop: 19800, cost: 16200, stock: 5, fits: [CIVIC],
    specs: [['Side', 'Front left'], ['Includes', 'Bushes + ball joint']], warranty: '12 months', tags: ['control arm', 'lower arm', 'bazoo'],
    blurb: 'Complete genuine arm with pressed-in bushes and ball joint — cures knocking over speed breakers.',
  },
  {
    part: 'LED Taillight (Left, Outer)', vehicleLabel: 'Honda Civic [16–21]', oem: '33550-TBA-A01', brand: 'Genuine', condition: 'genuine',
    category: 'Taillights', price: 38000, workshop: 35500, cost: 29800, stock: 3, fits: [CIVIC],
    specs: [['Side', 'Left outer'], ['Type', 'LED']], tags: ['back light', 'tail light'],
    blurb: 'Genuine C-shaped LED tail lamp for the X-generation Civic.',
  },
  {
    part: 'CVT Fluid HCF-2 (3.5L)', vehicleLabel: 'Honda CVT models', oem: '08260-99907', brand: 'Genuine', condition: 'genuine',
    category: 'Transmission Oil', price: 4800, workshop: 4400, cost: 3500, stock: 48, fits: [CIVIC, 'Honda|City|2021', 'Honda|Vezel|2014', 'Honda|HR-V|2022'],
    specs: [['Type', 'HCF-2'], ['Volume', '3.5 litres']], tags: ['gear oil', 'cvt oil', 'transmission oil'],
    blurb: 'Only genuine HCF-2 protects Honda CVT belts — never use generic ATF.',
  },
  {
    part: 'AC Compressor', vehicleLabel: 'Honda Civic [16–21] 1.8', oem: '38810-5AA-A02', brand: 'Denso', condition: 'oem',
    category: 'Compressors', price: 98000, compareAt: 109000, workshop: 92000, cost: 78000, stock: 2, fits: [`${CIVIC}|1.8 i-VTEC`],
    specs: [['Type', 'Variable displacement'], ['Refrigerant', 'R-134a']], warranty: '12 months', tags: ['ac compressor', 'compressor'],
    blurb: 'Denso OE compressor — the same unit Honda installs, with a full year’s warranty.',
  },
  {
    part: 'S4 55D23L Car Battery (60Ah)', vehicleLabel: 'Corolla / Civic / City', oem: '0092S40050', brand: 'Bosch', condition: 'aftermarket',
    category: 'Batteries', price: 28500, workshop: 27000, cost: 23500, stock: 14, fits: [COROLLA, COROLLA_OLD, CIVIC, 'Honda|City|2021', 'Honda|Civic|2012'],
    specs: [['Capacity', '60 Ah'], ['CCA', '500 A'], ['Terminal', 'Left (L)']], warranty: '12 months replacement', tags: ['battery', 'batri'],
    blurb: 'Maintenance-free Bosch battery with strong cold-crank power and a 12-month replacement warranty.',
  },

  // ——— Kia Sportage 2019– ———
  {
    part: 'Front Brake Pads', vehicleLabel: 'Kia Sportage [19–]', oem: '58101-D3A10', brand: 'Genuine', condition: 'genuine',
    category: 'Brake Pads', price: 13800, workshop: 12600, cost: 10100, stock: 16, fits: [SPORTAGE, 'Hyundai|Tucson|2020'],
    specs: [['Position', 'Front'], ['Pieces', '4']], warranty: '6 months', tags: ['brake ki pads', 'sportage brake'], bestSeller: true,
    blurb: 'Genuine Kia/Hyundai pads for Sportage and Tucson.',
  },
  {
    part: 'Oil Filter', vehicleLabel: 'Kia / Hyundai 2.0', oem: '26300-35505', brand: 'Hengst', condition: 'aftermarket',
    category: 'Oil Filters', price: 1450, workshop: 1250, cost: 900, stock: 90,
    fits: [SPORTAGE, 'Hyundai|Tucson|2020', 'Hyundai|Elantra|2021', 'Hyundai|Sonata|2021', 'Kia|Sorento|2021', 'Kia|Stonic|2021'],
    specs: [['Hengst code', 'H17W17'], ['Thread', 'M20 x 1.5']], tags: ['oil filter'], bestSeller: true,
    blurb: 'Hengst German filter media for Kia and Hyundai Nu/Theta engines.',
  },
  {
    part: 'Air Filter', vehicleLabel: 'Kia Sportage [19–]', oem: '28113-D3300', brand: 'Mann', condition: 'aftermarket',
    category: 'Air Filters', price: 3600, workshop: 3200, cost: 2400, stock: 24, fits: [SPORTAGE, 'Hyundai|Tucson|2020'],
    specs: [['Mann code', 'C 26 017'], ['Type', 'Panel']], tags: ['air filter'],
    blurb: 'Mann panel filter for the 2.0 MPI Sportage and Tucson.',
  },
  {
    part: 'Engine Mounting (Right)', vehicleLabel: 'Kia Sportage [19–]', oem: '21810-D3100', brand: 'Onnuri', condition: 'aftermarket',
    category: 'Engine Mountings', price: 14500, workshop: 13100, cost: 10200, stock: 6, fits: [SPORTAGE, 'Hyundai|Tucson|2020'],
    specs: [['Side', 'Right'], ['Type', 'Hydraulic']], warranty: '6 months', tags: ['engine mount'],
    blurb: 'Korean-made Onnuri mount, built to Hyundai-Kia specification.',
  },
  {
    part: 'Rear Shock Absorber', vehicleLabel: 'Kia Sportage [19–]', oem: '55311-D3100', brand: 'Genuine', condition: 'genuine',
    category: 'Shocks', price: 19500, workshop: 17900, cost: 14600, stock: 6, fits: [SPORTAGE],
    specs: [['Position', 'Rear (left or right)'], ['Type', 'Gas']], warranty: '12 months', tags: ['shock', 'shocks'],
    blurb: 'Genuine rear damper — fits either side.',
  },
  {
    part: 'LED Headlight Assembly (Left)', vehicleLabel: 'Kia Sportage [19–]', oem: '92101-D3510', brand: 'Genuine', condition: 'genuine',
    category: 'Headlights', price: 125000, workshop: 118000, cost: 101000, stock: 1, fits: [SPORTAGE],
    specs: [['Side', 'Left / passenger'], ['Type', 'LED projector']], warranty: '6 months', tags: ['headlight'],
    blurb: 'Complete genuine LED headlamp for the Pakistan-assembled Sportage AWD/FWD.',
  },
  {
    part: 'Radiator', vehicleLabel: 'Kia Sportage [19–]', oem: '25310-D3100', brand: 'Nissens', condition: 'aftermarket',
    category: 'Radiators', price: 36500, workshop: 33900, cost: 27800, stock: 3, fits: [SPORTAGE, 'Hyundai|Tucson|2020'],
    specs: [['Nissens code', '675043'], ['Core', 'Aluminium / plastic tanks']], warranty: '12 months', tags: ['radiator'],
    blurb: 'Danish Nissens radiator — OE-quality cooling at a better price.',
  },

  // ——— Audi A4 B9 ———
  {
    part: 'Front Brake Discs (Pair)', vehicleLabel: 'Audi A4 [16–23]', oem: '8W0615301', brand: 'Brembo', condition: 'aftermarket',
    category: 'Rotors & Brake Discs', price: 62000, compareAt: 69000, workshop: 57500, cost: 47000, stock: 4, fits: [A4, 'Audi|A5|2017'],
    specs: [['Brembo code', '09.C935.11'], ['Diameter', '338 mm'], ['Type', 'Vented, UV-coated']], warranty: '12 months',
    tags: ['disc', 'rotor', 'brake disc'], featured: true,
    blurb: 'Brembo UV-coated vented discs — corrosion-proof and perfectly balanced.',
  },
  {
    part: 'Front Brake Pads', vehicleLabel: 'Audi A4 [16–23]', oem: '8W0698151', brand: 'Brembo', condition: 'aftermarket',
    category: 'Brake Pads', price: 38500, workshop: 35500, cost: 28400, stock: 7, fits: [A4, 'Audi|A5|2017', 'Audi|Q5|2017'],
    specs: [['Brembo code', 'P 85 153'], ['Wear sensor', 'Electronic (sold separately)']], warranty: '6 months',
    tags: ['brake ki pads', 'audi brake pads'],
    blurb: 'Premium Brembo pads for MLB-Evo Audis — the natural partner to Brembo discs.',
  },
  {
    part: 'Oil Filter', vehicleLabel: 'Audi 2.0 TFSI', oem: '06L115562B', brand: 'Mahle', condition: 'oem',
    category: 'Oil Filters', price: 4200, workshop: 3800, cost: 2900, stock: 30, fits: [A4, 'Audi|A5|2017', 'Audi|A6|2019', 'Audi|Q5|2017', 'Audi|Q7|2016'],
    specs: [['Mahle code', 'OX 787D'], ['Type', 'Cartridge with O-rings']], tags: ['oil filter'],
    blurb: 'Mahle supplies this cartridge to Audi — O-rings included.',
  },
  {
    part: 'Air Filter', vehicleLabel: 'Audi A4 [16–23]', oem: '8W0133843', brand: 'Mahle', condition: 'oem',
    category: 'Air Filters', price: 7800, workshop: 7100, cost: 5400, stock: 12, fits: [A4, 'Audi|A5|2017'],
    specs: [['Mahle code', 'LX 3778'], ['Type', 'Panel']], tags: ['air filter'],
    blurb: 'OE Mahle panel filter for the A4 and A5.',
  },
  {
    part: 'Ignition Coil', vehicleLabel: 'Audi 2.0 / 1.4 TFSI', oem: '06H905110L', brand: 'Bosch', condition: 'oem',
    category: 'Ignition Coils', price: 14500, workshop: 13200, cost: 10500, stock: 16, fits: [A4, 'Audi|A3|2013', 'Audi|A5|2017', 'Audi|Q5|2017'],
    specs: [['Bosch code', '0 986 221 059'], ['Sold as', 'Single coil']], warranty: '12 months', tags: ['coil', 'ignition coil'],
    blurb: 'Bosch OE coil — the cure for misfire codes P0301–P0304.',
  },
  {
    part: 'Timing Chain Kit', vehicleLabel: 'Audi 2.0 TFSI', oem: '06K109158AD', brand: 'INA', condition: 'oem',
    category: 'Belts & Chains', price: 115000, workshop: 106000, cost: 88000, stock: 2, fits: [A4, 'Audi|A5|2017', 'Audi|Q5|2017'],
    specs: [['INA code', '559 0187 10'], ['Includes', 'Chains, tensioners, guides, sprockets']], warranty: '12 months',
    tags: ['timing chain', 'chain kit'], featured: true,
    blurb: 'Complete INA kit for the EA888 Gen 3 — everything needed for a proper timing job.',
  },
  {
    part: 'Front Wheel Hub Bearing', vehicleLabel: 'Audi A4 [16–23]', oem: '8W0498625', brand: 'FAG Schaeffler', condition: 'oem',
    category: 'Wheel Hubs', price: 42000, workshop: 38800, cost: 31000, stock: 4, fits: [A4, 'Audi|A5|2017', 'Audi|Q5|2017'],
    specs: [['FAG code', '713 6108 50'], ['ABS sensor ring', 'Integrated']], warranty: '12 months', tags: ['bearing', 'hub', 'wheel bearing'],
    blurb: 'FAG OE hub unit with integrated ABS ring — fixes humming at highway speeds.',
  },
  {
    part: 'Engine Oil 5W-30 LongLife III (5L)', vehicleLabel: 'Audi / VW (504 00)', oem: 'G 052 195 M4', brand: 'Genuine', condition: 'genuine',
    category: 'Engine Oil', price: 16500, workshop: 15400, cost: 12600, stock: 20, fits: [A4, 'Audi|A3|2013', 'Audi|A5|2017', 'Audi|A6|2019', 'Audi|Q5|2017', 'Audi|Q7|2016'],
    specs: [['Spec', 'VW 504 00 / 507 00'], ['Volume', '5 litres']], tags: ['engine oil', 'audi oil'],
    blurb: 'Genuine Audi LongLife III oil — required for flexible service intervals.',
  },

  // ——— Universal accessories ———
  {
    part: 'Europa Twin Horn 12V', vehicleLabel: 'Universal', oem: '0986AH0503', brand: 'Bosch', condition: 'aftermarket',
    category: 'Horns', price: 4200, workshop: 3800, cost: 2700, stock: 40, fits: [], universal: true,
    specs: [['Voltage', '12 V'], ['Sound', '110 dB, high + low tone']], warranty: '12 months', tags: ['horn', 'baja', 'pom pom'],
    blurb: 'Loud, rich twin-tone Bosch horns that fit any 12V car.',
  },
  {
    part: 'Premium Car Shampoo & Wax (1L)', vehicleLabel: 'Universal', oem: 'PY-CARE-01', brand: 'Bosch', condition: 'aftermarket',
    category: 'Car Care', price: 1650, compareAt: 1950, cost: 900, stock: 75, fits: [], universal: true,
    specs: [['Volume', '1 litre'], ['pH', 'Neutral']], tags: ['shampoo', 'car wash', 'polish'],
    blurb: 'pH-neutral wash-and-wax that leaves a glossy, water-beading finish.',
  },
]
