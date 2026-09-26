(function initializeSupabase() {
  "use strict";

  const supabaseUrl = "https://wocbyyqcsqeronmpmqct.supabase.co";
  const supabasePublishableKey = "sb_publishable_XqdABIU4ab0oP4hXFOF3PQ_sLuI5Sb_";

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    window.portfolioSupabase = null;
    return;
  }

  window.portfolioSupabase = window.supabase.createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
})();
