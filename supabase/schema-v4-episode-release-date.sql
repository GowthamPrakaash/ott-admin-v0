-- Add release_date column to episodes table
ALTER TABLE episodes ADD COLUMN release_date DATE;

-- Update existing episodes to have the default release date
UPDATE episodes SET release_date = '1991-01-01' WHERE release_date IS NULL;

-- Make release_date column NOT NULL
ALTER TABLE episodes ALTER COLUMN release_date SET NOT NULL;
