-- Clear every seeded mock review so the PDP reviews block starts empty.
-- The customer-facing form (ReviewsBlock + WriteReviewForm) stays in
-- place — submissions still flow through WhatsApp to the admin, who
-- inserts approved reviews back into this table. Until a real review
-- lands the PDP shows the "No reviews yet — be the first" empty state.

truncate table public.hammerex_reviews;
