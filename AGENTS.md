# Project architecture

- Keep investment plan economics in `public.investment_plans` and derive comparison labels from live plan data; this prevents displayed projections from diverging from stored amounts.
- Store user-uploaded plan images as Lovable Assets pointers keyed by stable plan slugs; this preserves the exact photos and their mapping if names change.
- Resolve referral codes and register referral relationships in the privileged signup trigger, never through client-side balance or referral writes; this prevents fabricated credits.
- Use `get_my_referral_summary()` for referral aggregates instead of exposing referral rows; this protects other users' identities.
- Execute purchases through authenticated `buy_investment_plan` and immutable server-side plan snapshots; this serializes balance deductions and purchase limits without client financial writes.
- Credit completed daily cycles once in `investment_earnings` and derive profile production from credited days; this caps payouts at the purchased duration and makes retries idempotent.
- Sync account finances through the shared query before displaying balances and use SQL hourly reconciliation for offline accounts; this keeps every financial screen consistent.
- Process verified deposit approvals and withdrawal rejections with terminal-state triggers; this credits or refunds exactly once and prohibits client approval.
- Never generate placeholder PIX payment codes; the payment button must fail closed until a real provider is configured.
- Keep rollback-only financial regression helpers private and owner-only; tests must never grant clients privileged financial access.