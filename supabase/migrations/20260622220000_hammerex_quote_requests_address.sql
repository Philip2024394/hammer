-- Add buyer_address to the quote-request inbox. Re-adds the delivery
-- address field to the checkout form so the team has somewhere to ship
-- to when they reply to the customer with the freight quote. Optional
-- by design — some customers will leave it blank and follow up with it
-- by email once they've seen the quote.

alter table public.hammerex_quote_requests
  add column if not exists buyer_address text;
