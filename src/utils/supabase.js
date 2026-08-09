import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oevuhxhbkcdqwzdqwtbs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ipui2ZjBJCf2OKl6O9tjGw_WgHbZlI7';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * SQL de Criação da Tabela para o Supabase (para ser executado no SQL Editor do Supabase se necessário):
 * 
 * create table if not exists membros_igreja (
 *   id uuid primary key default gen_random_uuid(),
 *   nome text not null unique,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- Permitir leitura e escrita publica (ou anonima)
 * alter table membros_igreja enable row level security;
 * create policy "Permitir acesso anonimo total" on membros_igreja for all using (true) with check (true);
 */
