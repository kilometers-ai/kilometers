-- Database Migration: Update CustomerId to CustomerApiKeyHash
-- Run this after updating your code files

BEGIN;

-- Step 1: Add the new CustomerApiKeyHash column
ALTER TABLE events 
ADD COLUMN customer_api_key_hash VARCHAR(255);

-- Step 2: Update the index names to avoid conflicts during transition
DROP INDEX IF EXISTS idx_customer_timestamp;
DROP INDEX IF EXISTS idx_customer_method;  
DROP INDEX IF EXISTS idx_customer_direction;

-- Step 3: Create new indexes on the new column
CREATE INDEX idx_customer_api_key_hash_timestamp 
ON events(customer_api_key_hash, timestamp DESC);

CREATE INDEX idx_customer_api_key_hash_method 
ON events(customer_api_key_hash, method);

CREATE INDEX idx_customer_api_key_hash_direction 
ON events(customer_api_key_hash, direction);

-- Step 4: For existing data, you'll need to map old customer_id values to API key hashes
-- This is a placeholder - you'll need to populate this with your actual terraform API key hash
-- UPDATE events 
-- SET customer_api_key_hash = 'YOUR_BCRYPT_HASH_HERE'
-- WHERE customer_id IN ('default', 'test-customer') 
--   AND customer_api_key_hash IS NULL;

-- Step 5: After verifying data migration, make the new column NOT NULL
-- ALTER TABLE events 
-- ALTER COLUMN customer_api_key_hash SET NOT NULL;

-- Step 6: After verifying everything works, drop the old column
-- ALTER TABLE events 
-- DROP COLUMN customer_id;

COMMIT;

-- Verification queries (run these to check your migration):
-- SELECT customer_id, customer_api_key_hash, COUNT(*) 
-- FROM events 
-- GROUP BY customer_id, customer_api_key_hash;
