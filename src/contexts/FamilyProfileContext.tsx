import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface FamilyProfile {
  id: string;
  user_id: string;
  profile_id: string;
  name: string;
  age?: number;
  gender?: string;
  relation: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

interface FamilyProfileContextType {
  profiles: FamilyProfile[];
  currentProfile: FamilyProfile | null;
  loading: boolean;
  setCurrentProfile: (profile: FamilyProfile) => void;
  createProfile: (profileData: Omit<FamilyProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProfile: (id: string, updates: Partial<FamilyProfile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  refreshProfiles: () => Promise<void>;
}

const FamilyProfileContext = createContext<FamilyProfileContextType | undefined>(undefined);

export const useFamilyProfile = () => {
  const context = useContext(FamilyProfileContext);
  if (!context) {
    throw new Error('useFamilyProfile must be used within a FamilyProfileProvider');
  }
  return context;
};

interface FamilyProfileProviderProps {
  children: ReactNode;
}

export const FamilyProfileProvider = ({ children }: FamilyProfileProviderProps) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [currentProfile, setCurrentProfileState] = useState<FamilyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('family_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      setProfiles(data || []);
      
      // Set current profile to primary or first profile
      if (data && data.length > 0) {
        const primaryProfile = data.find(p => p.is_primary);
        const profileToSet = primaryProfile || data[0];
        setCurrentProfileState(profileToSet);
        
        // Store in localStorage for persistence
        localStorage.setItem('currentProfileId', profileToSet.id);
      }
    } catch (error) {
      console.error('Error fetching family profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Omit<FamilyProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('family_profiles')
      .insert({
        ...profileData,
        user_id: user.id,
      });

    if (error) throw error;
    await fetchProfiles();
  };

  const updateProfile = async (id: string, updates: Partial<FamilyProfile>) => {
    const { error } = await supabase
      .from('family_profiles')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchProfiles();
  };

  const deleteProfile = async (id: string) => {
    const { error } = await supabase
      .from('family_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // If deleting current profile, switch to another
    if (currentProfile?.id === id && profiles.length > 1) {
      const remainingProfiles = profiles.filter(p => p.id !== id);
      setCurrentProfile(remainingProfiles[0]);
    }
    
    await fetchProfiles();
  };

  const setCurrentProfile = (profile: FamilyProfile) => {
    setCurrentProfileState(profile);
    localStorage.setItem('currentProfileId', profile.id);
  };

  const refreshProfiles = async () => {
    await fetchProfiles();
  };

  useEffect(() => {
    if (user) {
      fetchProfiles();
    } else {
      setProfiles([]);
      setCurrentProfileState(null);
      setLoading(false);
    }
  }, [user]);

  // Create default profile if none exist
  useEffect(() => {
    if (user && profiles.length === 0 && !loading) {
      const createDefaultProfile = async () => {
        try {
          await createProfile({
            profile_id: 'self',
            name: user.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() : 'Self',
            relation: 'Self',
            is_primary: true,
          });
        } catch (error) {
          console.error('Error creating default profile:', error);
        }
      };
      createDefaultProfile();
    }
  }, [user, profiles, loading]);

  // Restore current profile from localStorage
  useEffect(() => {
    const savedProfileId = localStorage.getItem('currentProfileId');
    if (savedProfileId && profiles.length > 0) {
      const savedProfile = profiles.find(p => p.id === savedProfileId);
      if (savedProfile) {
        setCurrentProfileState(savedProfile);
      }
    }
  }, [profiles]);

  const value = {
    profiles,
    currentProfile,
    loading,
    setCurrentProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    refreshProfiles,
  };

  return (
    <FamilyProfileContext.Provider value={value}>
      {children}
    </FamilyProfileContext.Provider>
  );
};