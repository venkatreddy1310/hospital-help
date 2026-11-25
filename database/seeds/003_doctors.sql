-- Simulated specialist directory plus hospital affiliations. Every profile is
-- fictional; no real clinician data is included.

insert into public.doctors (
  code, name, specialty, experience_years, qualifications, bio, languages,
  consultation_fee, consultation_types, active
)
values
  (
    'dr-ananya-rao', 'Dr. Ananya Rao', 'Cardiology', 14,
    array['MBBS', 'MD (General Medicine)', 'DM (Cardiology)'],
    'Preventive heart care and long-term follow-up for adults. Explains tests and next steps in plain language.',
    array['English', 'Hindi', 'Telugu'], 900, array['in-person', 'online'], true
  ),
  (
    'dr-vikram-reddy', 'Dr. Vikram Reddy', 'Neurology', 11,
    array['MBBS', 'MD (General Medicine)', 'DM (Neurology)'],
    'Neurology care with a focus on headache and movement-related concerns. Values clear explanations and shared decision-making.',
    array['English', 'Telugu', 'Hindi'], 1000, array['in-person', 'online'], true
  ),
  (
    'dr-meera-iyer', 'Dr. Meera Iyer', 'Paediatrics', 9,
    array['MBBS', 'DNB (Paediatrics)'],
    'Child-friendly consultations with a calm, parent-inclusive approach. Focused on developmental and preventive paediatric care.',
    array['English', 'Tamil', 'Telugu'], 700, array['in-person'], true
  ),
  (
    'dr-arjun-menon', 'Dr. Arjun Menon', 'Orthopaedics', 16,
    array['MBBS', 'MS (Orthopaedics)'],
    'Orthopaedic assessment and rehabilitation planning. Works with patients to set practical recovery goals.',
    array['English', 'Malayalam', 'Hindi'], 1100, array['in-person'], true
  ),
  (
    'dr-sneha-kulkarni', 'Dr. Sneha Kulkarni', 'Dermatology', 7,
    array['MBBS', 'MD (Dermatology)'],
    'General and cosmetic skin concerns with a focus on long-term skin health. Enjoys clear, practical skincare education.',
    array['English', 'Hindi', 'Marathi'], 650, array['in-person', 'online'], true
  ),
  (
    'dr-rohan-gupta', 'Dr. Rohan Gupta', 'General Medicine', 12,
    array['MBBS', 'MD (General Medicine)'],
    'Broad adult medicine with an emphasis on preventive care and chronic condition follow-up.',
    array['English', 'Hindi'], 500, array['in-person', 'online'], true
  ),
  (
    'dr-kavya-nair', 'Dr. Kavya Nair', 'Gynaecology', 10,
    array['MBBS', 'MS (Obstetrics & Gynaecology)'],
    'Women''s health across life stages, with a calm and privacy-focused consultation style.',
    array['English', 'Malayalam', 'Hindi'], 850, array['in-person', 'online'], true
  ),
  (
    'dr-aditya-sharma', 'Dr. Aditya Sharma', 'ENT', 8,
    array['MBBS', 'MS (ENT)'],
    'Ear, nose, and throat care for adults and children, with a focus on clear communication.',
    array['English', 'Hindi'], 600, array['in-person'], true
  ),
  (
    'dr-isha-verma', 'Dr. Isha Verma', 'Cardiology', 9,
    array['MBBS', 'MD (General Medicine)', 'DM (Cardiology)'],
    'Heart health for adults with a special interest in prevention and lifestyle-focused follow-up.',
    array['English', 'Hindi'], 800, array['in-person', 'online'], true
  ),
  (
    'dr-karan-malhotra', 'Dr. Karan Malhotra', 'Neurology', 13,
    array['MBBS', 'MD (General Medicine)', 'DM (Neurology)'],
    'Neurology consultations centred on clear explanations and coordinated long-term care.',
    array['English', 'Hindi', 'Punjabi'], 950, array['in-person', 'online'], true
  ),
  (
    'dr-priya-raghavan', 'Dr. Priya Raghavan', 'Paediatrics', 6,
    array['MBBS', 'DNB (Paediatrics)'],
    'Paediatric care with a warm, family-centred style and a focus on early prevention.',
    array['English', 'Tamil'], 600, array['in-person', 'online'], true
  ),
  (
    'dr-nikhil-joshi', 'Dr. Nikhil Joshi', 'Orthopaedics', 7,
    array['MBBS', 'MS (Orthopaedics)'],
    'Bone, joint, and sports-related assessment with practical rehabilitation guidance.',
    array['English', 'Hindi', 'Marathi'], 700, array['in-person'], true
  ),
  (
    'dr-tara-bansal', 'Dr. Tara Bansal', 'Dermatology', 12,
    array['MBBS', 'MD (Dermatology)'],
    'Skin, hair, and nail concerns with a focus on realistic, evidence-aligned care.',
    array['English', 'Hindi'], 750, array['in-person', 'online'], true
  ),
  (
    'dr-sameer-khan', 'Dr. Sameer Khan', 'General Medicine', 15,
    array['MBBS', 'MD (General Medicine)'],
    'Adult general medicine with a preventive focus and support for long-term conditions.',
    array['English', 'Hindi', 'Urdu'], 550, array['in-person', 'online'], true
  ),
  (
    'dr-neha-reddy', 'Dr. Neha Reddy', 'Gynaecology', 8,
    array['MBBS', 'MS (Obstetrics & Gynaecology)'],
    'Women''s health consultations with an emphasis on comfort, privacy, and informed choice.',
    array['English', 'Telugu', 'Hindi'], 800, array['in-person'], true
  ),
  (
    'dr-rakesh-iyer', 'Dr. Rakesh Iyer', 'ENT', 14,
    array['MBBS', 'MS (ENT)'],
    'ENT care with a focus on practical symptom management and follow-up.',
    array['English', 'Tamil', 'Telugu'], 700, array['in-person', 'online'], true
  )
on conflict (code) do update
set
  name = excluded.name,
  specialty = excluded.specialty,
  experience_years = excluded.experience_years,
  qualifications = excluded.qualifications,
  bio = excluded.bio,
  languages = excluded.languages,
  consultation_fee = excluded.consultation_fee,
  consultation_types = excluded.consultation_types,
  active = excluded.active,
  updated_at = now();

insert into public.doctor_hospitals (doctor_id, hospital_id)
select d.id, h.id
from (
  values
    ('dr-ananya-rao', 'apollo-jubilee-hills'),
    ('dr-ananya-rao', 'care-banjara-hills'),
    ('dr-vikram-reddy', 'kims-secunderabad'),
    ('dr-vikram-reddy', 'continental-gachibowli'),
    ('dr-meera-iyer', 'rainbow-banjara-hills'),
    ('dr-meera-iyer', 'care-banjara-hills'),
    ('dr-arjun-menon', 'continental-gachibowli'),
    ('dr-arjun-menon', 'apollo-jubilee-hills'),
    ('dr-sneha-kulkarni', 'care-banjara-hills'),
    ('dr-sneha-kulkarni', 'apollo-jubilee-hills'),
    ('dr-rohan-gupta', 'osmania-afzal-gunj'),
    ('dr-rohan-gupta', 'care-banjara-hills'),
    ('dr-kavya-nair', 'rainbow-banjara-hills'),
    ('dr-kavya-nair', 'apollo-jubilee-hills'),
    ('dr-aditya-sharma', 'kims-secunderabad'),
    ('dr-aditya-sharma', 'osmania-afzal-gunj'),
    ('dr-isha-verma', 'continental-gachibowli'),
    ('dr-karan-malhotra', 'apollo-jubilee-hills'),
    ('dr-karan-malhotra', 'kims-secunderabad'),
    ('dr-priya-raghavan', 'rainbow-banjara-hills'),
    ('dr-priya-raghavan', 'care-banjara-hills'),
    ('dr-nikhil-joshi', 'osmania-afzal-gunj'),
    ('dr-nikhil-joshi', 'kims-secunderabad'),
    ('dr-tara-bansal', 'continental-gachibowli'),
    ('dr-tara-bansal', 'care-banjara-hills'),
    ('dr-sameer-khan', 'apollo-jubilee-hills'),
    ('dr-sameer-khan', 'continental-gachibowli'),
    ('dr-neha-reddy', 'rainbow-banjara-hills'),
    ('dr-neha-reddy', 'kims-secunderabad'),
    ('dr-rakesh-iyer', 'care-banjara-hills'),
    ('dr-rakesh-iyer', 'kims-secunderabad')
) as affiliations(doctor_code, hospital_code)
join public.doctors d on d.code = affiliations.doctor_code
join public.hospitals h on h.code = affiliations.hospital_code
on conflict do nothing;
