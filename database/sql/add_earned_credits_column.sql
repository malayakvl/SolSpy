-- Add earned_credits column to data.validators table
ALTER TABLE data.validators 
ADD COLUMN IF NOT EXISTS earned_credits BIGINT NULL;

-- Ensure delinquent column exists
ALTER TABLE data.validators 
ADD COLUMN IF NOT EXISTS delinquent BOOLEAN DEFAULT false;

-- Add tvr column to data.validators table
ALTER TABLE data.validators 
ADD COLUMN IF NOT EXISTS tvr DOUBLE PRECISION NULL;

-- Add mvr column to data.validators table
ALTER TABLE data.validators 
ADD COLUMN IF NOT EXISTS mvr DOUBLE PRECISION NULL;

-- Add tvc_score column to data.validators table
ALTER TABLE data.validators 
ADD COLUMN IF NOT EXISTS tvc_score DOUBLE PRECISION NULL;

-- Add tvc_rank column to data.validators table
ALTER TABLE data.validators 
ADD COLUMN IF NOT EXISTS tvc_rank BIGINT NULL;