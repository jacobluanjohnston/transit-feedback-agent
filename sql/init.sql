-- Enable pgvector
create extension if not exists vector;

-- Create reports table
create table reports (
                         id uuid primary key default gen_random_uuid (),
                         text text,
                         tags text[],
                         embedding vector (1536), -- assuming OpenAI/Claude embeddings
                         location text,
                         stop_name text,
                         agency text,
                         route_id text,
                         timestamp timestamptz default now()
);
