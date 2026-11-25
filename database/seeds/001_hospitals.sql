-- Simulated Hyderabad hospital directory. `code` values match the frontend
-- demo catalog so bookings can resolve the matching Supabase row.

insert into public.hospitals (
  code, name, short_name, type, area, address, distance_km, availability,
  available_beds, total_beds, emergency, facilities, specialties, map_position
)
values
  (
    'apollo-jubilee-hills', 'Apollo Hospitals', 'Apollo', 'Private', 'Jubilee Hills',
    'Road No. 72, Jubilee Hills, Hyderabad', 1.2, 'available', 42, 300, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy', 'bloodBank'],
    array['Cardiology', 'Emergency medicine', 'Orthopaedics'],
    '{"x": 22, "y": 56}'::jsonb
  ),
  (
    'care-banjara-hills', 'Care Hospitals', 'Care', 'Private', 'Banjara Hills',
    'Road No. 1, Banjara Hills, Hyderabad', 2.8, 'limited', 8, 120, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy'],
    array['Cardiology', 'Critical care', 'General medicine'],
    '{"x": 64, "y": 30}'::jsonb
  ),
  (
    'rainbow-banjara-hills', 'Rainbow Children''s Hospital', 'Rainbow', 'Private', 'Banjara Hills',
    'Road No. 2, Banjara Hills, Hyderabad', 3.4, 'limited', 6, 90, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy'],
    array['Paediatrics', 'Neonatology', 'Emergency medicine'],
    '{"x": 47, "y": 46}'::jsonb
  ),
  (
    'osmania-afzal-gunj', 'Osmania General Hospital', 'Osmania', 'Government', 'Afzal Gunj',
    'Afzal Gunj, Hyderabad', 6.4, 'full', 0, 400, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy', 'bloodBank'],
    array['General medicine', 'Trauma', 'Emergency medicine'],
    '{"x": 77, "y": 72}'::jsonb
  ),
  (
    'continental-gachibowli', 'Continental Hospitals', 'Continental', 'Private', 'Gachibowli',
    'Nanakramguda Road, Gachibowli, Hyderabad', 8.1, 'available', 18, 250, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy'],
    array['Orthopaedics', 'Neurology', 'Cardiology'],
    '{"x": 16, "y": 40}'::jsonb
  ),
  (
    'kims-secunderabad', 'KIMS Hospitals', 'KIMS', 'Private', 'Secunderabad',
    'Minister Road, Secunderabad, Hyderabad', 9.3, 'available', 26, 200, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy', 'bloodBank'],
    array['Neurology', 'Cardiology', 'Emergency medicine'],
    '{"x": 86, "y": 52}'::jsonb
  ),
  (
    'citycare-gachibowli', 'CityCare Demo Hospital – Gachibowli', 'CityCare', 'Private', 'Gachibowli',
    'Plot 12, Demo Health Avenue, Gachibowli, Hyderabad', 13.2, 'available', 34, 180, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy'],
    array['General medicine', 'Orthopaedics', 'Emergency medicine'],
    '{"x": 14, "y": 44}'::jsonb
  ),
  (
    'novamed-madhapur', 'NovaMed Demo Hospital – Madhapur', 'NovaMed', 'Private', 'Madhapur',
    'Survey 44, Demo Tech Park Road, Madhapur, Hyderabad', 8.6, 'limited', 9, 150, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy', 'bloodBank'],
    array['Cardiology', 'Neurology', 'General medicine'],
    '{"x": 24, "y": 50}'::jsonb
  ),
  (
    'apex-hitec-city', 'Apex Demo Multispeciality – HITEC City', 'Apex', 'Private', 'HITEC City',
    'Block B, Demo Cyber Avenue, HITEC City, Hyderabad', 11.1, 'available', 61, 300, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy'],
    array['Orthopaedics', 'Gastroenterology', 'General medicine'],
    '{"x": 20, "y": 36}'::jsonb
  ),
  (
    'lifespring-kondapur', 'LifeSpring Demo Hospital – Kondapur', 'LifeSpring', 'Private', 'Kondapur',
    'Plot 7, Demo Spring Lane, Kondapur, Hyderabad', 12.4, 'available', 22, 120, true,
    array['icu', 'diagnostics', 'pharmacy'],
    array['Paediatrics', 'General medicine', 'Dermatology'],
    '{"x": 28, "y": 28}'::jsonb
  ),
  (
    'sanjeevani-kukatpally', 'Sanjeevani Demo Hospital – Kukatpally', 'Sanjeevani', 'Government', 'Kukatpally',
    'Municipal Demo Campus, Kukatpally, Hyderabad', 8.2, 'available', 88, 420, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy', 'bloodBank'],
    array['General medicine', 'Trauma', 'Emergency medicine'],
    '{"x": 34, "y": 18}'::jsonb
  ),
  (
    'meditrust-miyapur', 'MediTrust Demo Hospital – Miyapur', 'MediTrust', 'Private', 'Miyapur',
    'Plot 21, Demo Lake Road, Miyapur, Hyderabad', 12.9, 'limited', 7, 90, false,
    array['diagnostics', 'pharmacy'],
    array['General medicine', 'ENT', 'Dermatology'],
    '{"x": 30, "y": 10}'::jsonb
  ),
  (
    'goldencare-banjara-hills', 'GoldenCare Demo Hospital – Banjara Hills', 'GoldenCare', 'Private', 'Banjara Hills',
    'Road No. 10 (demo), Banjara Hills, Hyderabad', 3.1, 'available', 28, 140, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy', 'bloodBank'],
    array['Cardiology', 'Critical care', 'General medicine'],
    '{"x": 58, "y": 34}'::jsonb
  ),
  (
    'sterling-jubilee-hills', 'Sterling Demo Heart Institute – Jubilee Hills', 'Sterling', 'Private', 'Jubilee Hills',
    'Road No. 45 (demo), Jubilee Hills, Hyderabad', 6.8, 'available', 16, 110, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy'],
    array['Cardiology', 'Cardiothoracic surgery', 'Critical care'],
    '{"x": 26, "y": 54}'::jsonb
  ),
  (
    'pulsepoint-ameerpet', 'PulsePoint Demo Hospital – Ameerpet', 'PulsePoint', 'Private', 'Ameerpet',
    'Demo Metro Lane, Ameerpet, Hyderabad', 2.6, 'limited', 5, 70, true,
    array['icu', 'diagnostics', 'pharmacy'],
    array['General medicine', 'Orthopaedics', 'ENT'],
    '{"x": 52, "y": 42}'::jsonb
  ),
  (
    'cantonment-secunderabad', 'Cantonment Demo Hospital – Secunderabad', 'Cantonment', 'Government', 'Secunderabad',
    'Demo Parade Ground Road, Secunderabad, Hyderabad', 3.0, 'full', 0, 260, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy', 'bloodBank'],
    array['General medicine', 'Emergency medicine', 'Trauma'],
    '{"x": 88, "y": 50}'::jsonb
  ),
  (
    'aurora-begumpet', 'Aurora Demo Hospital – Begumpet', 'Aurora', 'Private', 'Begumpet',
    'Demo Airport Road, Begumpet, Hyderabad', 2.4, 'available', 31, 160, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy'],
    array['Neurology', 'Orthopaedics', 'General medicine'],
    '{"x": 70, "y": 44}'::jsonb
  ),
  (
    'greenleaf-tarnaka', 'GreenLeaf Demo Hospital – Tarnaka', 'GreenLeaf', 'Government', 'Tarnaka',
    'Demo University Road, Tarnaka, Hyderabad', 6.7, 'limited', 12, 200, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy'],
    array['General medicine', 'Pulmonology', 'Emergency medicine'],
    '{"x": 84, "y": 60}'::jsonb
  ),
  (
    'sunrise-uppal', 'Sunrise Demo Hospital – Uppal', 'Sunrise', 'Government', 'Uppal',
    'Demo Ring Road, Uppal, Hyderabad', 9.6, 'available', 47, 240, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy', 'bloodBank'],
    array['General medicine', 'Trauma', 'Orthopaedics'],
    '{"x": 92, "y": 68}'::jsonb
  ),
  (
    'lakeside-lb-nagar', 'Lakeside Demo Hospital – LB Nagar', 'Lakeside', 'Private', 'LB Nagar',
    'Demo Lake View Colony, LB Nagar, Hyderabad', 11.2, 'available', 19, 130, false,
    array['ambulance', 'diagnostics', 'pharmacy'],
    array['General medicine', 'Gynaecology', 'Paediatrics'],
    '{"x": 86, "y": 84}'::jsonb
  ),
  (
    'primecare-dilsukhnagar', 'PrimeCare Demo Hospital – Dilsukhnagar', 'PrimeCare', 'Private', 'Dilsukhnagar',
    'Demo Market Street, Dilsukhnagar, Hyderabad', 7.6, 'limited', 6, 95, true,
    array['icu', 'diagnostics', 'pharmacy'],
    array['General medicine', 'ENT', 'Dermatology'],
    '{"x": 78, "y": 78}'::jsonb
  ),
  (
    'heritage-mehdipatnam', 'Heritage Demo Hospital – Mehdipatnam', 'Heritage', 'Government', 'Mehdipatnam',
    'Demo Old City Road, Mehdipatnam, Hyderabad', 4.4, 'available', 54, 280, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy', 'bloodBank'],
    array['General medicine', 'Cardiology', 'Emergency medicine'],
    '{"x": 46, "y": 66}'::jsonb
  ),
  (
    'aerocity-shamshabad', 'AeroCity Demo Hospital – Shamshabad', 'AeroCity', 'Private', 'Shamshabad',
    'Demo Airport Corridor, Shamshabad, Hyderabad', 22.5, 'available', 26, 150, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy'],
    array['Emergency medicine', 'General medicine', 'Orthopaedics'],
    '{"x": 44, "y": 94}'::jsonb
  ),
  (
    'northpoint-kompally', 'NorthPoint Demo Hospital – Kompally', 'NorthPoint', 'Private', 'Kompally',
    'Demo North Highway, Kompally, Hyderabad', 13.4, 'limited', 10, 100, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy'],
    array['Orthopaedics', 'General medicine', 'Paediatrics'],
    '{"x": 38, "y": 6}'::jsonb
  ),
  (
    'willowbrook-manikonda', 'Willowbrook Demo Hospital – Manikonda', 'Willowbrook', 'Private', 'Manikonda',
    'Demo Hillside Avenue, Manikonda, Hyderabad', 11.8, 'available', 24, 125, false,
    array['icu', 'diagnostics', 'pharmacy'],
    array['Gynaecology', 'Paediatrics', 'General medicine'],
    '{"x": 30, "y": 58}'::jsonb
  )
on conflict (code) do update
set
  name = excluded.name,
  short_name = excluded.short_name,
  type = excluded.type,
  area = excluded.area,
  address = excluded.address,
  distance_km = excluded.distance_km,
  availability = excluded.availability,
  available_beds = excluded.available_beds,
  total_beds = excluded.total_beds,
  emergency = excluded.emergency,
  facilities = excluded.facilities,
  specialties = excluded.specialties,
  map_position = excluded.map_position,
  updated_at = now();
