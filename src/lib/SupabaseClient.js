// src/lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

// Pega as variáveis de ambiente que definimos
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cria e exporta o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)