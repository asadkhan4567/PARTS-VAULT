/** Makes and model generations (Suzuki intentionally excluded). yearTo null = still on sale. */
export type SeedModel = { name: string; from: number; to: number | null }
export type SeedMake = { name: string; models: SeedModel[] }

const m = (name: string, from: number, to: number | null = null): SeedModel => ({ name, from, to })

export const MAKES: SeedMake[] = [
  {
    name: 'Toyota',
    models: [
      m('Corolla', 2009, 2013), m('Corolla', 2014, 2022), m('Yaris', 2019),
      m('Vitz', 2005, 2010), m('Vitz', 2011, 2013), m('Vitz', 2014, 2018), m('Vitz', 2019),
      m('Aqua', 2012, 2021), m('Passo', 2016), m('Premio', 2007, 2021),
      m('Prius', 2009, 2015), m('Prius', 2016, 2021), m('C-HR', 2017),
      m('Camry', 2006, 2011), m('Camry', 2012, 2017), m('Camry', 2018),
      m('Mark X', 2009, 2019), m('Crown', 2013, 2018),
      m('Hilux Vigo', 2005, 2011), m('Hilux Vigo Champ', 2012, 2015), m('Hilux Revo', 2016),
      m('Fortuner', 2016), m('Prado', 2010, 2023), m('Land Cruiser', 2008, 2021),
    ],
  },
  {
    name: 'Honda',
    models: [
      m('City', 2009, 2020), m('City', 2021),
      m('Civic', 2008, 2012), m('Civic', 2012, 2015), m('Civic', 2016, 2021), m('Civic', 2022),
      m('Accord', 2013, 2017), m('BR-V', 2017), m('HR-V', 2022), m('Vezel', 2014, 2021),
      m('N-One', 2012), m('N-WGN', 2013),
    ],
  },
  {
    name: 'Kia',
    models: [m('Picanto', 2019), m('Sportage', 2019), m('Sorento', 2021), m('Stonic', 2021), m('Grand Carnival', 2019)],
  },
  { name: 'Hyundai', models: [m('Elantra', 2021), m('Tucson', 2020), m('Sonata', 2021)] },
  {
    name: 'Audi',
    models: [
      m('A3', 2013, 2020), m('A4', 2016, 2023), m('A5', 2017, 2023), m('A6', 2019),
      m('Q3', 2019), m('Q5', 2017), m('Q7', 2016), m('e-tron', 2019), m('e-tron GT', 2021),
    ],
  },
  { name: 'Mercedes-Benz', models: [m('C-Class', 2015, 2021), m('E-Class', 2017), m('S-Class', 2014, 2020), m('EQS', 2022)] },
  { name: 'BMW', models: [m('3 Series', 2019), m('5 Series', 2017), m('7 Series', 2016, 2022), m('X1', 2016), m('X5', 2019), m('X7', 2019)] },
  { name: 'Land Rover', models: [m('Range Rover', 2013, 2021), m('Range Rover Sport', 2014, 2022)] },
  { name: 'Porsche', models: [m('Cayenne', 2018), m('Panamera', 2017), m('911', 2019), m('Taycan', 2020)] },
  { name: 'Lexus', models: [m('LX570', 2008, 2021), m('LX600', 2022), m('RX450h', 2016, 2022), m('CT200h', 2011, 2022)] },
  { name: 'MG', models: [m('HS', 2020), m('ZS', 2021)] },
  { name: 'Haval', models: [m('H6', 2022), m('Jolion', 2022)] },
  { name: 'Changan', models: [m('Alsvin', 2021), m('Oshan X7', 2022)] },
  { name: 'DFSK', models: [m('Glory 580', 2020)] },
  { name: 'Proton', models: [m('Saga', 2021), m('X70', 2021)] },
  { name: 'Daihatsu', models: [m('Mira', 2012), m('Move', 2014)] },
  { name: 'Peugeot', models: [m('2008', 2022)] },
  { name: 'BAIC', models: [m('BJ40', 2021)] },
]

// Kept hidden by default, as the brief asks. The owner can tick "Visible" to sell Suzuki parts.
export const HIDDEN_MAKES = ['Suzuki']
