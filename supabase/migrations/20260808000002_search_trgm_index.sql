-- Migration: Add pg_trgm GIN indexes for full-text search (Risk 3)

-- Enable pg_trgm extension for trigram similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index on product name using trigrams for ILIKE '%query%' performance
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

-- Composite GIN index for full-text search on name + description
-- Using to_tsvector for ranked search results
CREATE INDEX IF NOT EXISTS idx_products_fts ON products USING gin (
  to_tsvector('english', name || ' ' || coalesce(description, ''))
);

-- Also add index on description for trigram search
CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON products USING gin (description gin_trgm_ops);

-- Optional: Create a function for full-text search with ranking
CREATE OR REPLACE FUNCTION search_products(
  p_query TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_category_id UUID DEFAULT NULL,
  p_brand_ids UUID[] DEFAULT NULL,
  p_status TEXT DEFAULT 'active'
) RETURNS SETOF products
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT p.*
  FROM products p
  WHERE p.status = p_status
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    AND (p_brand_ids IS NULL OR p.brand_id = ANY(p_brand_ids))
    AND (
      p.name ILIKE '%' || p_query || '%'
      OR p.description ILIKE '%' || p_query || '%'
      OR to_tsvector('english', p.name || ' ' || COALESCE(p.description, ''))
         @@ websearch_to_tsquery('english', p_query)
    )
  ORDER BY
    -- Rank by: exact name match > trigram similarity > tsvector rank
    CASE WHEN p.name ILIKE p_query THEN 0 ELSE 1 END,
    ts_rank_cd(
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')),
      websearch_to_tsquery('english', p_query)
    ) DESC,
    p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;

GRANT EXECUTE ON FUNCTION search_products(TEXT, INTEGER, INTEGER, UUID, UUID[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_products(TEXT, INTEGER, INTEGER, UUID, UUID[], TEXT) TO anon;