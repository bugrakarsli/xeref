import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve('d:/bugrakarsli/02-projects/xeref/.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase config')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(1)
  if (error) {
    console.error('Connection failed:', error.message)
    process.exit(1)
  }
  console.log('Connection successful! Row count available:', data)
}

test()
