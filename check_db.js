require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking partner_notes...");
  const { data: notes, error: notesErr } = await supabase.from('partner_notes').select('*').limit(1);
  if (notesErr) {
    console.error("Error on partner_notes:", notesErr.message);
  } else {
    console.log("partner_notes exists! Data:", notes);
  }

  console.log("Checking note_reactions...");
  const { data: reactions, error: reactErr } = await supabase.from('note_reactions').select('*').limit(1);
  if (reactErr) {
    console.error("Error on note_reactions:", reactErr.message);
  } else {
    console.log("note_reactions exists! Data:", reactions);
  }
}

check();
