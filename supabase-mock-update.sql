-- Run this in Supabase SQL Editor to add full mock data to existing companies

UPDATE companies SET
  email        = 'hello@digitalbridge.co.th',
  phone        = '+66 2 234 5678',
  website      = 'https://www.digitalbridge.co.th',
  team_size    = '11–50',
  founded_year = 2017,
  industry     = 'Marketing & Advertising',
  address      = '32nd Floor, Bhiraj Tower, Asoke, Bangkok 10110'
WHERE name = 'Digital Bridge Agency';

UPDATE companies SET
  email        = 'studio@codecraft.co.th',
  phone        = '+66 53 123 456',
  website      = 'https://www.codecraft.co.th',
  team_size    = '11–50',
  founded_year = 2019,
  industry     = 'Software Development',
  address      = '199 Nimman Rd, Suthep, Mueang, Chiang Mai 50200'
WHERE name = 'CodeCraft Studio';

UPDATE companies SET
  email        = 'contact@legalnexus.co.th',
  phone        = '+66 2 987 6543',
  website      = 'https://www.legalnexus.co.th',
  team_size    = '2–10',
  founded_year = 2015,
  industry     = 'Legal Services',
  address      = '88 Silom Road, Bangrak, Bangkok 10500'
WHERE name = 'Legal Nexus Thailand';
