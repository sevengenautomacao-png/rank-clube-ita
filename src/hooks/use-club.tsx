"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

interface Club {
  id: string;
  name: string;
}

interface ClubContextType {
  activeClub: Club | null;
  isLoadingClub: boolean;
}

const ClubContext = createContext<ClubContextType>({
  activeClub: null,
  isLoadingClub: true,
});

export const ClubProvider = ({ children }: { children: React.ReactNode }) => {
  const { profile, isLoading: isAuthLoading } = useAuth();
  const [activeClub, setActiveClub] = useState<Club | null>(null);
  const [isLoadingClub, setIsLoadingClub] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;

    const fetchClub = async () => {
      setIsLoadingClub(true);
      try {
        let data, error;
        
        if (profile?.club_id) {
           const result = await supabase.from('clubs').select('id, name').eq('id', profile.club_id).single();
           data = result.data;
           error = result.error;
        } else {
          // Fallback to the first club for public visitors
           const result = await supabase.from('clubs').select('id, name').limit(1).single();
           data = result.data;
           error = result.error;
        }

        if (!error && data) {
          setActiveClub(data as unknown as Club);
        } else {
          setActiveClub(null);
        }
      } catch (error) {
        console.error("Error fetching club:", error);
        setActiveClub(null);
      } finally {
        setIsLoadingClub(false);
      }
    };

    fetchClub();
  }, [profile?.club_id, isAuthLoading]);

  return (
    <ClubContext.Provider value={{ activeClub, isLoadingClub }}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => {
  const context = useContext(ClubContext);
  if (context === undefined) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
};
