-- Create family_profiles table
CREATE TABLE public.family_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_id TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  relation TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, profile_id)
);

-- Enable Row Level Security
ALTER TABLE public.family_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for family profiles
CREATE POLICY "Users can view their own family profiles" 
ON public.family_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own family profiles" 
ON public.family_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own family profiles" 
ON public.family_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own family profiles" 
ON public.family_profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add profile_id to medical_reports to link reports to specific family members
ALTER TABLE public.medical_reports 
ADD COLUMN profile_id TEXT;

-- Create trigger for automatic timestamp updates on family_profiles
CREATE TRIGGER update_family_profiles_updated_at
BEFORE UPDATE ON public.family_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_family_profiles_user_id ON public.family_profiles(user_id);
CREATE INDEX idx_medical_reports_profile_id ON public.medical_reports(profile_id);