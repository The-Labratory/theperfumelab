
-- Remove old placeholder slots
DELETE FROM affiliate_pyramid WHERE is_placeholder = true;

-- Update LAW and Maher with realistic stats
UPDATE affiliate_pyramid SET earnings = 48500, total_transactions = 120 WHERE id = '00000000-0000-0000-0000-000000000001';
UPDATE affiliate_pyramid SET earnings = 31200, total_transactions = 85 WHERE id = '00000000-0000-0000-0000-000000000002';

-- Level 1: Two more directors under LAW
INSERT INTO affiliate_pyramid (id, name, title, level, position, parent_id, earnings, total_transactions, is_placeholder)
VALUES
  ('00000000-0000-0000-0000-000000000010', 'Sarah Beaumont', 'Brand Director', 1, 1, '00000000-0000-0000-0000-000000000001', 22800, 65, false),
  ('00000000-0000-0000-0000-000000000011', 'Khalid Mansour', 'Regional Lead', 1, 2, '00000000-0000-0000-0000-000000000001', 18400, 52, false);

-- Level 2: Under Maher Alia
INSERT INTO affiliate_pyramid (id, name, title, level, position, parent_id, earnings, total_transactions, is_placeholder)
VALUES
  ('00000000-0000-0000-0000-000000000020', 'Lina Berger', 'Team Lead', 2, 0, '00000000-0000-0000-0000-000000000002', 14200, 38, false),
  ('00000000-0000-0000-0000-000000000021', 'Omar Hadid', 'Senior Affiliate', 2, 1, '00000000-0000-0000-0000-000000000002', 9800, 28, false),
  ('00000000-0000-0000-0000-000000000022', 'Elena Rossi', 'Affiliate', 2, 2, '00000000-0000-0000-0000-000000000002', 6200, 18, false);

-- Level 2: Under Sarah Beaumont
INSERT INTO affiliate_pyramid (id, name, title, level, position, parent_id, earnings, total_transactions, is_placeholder)
VALUES
  ('00000000-0000-0000-0000-000000000023', 'Youssef Karam', 'Team Lead', 2, 0, '00000000-0000-0000-0000-000000000010', 11500, 35, false),
  ('00000000-0000-0000-0000-000000000024', 'Annika Weber', 'Affiliate', 2, 1, '00000000-0000-0000-0000-000000000010', 7600, 22, false);

-- Level 2: Under Khalid Mansour
INSERT INTO affiliate_pyramid (id, name, title, level, position, parent_id, earnings, total_transactions, is_placeholder)
VALUES
  ('00000000-0000-0000-0000-000000000025', 'Marco Vitali', 'Senior Affiliate', 2, 0, '00000000-0000-0000-0000-000000000011', 9600, 32, false),
  ('00000000-0000-0000-0000-000000000026', 'Fatima Al-Sayed', 'Affiliate', 2, 1, '00000000-0000-0000-0000-000000000011', 5400, 16, false);

-- Level 3: Under Lina Berger
INSERT INTO affiliate_pyramid (id, name, title, level, position, parent_id, earnings, total_transactions, is_placeholder)
VALUES
  ('00000000-0000-0000-0000-000000000030', 'Sophie Deschamps', NULL, 3, 0, '00000000-0000-0000-0000-000000000020', 4200, 12, false),
  ('00000000-0000-0000-0000-000000000031', 'Nadia Petrov', NULL, 3, 1, '00000000-0000-0000-0000-000000000020', 2800, 8, false);

-- Level 3: Under Omar Hadid
INSERT INTO affiliate_pyramid (id, name, title, level, position, parent_id, earnings, total_transactions, is_placeholder)
VALUES
  ('00000000-0000-0000-0000-000000000032', 'David Chen', NULL, 3, 0, '00000000-0000-0000-0000-000000000021', 3100, 10, false),
  ('00000000-0000-0000-0000-000000000033', 'Amira Hassan', NULL, 3, 1, '00000000-0000-0000-0000-000000000021', 1900, 6, false);

-- Level 3: Under Youssef Karam
INSERT INTO affiliate_pyramid (id, name, title, level, position, parent_id, earnings, total_transactions, is_placeholder)
VALUES
  ('00000000-0000-0000-0000-000000000034', 'Lucas Martin', NULL, 3, 0, '00000000-0000-0000-0000-000000000023', 2600, 8, false),
  ('00000000-0000-0000-0000-000000000035', 'Zara Ahmed', NULL, 3, 1, '00000000-0000-0000-0000-000000000023', 1500, 5, false);

-- Level 3: Under Marco Vitali
INSERT INTO affiliate_pyramid (id, name, title, level, position, parent_id, earnings, total_transactions, is_placeholder)
VALUES
  ('00000000-0000-0000-0000-000000000036', 'Isabella Moreno', NULL, 3, 0, '00000000-0000-0000-0000-000000000025', 3400, 11, false),
  ('00000000-0000-0000-0000-000000000037', 'Raj Patel', NULL, 3, 1, '00000000-0000-0000-0000-000000000025', 1200, 4, false);

-- Level 4: Under Sophie Deschamps
INSERT INTO affiliate_pyramid (id, name, title, level, position, parent_id, earnings, total_transactions, is_placeholder)
VALUES
  ('00000000-0000-0000-0000-000000000040', 'Mia Fischer', NULL, 4, 0, '00000000-0000-0000-0000-000000000030', 800, 3, false),
  ('00000000-0000-0000-0000-000000000041', 'Ali Demir', NULL, 4, 1, '00000000-0000-0000-0000-000000000030', 450, 2, false);

-- Level 4: Under David Chen
INSERT INTO affiliate_pyramid (id, name, title, level, position, parent_id, earnings, total_transactions, is_placeholder)
VALUES
  ('00000000-0000-0000-0000-000000000042', 'Emma Johansson', NULL, 4, 0, '00000000-0000-0000-0000-000000000032', 600, 2, false);

-- Level 4: Under Isabella Moreno
INSERT INTO affiliate_pyramid (id, name, title, level, position, parent_id, earnings, total_transactions, is_placeholder)
VALUES
  ('00000000-0000-0000-0000-000000000043', 'Carlos Rivera', NULL, 4, 0, '00000000-0000-0000-0000-000000000036', 350, 1, false);

-- Placeholder slots for join appeal
INSERT INTO affiliate_pyramid (id, name, title, level, position, parent_id, earnings, total_transactions, is_placeholder)
VALUES
  (gen_random_uuid(), 'Empty Slot', NULL, 2, 3, '00000000-0000-0000-0000-000000000002', 0, 0, true),
  (gen_random_uuid(), 'Empty Slot', NULL, 2, 2, '00000000-0000-0000-0000-000000000010', 0, 0, true),
  (gen_random_uuid(), 'Empty Slot', NULL, 3, 2, '00000000-0000-0000-0000-000000000020', 0, 0, true),
  (gen_random_uuid(), 'Empty Slot', NULL, 3, 2, '00000000-0000-0000-0000-000000000025', 0, 0, true),
  (gen_random_uuid(), 'Empty Slot', NULL, 4, 2, '00000000-0000-0000-0000-000000000030', 0, 0, true);
