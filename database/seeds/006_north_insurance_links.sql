-- Simulated insurance network links for the North Hyderabad demo hospitals.
-- Mirrors the frontend demo catalog. Safe to run repeatedly.

insert into public.insurance_hospital_network (provider_id, hospital_id)
select p.id, h.id
from (
  values
    ('insurance-aarogya', 'northstar-kompally'),
    ('insurance-aarogya', 'horizon-gandimaisamma'),
    ('insurance-aarogya', 'riverstone-dulapally'),
    ('insurance-aarogya', 'stonebridge-medchal'),
    ('insurance-aarogya', 'aerovista-dundigal'),
    ('insurance-novacare', 'silveroak-kompally'),
    ('insurance-novacare', 'lotusvalley-gandimaisamma'),
    ('insurance-novacare', 'serene-dulapally'),
    ('insurance-novacare', 'vista-suchitra'),
    ('insurance-novacare', 'qube-quthbullapur'),
    ('insurance-novacare', 'maplewood-bowenpally'),
    ('insurance-sahayak', 'vidyagiri-gandimaisamma'),
    ('insurance-sahayak', 'olivebranch-dulapally'),
    ('insurance-sahayak', 'falconcrest-bahadurpally'),
    ('insurance-bluelotus', 'meridian-kompally'),
    ('insurance-bluelotus', 'compass-kompally'),
    ('insurance-bluelotus', 'bluebell-dulapally'),
    ('insurance-bluelotus', 'induspark-jeedimetla')
) as network(provider_code, hospital_code)
join public.insurance_providers p on p.code = network.provider_code
join public.hospitals h on h.code = network.hospital_code
on conflict do nothing;
