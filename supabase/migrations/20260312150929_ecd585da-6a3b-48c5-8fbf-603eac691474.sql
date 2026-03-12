
-- Update existing earnings to spread €40k across 35 affiliates
-- Level 0: Founder
UPDATE affiliate_pyramid SET earnings = 8500, total_transactions = 94 WHERE id = '00000000-0000-0000-0000-000000000001';

-- Level 1: Directors
UPDATE affiliate_pyramid SET earnings = 4200, total_transactions = 47 WHERE id = '00000000-0000-0000-0000-000000000002';
UPDATE affiliate_pyramid SET earnings = 3800, total_transactions = 42 WHERE id = '00000000-0000-0000-0000-000000000010';
UPDATE affiliate_pyramid SET earnings = 3500, total_transactions = 39 WHERE id = '00000000-0000-0000-0000-000000000011';

-- Level 2: Managers
UPDATE affiliate_pyramid SET earnings = 1800, total_transactions = 20 WHERE id = '00000000-0000-0000-0000-000000000020';
UPDATE affiliate_pyramid SET earnings = 1500, total_transactions = 17 WHERE id = '00000000-0000-0000-0000-000000000021';
UPDATE affiliate_pyramid SET earnings = 1200, total_transactions = 13 WHERE id = '00000000-0000-0000-0000-000000000022';
UPDATE affiliate_pyramid SET earnings = 1400, total_transactions = 16 WHERE id = '00000000-0000-0000-0000-000000000023';
UPDATE affiliate_pyramid SET earnings = 1100, total_transactions = 12 WHERE id = '00000000-0000-0000-0000-000000000024';
UPDATE affiliate_pyramid SET earnings = 1300, total_transactions = 14 WHERE id = '00000000-0000-0000-0000-000000000025';
UPDATE affiliate_pyramid SET earnings = 900, total_transactions = 10 WHERE id = '00000000-0000-0000-0000-000000000026';

-- Level 3: Team Leads
UPDATE affiliate_pyramid SET earnings = 850, total_transactions = 9 WHERE id = '00000000-0000-0000-0000-000000000030';
UPDATE affiliate_pyramid SET earnings = 700, total_transactions = 8 WHERE id = '00000000-0000-0000-0000-000000000031';
UPDATE affiliate_pyramid SET earnings = 650, total_transactions = 7 WHERE id = '00000000-0000-0000-0000-000000000032';
UPDATE affiliate_pyramid SET earnings = 500, total_transactions = 6 WHERE id = '00000000-0000-0000-0000-000000000033';
UPDATE affiliate_pyramid SET earnings = 600, total_transactions = 7 WHERE id = '00000000-0000-0000-0000-000000000034';
UPDATE affiliate_pyramid SET earnings = 450, total_transactions = 5 WHERE id = '00000000-0000-0000-0000-000000000035';
UPDATE affiliate_pyramid SET earnings = 750, total_transactions = 8 WHERE id = '00000000-0000-0000-0000-000000000036';
UPDATE affiliate_pyramid SET earnings = 350, total_transactions = 4 WHERE id = '00000000-0000-0000-0000-000000000037';

-- Level 4: Associates
UPDATE affiliate_pyramid SET earnings = 400, total_transactions = 4 WHERE id = '00000000-0000-0000-0000-000000000040';
UPDATE affiliate_pyramid SET earnings = 300, total_transactions = 3 WHERE id = '00000000-0000-0000-0000-000000000041';
UPDATE affiliate_pyramid SET earnings = 250, total_transactions = 3 WHERE id = '00000000-0000-0000-0000-000000000042';
UPDATE affiliate_pyramid SET earnings = 350, total_transactions = 4 WHERE id = '00000000-0000-0000-0000-000000000043';

-- Delete placeholder slots
DELETE FROM affiliate_pyramid WHERE is_placeholder = true;

-- Add 12 new affiliates to reach 35
INSERT INTO affiliate_pyramid (id, name, title, level, position, parent_id, earnings, total_transactions, is_placeholder)
VALUES 
  ('00000000-0000-0000-0000-000000000027', 'Yasmin Okafor', 'Regional Lead', 2, 3, '00000000-0000-0000-0000-000000000002', 1050, 12, false),
  ('00000000-0000-0000-0000-000000000038', 'Hannah Müller', NULL, 3, 2, '00000000-0000-0000-0000-000000000025', 400, 4, false),
  ('00000000-0000-0000-0000-000000000039', 'Tariq Benali', NULL, 3, 0, '00000000-0000-0000-0000-000000000027', 550, 6, false),
  ('00000000-0000-0000-0000-000000000050', 'Nina Kowalski', NULL, 3, 1, '00000000-0000-0000-0000-000000000027', 300, 3, false),
  ('00000000-0000-0000-0000-000000000044', 'Leila Touma', NULL, 4, 0, '00000000-0000-0000-0000-000000000034', 200, 2, false),
  ('00000000-0000-0000-0000-000000000045', 'Viktor Svensson', NULL, 4, 0, '00000000-0000-0000-0000-000000000035', 180, 2, false),
  ('00000000-0000-0000-0000-000000000046', 'Priya Sharma', NULL, 4, 0, '00000000-0000-0000-0000-000000000039', 270, 3, false),
  ('00000000-0000-0000-0000-000000000047', 'James O''Brien', NULL, 4, 1, '00000000-0000-0000-0000-000000000039', 150, 2, false),
  ('00000000-0000-0000-0000-000000000048', 'Aisha Ndongo', NULL, 4, 0, '00000000-0000-0000-0000-000000000038', 200, 2, false),
  ('00000000-0000-0000-0000-000000000049', 'Chen Wei', NULL, 4, 1, '00000000-0000-0000-0000-000000000036', 180, 2, false),
  ('00000000-0000-0000-0000-000000000051', 'Rosa Garcia', NULL, 4, 0, '00000000-0000-0000-0000-000000000050', 120, 1, false),
  ('00000000-0000-0000-0000-000000000052', 'Tomás Silva', NULL, 4, 1, '00000000-0000-0000-0000-000000000031', 150, 2, false);
