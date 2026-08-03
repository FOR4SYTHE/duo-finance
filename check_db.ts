import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkDb() {
  console.log("Checking insurance_policies table...");
  const { data, error } = await supabase.from('insurance_policies').select('*');
  
  if (error) {
    console.error("Error querying table:", error);
  } else {
    console.log(`Found ${data.length} rows.`);
    console.dir(data, { depth: null });
  }
}

checkDb();
