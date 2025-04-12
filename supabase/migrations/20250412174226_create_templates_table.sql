-- Skapa templates-tabell
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sätt upp RLS (Row Level Security) för templates
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Policy för att läsa templates
CREATE POLICY "Användare kan se sina egna templates" ON templates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy för att läsa publika templates
CREATE POLICY "Alla kan se publika templates" ON templates
  FOR SELECT
  USING (is_public = TRUE);

-- Policy för att skapa templates
CREATE POLICY "Användare kan skapa egna templates" ON templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy för att uppdatera templates
CREATE POLICY "Användare kan uppdatera sina egna templates" ON templates
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy för att ta bort templates
CREATE POLICY "Användare kan ta bort sina egna templates" ON templates
  FOR DELETE
  USING (auth.uid() = user_id);
