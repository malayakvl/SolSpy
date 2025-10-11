-- Create table for storing maximum earned credits per epoch
CREATE TABLE IF NOT EXISTS data.epoch_max_credits (
  epoch INTEGER PRIMARY KEY,
  max_earned_credits BIGINT
);