-- Add icon_key column to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon_key TEXT;

-- Add comment for documentation
COMMENT ON COLUMN categories.icon_key IS 'Lucide icon name for category (e.g., mouse, keyboard, headphones)';

-- Update existing categories with default icon keys
UPDATE categories SET icon_key = 'mouse' WHERE id = 'cat-mice';
UPDATE categories SET icon_key = 'keyboard' WHERE id = 'cat-keyboards';
UPDATE categories SET icon_key = 'headphones' WHERE id = 'cat-headsets';
UPDATE categories SET icon_key = 'monitor' WHERE id = 'cat-monitors';
UPDATE categories SET icon_key = 'laptop' WHERE id = 'cat-laptops';
UPDATE categories SET icon_key = 'cpu' WHERE id = 'cat-components';
UPDATE categories SET icon_key = 'mouse-pointer-2' WHERE id = 'cat-accessories';