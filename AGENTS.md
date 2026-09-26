# Project architecture

- Keep investment plan economics in `public.investment_plans` and derive comparison labels from live plan data; this prevents displayed projections from diverging from stored amounts.
- Store uploaded plan images as Lovable Assets pointers keyed by stable plan slugs; this preserves image-to-plan mapping if names change.
- Resolve referral codes and register referral relationships in the privileged signup trigger, never through client-side balance or referral writes; this prevents fabricated credits.
- Use `get_my_referral_summary()` for referral aggregates instead of exposing referral rows; this protects other users' identities.