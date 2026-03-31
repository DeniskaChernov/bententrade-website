import { projectId as defaultProjectId, publicAnonKey as defaultAnonKey } from './supabase/info';

const env = import.meta.env;

export const SUPABASE_PROJECT_ID = env.VITE_SUPABASE_PROJECT_ID || defaultProjectId;
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || defaultAnonKey;
export const API_BASE_URL =
  env.VITE_API_BASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-ee878259`;
