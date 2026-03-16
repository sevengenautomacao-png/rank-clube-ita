import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useClub } from './use-club';

export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toSnakeCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)]: toSnakeCase(obj[key]),
      }),
      {}
    );
  }
  return obj;
}

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [key.replace(/(_\w)/g, m => m[1].toUpperCase())]: toCamelCase(obj[key]),
      }),
      {}
    );
  }
  return obj;
}

export function useSupabaseTable<T>(table: string, queryParams?: { select?: string, filter?: [string, any], order?: [string, { ascending: boolean }] }) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const { activeClub, isLoadingClub } = useClub();

  useEffect(() => {
    if (isLoadingClub) return;

  async function fetchData() {
    setLoading(true);
    try {
      let query = supabase.from(table).select(queryParams?.select || '*');
      
      // Auto-filter by active club for mapped tables
      const clubTables = ['units', 'events', 'members', 'score_logs', 'settings'];
      if (clubTables.includes(table) && activeClub?.id) {
        query = query.eq('club_id', activeClub.id);
      }

      if (queryParams?.filter) {
        query = query.eq(queryParams.filter[0], queryParams.filter[1]);
      }
      
      if (queryParams?.order) {
        query = query.order(queryParams.order[0], queryParams.order[1]);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setData(toCamelCase(data));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isLoadingClub) return;
    fetchData();
  }, [table, JSON.stringify(queryParams), activeClub?.id, isLoadingClub]);

  return { data, loading, error, refetch: fetchData };
}

export function useSupabaseDoc<T>(table: string, id: string, queryParams?: { select?: string }) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const { activeClub, isLoadingClub } = useClub();

  useEffect(() => {
    if (isLoadingClub) return;

    async function fetchData() {
      setLoading(true);
      try {
        let query = supabase.from(table).select(queryParams?.select || '*').eq('id', id);

        // Auto-filter by active club stringently
        const clubTables = ['units', 'events', 'members', 'score_logs', 'settings'];
        if (clubTables.includes(table) && activeClub?.id) {
          query = query.eq('club_id', activeClub.id);
        }

        const { data, error } = await query.single();
        if (error) throw error;
        
        setData(toCamelCase(data));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [table, id, activeClub?.id, isLoadingClub]);

  return { data, loading, error };
}
