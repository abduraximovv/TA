BEGIN;

ALTER TABLE products DISABLE TRIGGER USER;
ALTER TABLE batches DISABLE TRIGGER USER;
ALTER TABLE orders DISABLE TRIGGER USER;
ALTER TABLE locations DISABLE TRIGGER USER;
ALTER TABLE inventory_movements DISABLE TRIGGER USER;

UPDATE products SET organization_id = 'a1b2c3d4-0000-0000-0000-000000000001' WHERE organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
UPDATE batches SET organization_id = 'a1b2c3d4-0000-0000-0000-000000000001' WHERE organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
UPDATE orders SET organization_id = 'a1b2c3d4-0000-0000-0000-000000000001' WHERE organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
UPDATE locations SET organization_id = 'a1b2c3d4-0000-0000-0000-000000000001' WHERE organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
UPDATE inventory_movements SET organization_id = 'a1b2c3d4-0000-0000-0000-000000000001' WHERE organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

ALTER TABLE products ENABLE TRIGGER USER;
ALTER TABLE batches ENABLE TRIGGER USER;
ALTER TABLE orders ENABLE TRIGGER USER;
ALTER TABLE locations ENABLE TRIGGER USER;
ALTER TABLE inventory_movements ENABLE TRIGGER USER;

COMMIT;
