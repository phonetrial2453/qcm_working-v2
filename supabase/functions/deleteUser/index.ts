
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    // Get the auth user who is making this request
    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      { 
        global: { headers: { Authorization: authHeader || '' } },
      }
    );
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', status: 401 }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }
    
    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');
      
    const isAdmin = roleData && roleData.length > 0;
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required', status: 403 }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      );
    }
    
    // Get request payload
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required', status: 400 }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    // Delete the user using admin privileges
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      throw deleteError;
    }
    
    return new Response(
      JSON.stringify({ message: 'User deleted successfully', status: 200 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in deleteUser function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message || 'Unknown error',
        status: 500 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
