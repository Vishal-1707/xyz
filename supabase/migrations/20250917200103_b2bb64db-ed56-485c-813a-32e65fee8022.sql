-- Add new columns to medical_reports table for enhanced analysis
ALTER TABLE public.medical_reports 
ADD COLUMN IF NOT EXISTS ocr_text TEXT,
ADD COLUMN IF NOT EXISTS detailed_analysis JSONB,
ADD COLUMN IF NOT EXISTS prediction_details JSONB,
ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending';