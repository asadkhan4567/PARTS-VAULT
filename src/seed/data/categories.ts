export type SeedCategory = { name: string; icon: string; showOnHome: boolean; children: string[] }

export const CATEGORIES: SeedCategory[] = [
  {
    name: 'Engine Parts',
    icon: 'engine',
    showOnHome: true,
    children: ['Engine Mountings', 'Belts & Chains', 'Water Pumps', 'Hoses & Pipes', 'Cylinder Head Gaskets', 'Ignition Coils', 'Radiators', 'Fuel Pumps'],
  },
  {
    name: 'Body Parts',
    icon: 'car-front',
    showOnHome: true,
    children: ['Front Bumper', 'Rear Bumper', 'Front Grille', 'Bumper Grille', 'Side Mirrors', 'Fender Shields', 'Undershields', 'Hoods & Fenders', 'Trims'],
  },
  {
    name: 'Lighting',
    icon: 'lightbulb',
    showOnHome: true,
    children: ['Headlights', 'Taillights', 'Headlight Lens & Housing', 'Taillight Lens & Housing', 'Fog Lights', 'Bulbs'],
  },
  {
    name: 'Suspension',
    icon: 'cog',
    showOnHome: true,
    children: ['Service Kits', 'Bushes', 'Boots', 'Bearings', 'Control Arms', 'Shocks', 'Struts', 'Springs', 'Z-Links', 'Coupling Rods', 'Wheel Hubs'],
  },
  {
    name: 'Service Parts',
    icon: 'disc',
    showOnHome: true,
    children: ['Brake Pads', 'Brake Shoes', 'Rotors & Brake Discs', 'Spark Plugs', 'Wiper Blades', 'Service Packs'],
  },
  { name: 'Filters', icon: 'filter', showOnHome: true, children: ['Oil Filters', 'Air Filters', 'Cabin AC Filters', 'Fuel Filters', 'Transmission Filters'] },
  {
    name: 'Oils & Fluids',
    icon: 'droplet',
    showOnHome: true,
    children: ['Engine Oil', 'Brake Fluid', 'Transmission Oil', 'Power Steering Oil', 'Coolant', 'Additives'],
  },
  { name: 'Air Conditioning', icon: 'snowflake', showOnHome: true, children: ['Compressors', 'Condensers', 'Dryers', 'Refrigerant'] },
  { name: 'Electrical', icon: 'battery', showOnHome: false, children: ['Batteries'] },
  { name: 'Accessories', icon: 'sparkles', showOnHome: true, children: ['Car Care', 'Top Covers', 'Floor Mats', 'Horns'] },
]
