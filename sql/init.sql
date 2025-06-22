-- For dropping
-- drop table reports;

-- Enable pgvector
create extension if not exists vector;

-- Create reports table
create table reports (
                         id uuid primary key default gen_random_uuid (),
                         complaint text,
                         tags text[],
                         embedding vector (3072), -- assuming OpenAI/Claude embeddings
                         location text,
                         stop text,
                         agency text,
                         route text,
                         temperature int,
                         delay bool,
                         weekday text,
                         eventNearby text,
                         is_anonymous bool,
                         created_at timestamptz default now()
);

create table analytics_summary (
                                   id uuid primary key default gen_random_uuid(),
                                   created_at timestamptz default now(),
                                   summary text
);
