import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Serversidans import, görs endast på serversidan
let createRouteHandlerClient;
let cookies;

// Dynamisk import för att undvika felmeddelanden på klientsidan
if (typeof window === 'undefined') {
  // Vi är på serversidan
  import('@supabase/auth-helpers-nextjs').then(module => {
    createRouteHandlerClient = module.createRouteHandlerClient;
  });
  
  import('next/headers').then(module => {
    cookies = module.cookies;
  });
}

// Typdefiniton för CV-objektet
export interface CV {
  id: string;
  user_id: string;
  title: string;
  content: any; // JSON-struktur för CV-innehåll
  template_id: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  settings?: any; // JSON-struktur för CV-inställningar
  last_edited_section?: string;
}

// Skapa en admin-klient med service-role-key för serveroperationer
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

// För användning i API-rutter (Route Handlers)
export const createServerClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('createServerClient får endast användas på serversidan');
  }
  
  if (!cookies || !createRouteHandlerClient) {
    throw new Error('Nödvändiga serverside-moduler har inte laddats ännu');
  }
  
  const cookieStore = cookies();
  return createRouteHandlerClient({ cookies: () => cookieStore });
};

// För användning i klientkomponenter
export const getSupabaseClient = () => {
  return createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
};

// Funktion för att köra databasoperationer som admin
export const runAsAdmin = async <T>(callback: (client: ReturnType<typeof createAdminClient>) => Promise<T>): Promise<T> => {
  if (typeof window !== 'undefined') {
    throw new Error('runAsAdmin får endast användas på serversidan');
  }
  
  const adminClient = createAdminClient();
  return await callback(adminClient);
};

// CV-relaterade hjälpfunktioner

/**
 * Hämtar alla användarens CV:n
 */
export const getUserCVs = async (userId: string) => {
  const supabase = getSupabaseClient();
  return await supabase
    .from('cvs')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
};

/**
 * Hämtar ett specifikt CV
 */
export const getCV = async (cvId: string, userId: string) => {
  if (!cvId || !userId) {
    return { 
      data: null, 
      error: new Error('CV-ID och användar-ID måste anges') 
    };
  }

  try {
    const supabase = getSupabaseClient();
    
    // Kontrollera att anslutningen fungerar
    if (!supabase) {
      console.error('Supabase-klienten kunde inte skapas');
      return {
        data: null,
        error: new Error('Kunde inte ansluta till databasen')
      };
    }

    const response = await supabase
      .from('cvs')
      .select('*')
      .eq('id', cvId)
      .eq('user_id', userId)
      .single();
    
    if (response.error) {
      console.error('Supabase query error:', response.error, 'Details:', JSON.stringify(response.error));
    }
    
    return response;
  } catch (error) {
    console.error('Unexpected error in getCV:', error, 'Details:', typeof error === 'object' ? JSON.stringify(error) : error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Ett oväntat fel uppstod vid hämtning av CV') 
    };
  }
};

/**
 * Skapar ett nytt CV
 */
export const createCV = async (userId: string, cvData: Partial<CV>) => {
  const supabase = getSupabaseClient();
  return await supabase
    .from('cvs')
    .insert([
      {
        user_id: userId,
        title: cvData.title || 'Namnlöst CV',
        content: cvData.content || {},
        template_id: cvData.template_id || 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_public: false,
        settings: cvData.settings || {},
      }
    ])
    .select();
};

/**
 * Uppdaterar ett CV
 */
export const updateCV = async (cvId: string, userId: string, cvData: Partial<CV>) => {
  const supabase = getSupabaseClient();
  const updates = {
    ...cvData,
    updated_at: new Date().toISOString()
  };
  
  return await supabase
    .from('cvs')
    .update(updates)
    .eq('id', cvId)
    .eq('user_id', userId);
};

/**
 * Tar bort ett CV
 */
export const deleteCV = async (cvId: string, userId: string) => {
  const supabase = getSupabaseClient();
  return await supabase
    .from('cvs')
    .delete()
    .eq('id', cvId)
    .eq('user_id', userId);
}; 