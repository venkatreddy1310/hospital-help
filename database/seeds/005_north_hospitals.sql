-- Simulated North Hyderabad hospital expansion. All names are fictional demo
-- records; `code` values match the frontend demo catalog so bookings resolve.
-- Safe to run repeatedly: rows are upserted by `code`.

insert into public.hospitals (
  code, name, short_name, type, area, address, distance_km, availability,
  available_beds, total_beds, emergency, facilities, specialties, map_position
)
values
  (
    'northstar-kompally', 'NorthStar Multispeciality Demo Hospital – Kompally', 'NorthStar', 'Private', 'Kompally',
    'Plot 18, Demo North Avenue, Kompally, Hyderabad', 13.6, 'available', 46, 260, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy', 'bloodBank'],
    array['Cardiology', 'Orthopaedics', 'General medicine'],
    '{"x": 36, "y": 4}'::jsonb
  ),
  (
    'silveroak-kompally', 'SilverOak Demo Hospital – Kompally', 'SilverOak', 'Private', 'Kompally',
    'Survey 220, Demo County Road, Kompally, Hyderabad', 13.9, 'limited', 11, 140, true,
    array['icu', 'diagnostics', 'pharmacy'],
    array['Paediatrics', 'Dermatology', 'General medicine'],
    '{"x": 40, "y": 2}'::jsonb
  ),
  (
    'compass-kompally', 'Compass Demo Children''s Hospital – Kompally', 'Compass', 'Private', 'Kompally',
    'Plot 5, Demo Meadows, Kompally, Hyderabad', 13.4, 'available', 27, 110, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy'],
    array['Paediatrics', 'Neonatology', 'Emergency medicine'],
    '{"x": 34, "y": 8}'::jsonb
  ),
  (
    'meridian-kompally', 'Meridian Demo Heart Centre – Kompally', 'Meridian', 'Private', 'Kompally',
    'Block C, Demo Medicity, Kompally, Hyderabad', 14.1, 'limited', 8, 100, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy'],
    array['Cardiology', 'Cardiothoracic surgery', 'Critical care'],
    '{"x": 42, "y": 6}'::jsonb
  ),
  (
    'healinggrove-kompally', 'Healing Grove Demo Hospital – Kompally', 'Healing Grove', 'Private', 'Kompally',
    'Plot 31, Demo Orchard Lane, Kompally, Hyderabad', 13.2, 'full', 0, 80, false,
    array['diagnostics', 'pharmacy'],
    array['General medicine', 'ENT', 'Dermatology'],
    '{"x": 37, "y": 3}'::jsonb
  ),
  (
    'horizon-gandimaisamma', 'Horizon Demo Hospital – Gandimaisamma', 'Horizon', 'Private', 'Gandimaisamma',
    'Survey 88, Demo Lakeview Road, Gandimaisamma, Hyderabad', 16.2, 'available', 38, 220, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy'],
    array['Orthopaedics', 'General medicine', 'Emergency medicine'],
    '{"x": 26, "y": 2}'::jsonb
  ),
  (
    'lotusvalley-gandimaisamma', 'Lotus Valley Demo Multispeciality – Gandimaisamma', 'Lotus Valley', 'Private', 'Gandimaisamma',
    'Plot 9, Demo Valley Road, Gandimaisamma, Hyderabad', 16.6, 'available', 19, 130, true,
    array['icu', 'diagnostics', 'pharmacy'],
    array['Gynaecology', 'Paediatrics', 'General medicine'],
    '{"x": 28, "y": 5}'::jsonb
  ),
  (
    'vidyagiri-gandimaisamma', 'VidyaGiri Demo Hospital – Gandimaisamma', 'VidyaGiri', 'Government', 'Gandimaisamma',
    'Municipal Demo Campus, Gandimaisamma, Hyderabad', 16.9, 'limited', 13, 240, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy', 'bloodBank'],
    array['General medicine', 'Trauma', 'Emergency medicine'],
    '{"x": 30, "y": 1}'::jsonb
  ),
  (
    'amberleaf-gandimaisamma', 'Amberleaf Demo Hospital – Gandimaisamma', 'Amberleaf', 'Private', 'Gandimaisamma',
    'Plot 14, Demo Greenbelt, Gandimaisamma, Hyderabad', 15.8, 'available', 21, 120, false,
    array['diagnostics', 'pharmacy'],
    array['General medicine', 'Pulmonology', 'ENT'],
    '{"x": 25, "y": 6}'::jsonb
  ),
  (
    'riverstone-dulapally', 'Riverstone Demo Hospital – Dulapally', 'Riverstone', 'Private', 'Dulapally',
    'Survey 51, Demo Riverside, Dulapally, Hyderabad', 15.4, 'available', 52, 300, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy', 'bloodBank'],
    array['Neurology', 'Orthopaedics', 'General medicine'],
    '{"x": 44, "y": 1}'::jsonb
  ),
  (
    'serene-dulapally', 'Serene Demo Multispeciality – Dulapally', 'Serene', 'Private', 'Dulapally',
    'Plot 22, Demo Serenity Layout, Dulapally, Hyderabad', 15.9, 'limited', 9, 95, true,
    array['icu', 'diagnostics', 'pharmacy'],
    array['General medicine', 'Dermatology', 'ENT'],
    '{"x": 41, "y": 5}'::jsonb
  ),
  (
    'bluebell-dulapally', 'BlueBell Demo Hospital – Dulapally', 'BlueBell', 'Private', 'Dulapally',
    'Block D, Demo Hillview, Dulapally, Hyderabad', 16.1, 'available', 33, 180, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy'],
    array['Paediatrics', 'Gynaecology', 'General medicine'],
    '{"x": 43, "y": 2}'::jsonb
  ),
  (
    'olivebranch-dulapally', 'Olive Branch Demo Hospital – Dulapally', 'Olive Branch', 'Government', 'Dulapally',
    'Demo Health Colony, Dulapally, Hyderabad', 15.1, 'full', 0, 210, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy', 'bloodBank'],
    array['General medicine', 'Emergency medicine', 'Trauma'],
    '{"x": 45, "y": 4}'::jsonb
  ),
  (
    'vista-suchitra', 'Vista Demo Hospital – Suchitra', 'Vista', 'Private', 'Suchitra',
    'Plot 3, Demo Junction Road, Suchitra, Hyderabad', 10.6, 'available', 24, 150, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy'],
    array['Orthopaedics', 'General medicine', 'Emergency medicine'],
    '{"x": 50, "y": 14}'::jsonb
  ),
  (
    'breezewood-pet-basheerabad', 'Breezewood Demo Hospital – Pet Basheerabad', 'Breezewood', 'Private', 'Pet Basheerabad',
    'Survey 12, Demo Highway Service Road, Pet Basheerabad, Hyderabad', 9.9, 'limited', 7, 85, false,
    array['diagnostics', 'pharmacy'],
    array['General medicine', 'ENT', 'Dermatology'],
    '{"x": 48, "y": 18}'::jsonb
  ),
  (
    'qube-quthbullapur', 'Qube Demo Hospital – Quthbullapur', 'Qube', 'Private', 'Quthbullapur',
    'Plot 17, Demo Industrial Layout, Quthbullapur, Hyderabad', 8.4, 'available', 29, 160, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy'],
    array['Cardiology', 'General medicine', 'Orthopaedics'],
    '{"x": 45, "y": 22}'::jsonb
  ),
  (
    'falconcrest-bahadurpally', 'Falcon Crest Demo Hospital – Bahadurpally', 'Falcon Crest', 'Private', 'Bahadurpally',
    'Demo Aerodrome Road, Bahadurpally, Hyderabad', 16.8, 'limited', 6, 90, true,
    array['icu', 'diagnostics', 'pharmacy'],
    array['General medicine', 'Pulmonology', 'Emergency medicine'],
    '{"x": 20, "y": 4}'::jsonb
  ),
  (
    'cedarpoint-bowrampet', 'Cedar Point Demo Hospital – Bowrampet', 'Cedar Point', 'Private', 'Bowrampet',
    'Survey 64, Demo Farmstead Road, Bowrampet, Hyderabad', 17.6, 'available', 18, 120, false,
    array['diagnostics', 'pharmacy'],
    array['General medicine', 'Dermatology', 'ENT'],
    '{"x": 18, "y": 1}'::jsonb
  ),
  (
    'aerovista-dundigal', 'AeroVista Demo Hospital – Dundigal', 'AeroVista', 'Private', 'Dundigal',
    'Plot 8, Demo Aviation Avenue, Dundigal, Hyderabad', 18.4, 'available', 35, 190, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy', 'bloodBank'],
    array['Orthopaedics', 'Emergency medicine', 'General medicine'],
    '{"x": 22, "y": 0}'::jsonb
  ),
  (
    'stonebridge-medchal', 'Stonebridge Demo Hospital – Medchal', 'Stonebridge', 'Government', 'Medchal',
    'Demo Old Highway, Medchal, Hyderabad', 22.8, 'available', 62, 340, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy', 'bloodBank'],
    array['General medicine', 'Trauma', 'Cardiology'],
    '{"x": 38, "y": 0}'::jsonb
  ),
  (
    'maplewood-bowenpally', 'Maplewood Demo Hospital – Bowenpally', 'Maplewood', 'Private', 'Bowenpally',
    'Plot 26, Demo Cantonment Road, Bowenpally, Hyderabad', 5.6, 'available', 20, 140, true,
    array['icu', 'ambulance', 'diagnostics', 'pharmacy'],
    array['Neurology', 'Orthopaedics', 'General medicine'],
    '{"x": 56, "y": 30}'::jsonb
  ),
  (
    'induspark-jeedimetla', 'IndusPark Demo Hospital – Jeedimetla', 'IndusPark', 'Private', 'Jeedimetla',
    'Block A, Demo Estate Road, Jeedimetla, Hyderabad', 8.6, 'limited', 10, 110, true,
    array['icu', 'diagnostics', 'pharmacy'],
    array['General medicine', 'Orthopaedics', 'ENT'],
    '{"x": 42, "y": 20}'::jsonb
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
