BEGIN;

ALTER TABLE products DISABLE TRIGGER USER;
ALTER TABLE batches DISABLE TRIGGER USER;
ALTER TABLE orders DISABLE TRIGGER USER;
ALTER TABLE locations DISABLE TRIGGER USER;
ALTER TABLE inventory_movements DISABLE TRIGGER USER;
ALTER TABLE counterparties DISABLE TRIGGER USER;
ALTER TABLE transactions DISABLE TRIGGER USER;

UPDATE products SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE organization_id = 'a1b2c3d4-0000-0000-0000-000000000001';
UPDATE batches SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE organization_id = 'a1b2c3d4-0000-0000-0000-000000000001';
UPDATE orders SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE organization_id = 'a1b2c3d4-0000-0000-0000-000000000001';
UPDATE locations SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE organization_id = 'a1b2c3d4-0000-0000-0000-000000000001';
UPDATE inventory_movements SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE organization_id = 'a1b2c3d4-0000-0000-0000-000000000001';
UPDATE counterparties SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE organization_id = 'a1b2c3d4-0000-0000-0000-000000000001';
UPDATE transactions SET organization_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE organization_id = 'a1b2c3d4-0000-0000-0000-000000000001';

ALTER TABLE products ENABLE TRIGGER USER;
ALTER TABLE batches ENABLE TRIGGER USER;
ALTER TABLE orders ENABLE TRIGGER USER;
ALTER TABLE locations ENABLE TRIGGER USER;
ALTER TABLE inventory_movements ENABLE TRIGGER USER;
ALTER TABLE counterparties ENABLE TRIGGER USER;
ALTER TABLE transactions ENABLE TRIGGER USER;

COMMIT;
