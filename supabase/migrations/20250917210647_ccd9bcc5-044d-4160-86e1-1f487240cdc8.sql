-- Add validation fields to medical_reports table
ALTER TABLE public.medical_reports 
ADD COLUMN report_type text DEFAULT 'pending',
ADD COLUMN validation_status text DEFAULT 'pending',
ADD COLUMN validation_message text;

-- Add index for better performance on validation queries
CREATE INDEX idx_medical_reports_validation ON public.medical_reports(validation_status, report_type);