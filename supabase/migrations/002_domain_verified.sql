-- Add domain_verified column to track whether a discovered domain
-- has been verified as belonging to the company (via content check or slug match)
alter table leads add column if not exists domain_verified boolean default false;
