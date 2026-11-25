-- Configured illustrative rules matching the local demo catalog. Re-running
-- updates only these simulated rules; no real insurer benefits are implied.

insert into public.insurance_coverage_rules (
  provider_id, category, co_pay_percent, deductible, per_claim_limit,
  waiting_period_days, excluded, notes
)
select p.id, rules.category, rules.co_pay_percent, rules.deductible,
  rules.per_claim_limit, rules.waiting_period_days, rules.excluded, rules.notes
from (
  values
    ('insurance-aarogya', 'general-hospitalization', 10, 5000, 250000, 30, false, 'Configured demo inpatient rule; not a real policy benefit.'),
    ('insurance-aarogya', 'emergency', 0, 0, 100000, 0, false, 'Emergency care must never be delayed for insurance checks.'),
    ('insurance-aarogya', 'icu', 10, 5000, 150000, 30, false, 'Illustrative ICU sub-limit.'),
    ('insurance-aarogya', 'surgery', 10, 5000, 200000, 60, false, 'Illustrative surgery waiting period and limit.'),
    ('insurance-aarogya', 'diagnostics', 0, 0, 0, 0, true, 'Configured demo exclusion for this diagnostics scenario.'),
    ('insurance-novacare', 'general-hospitalization', 20, 10000, 400000, 30, false, 'Configured family-plan demo rule.'),
    ('insurance-novacare', 'emergency', 0, 0, 150000, 0, false, 'No demo waiting period for emergency treatment.'),
    ('insurance-novacare', 'icu', 20, 10000, 200000, 30, false, 'Illustrative ICU co-pay and sub-limit.'),
    ('insurance-novacare', 'diagnostics', 20, 2000, 50000, 0, false, 'Illustrative diagnostics limit.'),
    ('insurance-sahayak', 'general-hospitalization', 0, 0, 150000, 0, false, 'Inactive demo scheme rule retained for admin preview.'),
    ('insurance-sahayak', 'emergency', 0, 0, 75000, 0, false, 'Inactive demo scheme rule retained for admin preview.'),
    ('insurance-sahayak', 'diagnostics', 0, 0, 25000, 0, false, 'Inactive demo scheme rule retained for admin preview.'),
    ('insurance-bluelotus', 'surgery', 15, 15000, 350000, 90, false, 'Illustrative surgical waiting period and sub-limit.'),
    ('insurance-bluelotus', 'icu', 20, 10000, 150000, 30, false, 'Illustrative ICU co-pay and sub-limit.'),
    ('insurance-bluelotus', 'general-hospitalization', 20, 10000, 250000, 30, false, 'Illustrative general hospitalization rule.')
) as rules(provider_code, category, co_pay_percent, deductible, per_claim_limit, waiting_period_days, excluded, notes)
join public.insurance_providers p on p.code = rules.provider_code
on conflict (provider_id, category) do update
set co_pay_percent = excluded.co_pay_percent,
  deductible = excluded.deductible,
  per_claim_limit = excluded.per_claim_limit,
  waiting_period_days = excluded.waiting_period_days,
  excluded = excluded.excluded,
  notes = excluded.notes,
  updated_at = now();
