-- Add text extraction columns to documents table for OCR ingestion pipeline

alter table public.documents
  add column if not exists extracted_text text,
  add column if not exists processing_error text;
