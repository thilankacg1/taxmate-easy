import pool from './pool.js'

async function seed() {
  console.log('Checking ATO categories...')

  const result = await pool.query('SELECT COUNT(*) FROM ato_categories')
  const count = parseInt(result.rows[0].count)

  if (count > 0) {
    console.log(`ATO categories already seeded (${count} found) — skipping`)
    process.exit(0)
  }

  await pool.query(`
    INSERT INTO ato_categories (code, name, description, gst_applicable) VALUES
    ('TOOLS_EQUIPMENT',    'Tools & Equipment',         'Hand tools, power tools, equipment used for work', true),
    ('VEHICLE_TRAVEL',     'Vehicle & Travel',          'Fuel, vehicle maintenance, tolls, parking', true),
    ('HOME_OFFICE',        'Home Office',               'Proportion of home costs for work use', true),
    ('PHONE_INTERNET',     'Phone & Internet',          'Mobile and internet costs for work', true),
    ('CLOTHING_PPE',       'Clothing & PPE',            'Protective equipment, uniforms, safety gear', true),
    ('ADVERTISING',        'Advertising & Marketing',   'Business cards, online ads, website costs', true),
    ('PROFESSIONAL_FEES',  'Professional Fees',         'Accountant, lawyer, trade association fees', true),
    ('INSURANCE',          'Insurance',                 'Liability, indemnity, tool insurance', true),
    ('EDUCATION_TRAINING', 'Education & Training',      'Courses, certifications, trade licences', true),
    ('OFFICE_SUPPLIES',    'Office Supplies',           'Stationery, software subscriptions', true),
    ('MEALS_ENTERTAIN',    'Meals & Entertainment',     'Client meals, business entertainment', true),
    ('SUBCONTRACTORS',     'Subcontractors',            'Payments to subcontractors or labour hire', true),
    ('PERSONAL',           'Personal (Not Deductible)', 'Personal expenses not related to work', false)
  `)

  console.log('ATO categories seeded successfully!')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})