-- DevBounty Schema
-- This file defines the database schema for the DevBounty platform
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "email" TEXT UNIQUE NOT NULL,
  "username" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL, -- Supabase Auth will handle this
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "is_admin" BOOLEAN DEFAULT FALSE,
  "preferences" JSONB DEFAULT '{}'::JSONB
);

-- Client profiles table
CREATE TABLE IF NOT EXISTS "client_profiles" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "company_name" TEXT,
  "payment_email" TEXT NOT NULL,
  "average_rating" NUMERIC(3, 2) DEFAULT 0,
  "rating_count" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("user_id")
);

-- Developer profiles table
CREATE TABLE IF NOT EXISTS "developer_profiles" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "payment_email" TEXT NOT NULL,
  "skills" TEXT[] DEFAULT '{}',
  "average_rating" NUMERIC(3, 2) DEFAULT 0,
  "rating_count" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("user_id")
);

-- Bounty status enum
CREATE TYPE bounty_status AS ENUM ('open', 'claimed', 'completed', 'expired');

-- Bounties table
CREATE TABLE IF NOT EXISTS "bounties" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "client_id" UUID NOT NULL REFERENCES "client_profiles"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "bounty_amount" INTEGER NOT NULL,
  "github_repo" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "tags" TEXT[] DEFAULT '{}',
  "requirements" JSONB DEFAULT '{}'::JSONB,
  "dibs_duration" INTERVAL NOT NULL,
  "status" bounty_status NOT NULL DEFAULT 'open',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Claimed bounty status enum
CREATE TYPE claimed_bounty_status AS ENUM ('in_progress', 'delivered', 'approved', 'rejected', 'expired');

-- Payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'paid');

-- Claimed bounties table
CREATE TABLE IF NOT EXISTS "claimed_bounties" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "bounty_id" UUID NOT NULL REFERENCES "bounties"("id") ON DELETE CASCADE,
  "developer_id" UUID NOT NULL REFERENCES "developer_profiles"("id") ON DELETE CASCADE,
  "claimed_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "delivery_deadline" TIMESTAMP WITH TIME ZONE NOT NULL,
  "pull_request_url" TEXT,
  "status" claimed_bounty_status NOT NULL DEFAULT 'in_progress',
  "payment_status" payment_status NOT NULL DEFAULT 'pending',
  UNIQUE ("bounty_id")
);

-- Comments table
CREATE TABLE IF NOT EXISTS "comments" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "bounty_id" UUID NOT NULL REFERENCES "bounties"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS "reviews" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "bounty_id" UUID NOT NULL REFERENCES "bounties"("id") ON DELETE CASCADE,
  "reviewer_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "reviewee_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  "comment" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dispute status enum
CREATE TYPE dispute_status AS ENUM ('pending', 'in_review', 'resolved');

-- Disputes table
CREATE TABLE IF NOT EXISTS "disputes" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "bounty_id" UUID NOT NULL REFERENCES "bounties"("id") ON DELETE CASCADE,
  "client_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "developer_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "reason" TEXT NOT NULL,
  "status" dispute_status NOT NULL DEFAULT 'pending',
  "resolution" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "resolved_at" TIMESTAMP WITH TIME ZONE
);

-- Set up RLS (Row Level Security)

-- Enable RLS on all tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "developer_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bounties" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "claimed_bounties" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "disputes" ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" 
  ON "users" FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
  ON "users" FOR UPDATE USING (auth.uid() = id);

-- Create policies for client_profiles
CREATE POLICY "Clients can view their own profile" 
  ON "client_profiles" FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Clients can update their own profile" 
  ON "client_profiles" FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public can view client profiles" 
  ON "client_profiles" FOR SELECT USING (true);

-- Create policies for developer_profiles
CREATE POLICY "Developers can view their own profile" 
  ON "developer_profiles" FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Developers can update their own profile" 
  ON "developer_profiles" FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public can view developer profiles" 
  ON "developer_profiles" FOR SELECT USING (true);

-- Create policies for bounties
CREATE POLICY "Public can view bounties" 
  ON "bounties" FOR SELECT USING (true);

CREATE POLICY "Clients can create bounties" 
  ON "bounties" FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND id = client_id
    )
  );

CREATE POLICY "Clients can update their own bounties" 
  ON "bounties" FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM client_profiles WHERE user_id = auth.uid() AND id = client_id
    )
  );

-- Create policies for claimed_bounties
CREATE POLICY "Public can view claimed bounties" 
  ON "claimed_bounties" FOR SELECT USING (true);

CREATE POLICY "Developers can claim bounties" 
  ON "claimed_bounties" FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM developer_profiles WHERE user_id = auth.uid() AND id = developer_id
    )
  );

CREATE POLICY "Developers can update their claimed bounties" 
  ON "claimed_bounties" FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM developer_profiles WHERE user_id = auth.uid() AND id = developer_id
    )
  );

-- Create policies for comments
CREATE POLICY "Public can view comments" 
  ON "comments" FOR SELECT USING (true);

CREATE POLICY "Users can create comments" 
  ON "comments" FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
  ON "comments" FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for reviews
CREATE POLICY "Public can view reviews" 
  ON "reviews" FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" 
  ON "reviews" FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Create policies for disputes
CREATE POLICY "Participants can view their disputes" 
  ON "disputes" FOR SELECT USING (
    auth.uid() = client_id OR auth.uid() = developer_id
  );

CREATE POLICY "Participants can create disputes" 
  ON "disputes" FOR INSERT WITH CHECK (
    auth.uid() = client_id OR auth.uid() = developer_id
  );

-- Admins can see everything (add for each table)
CREATE POLICY "Admins can do anything with users" 
  ON "users" USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime 
  BEFORE UPDATE ON "users" 
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_client_profiles_modtime 
  BEFORE UPDATE ON "client_profiles" 
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_developer_profiles_modtime 
  BEFORE UPDATE ON "developer_profiles" 
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_bounties_modtime 
  BEFORE UPDATE ON "bounties" 
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_comments_modtime 
  BEFORE UPDATE ON "comments" 
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_disputes_modtime 
  BEFORE UPDATE ON "disputes" 
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column(); 