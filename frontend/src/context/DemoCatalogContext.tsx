import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { adminCatalogStorage } from '../services/adminCatalogStorage'
import type {
  AdminActivityArea,
  AdminActivityEntry,
  AdminCatalogSnapshot,
} from '../types/admin'
import type { Hospital, Specialist } from '../types/domain'
import type { InsuranceProvider } from '../types/insurance'
import {
  availabilityStatuses,
  clampBeds,
  createEntityId,
  createInitialCatalogSnapshot,
  mergeSeededHospitals,
  normalizeCatalogSnapshot,
  syncSpecialistsWithHospitals,
} from '../utils/adminCatalog'
import { HYDERABAD_CENTER } from '../utils/geo'
import {
  DemoCatalogContext,
  type DemoCatalogContextValue,
  type DoctorInput,
  type HospitalInput,
  type InsuranceProviderInput,
} from './catalogStore'

function createActivityEntry(
  area: AdminActivityArea,
  title: string,
  detail: string,
): AdminActivityEntry {
  return {
    id: createEntityId(`activity-${area}`, 'activity'),
    area,
    title,
    detail,
    timestamp: new Date().toISOString(),
  }
}

function prependActivity(
  activity: AdminActivityEntry[],
  entry: AdminActivityEntry,
): AdminActivityEntry[] {
  return [entry, ...activity].slice(0, 200)
}

function cleanStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

function loadInitialSnapshot(): AdminCatalogSnapshot {
  const stored = adminCatalogStorage.load()
  return stored
    ? mergeSeededHospitals(normalizeCatalogSnapshot(stored))
    : createInitialCatalogSnapshot()
}

export function DemoCatalogProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<AdminCatalogSnapshot>(loadInitialSnapshot)

  useEffect(() => {
    adminCatalogStorage.save(snapshot)
  }, [snapshot])

  const recordActivity = useCallback(
    (area: AdminActivityArea, title: string, detail: string) => {
      setSnapshot((current) => ({
        ...current,
        activity: prependActivity(
          current.activity,
          createActivityEntry(area, title, detail),
        ),
      }))
    },
    [],
  )

  const addHospital = useCallback((input: HospitalInput): string => {
    const id = createEntityId(input.name, 'hospital')

    setSnapshot((current) => {
      const beds = clampBeds(input.totalBeds, input.availableBeds)
      const hospital: Hospital = {
        id,
        name: input.name.trim(),
        shortName: input.shortName.trim() || input.name.trim(),
        type: input.type,
        area: input.area.trim(),
        address: input.address.trim(),
        distanceKm: Math.max(0, input.distanceKm),
        availability: availabilityStatuses.includes(input.availability)
          ? input.availability
          : 'available',
        ...beds,
        emergency: input.emergency,
        facilities: [...input.facilities],
        specialties: cleanStrings(input.specialties),
        coordinates: {
          lat: HYDERABAD_CENTER.lat + (((current.hospitals.length + 1) * 7) % 40) / 1000,
          lng: HYDERABAD_CENTER.lng + (((current.hospitals.length + 1) * 11) % 40) / 1000,
        },
        mapPosition: {
          x: 16 + (((current.hospitals.length + 1) * 13) % 68),
          y: 22 + (((current.hospitals.length + 1) * 17) % 58),
        },
      }
      const hospitals = [...current.hospitals, hospital]

      return {
        ...current,
        hospitals,
        specialists: syncSpecialistsWithHospitals(current.specialists, hospitals),
        activity: prependActivity(
          current.activity,
          createActivityEntry(
            'hospital',
            'Demo hospital added',
            `${hospital.name} was added with ${beds.availableBeds} of ${beds.totalBeds} simulated beds free.`,
          ),
        ),
      }
    })

    return id
  }, [])

  const updateHospital = useCallback((id: string, input: HospitalInput) => {
    setSnapshot((current) => {
      const existing = current.hospitals.find((hospital) => hospital.id === id)
      if (!existing) return current

      const beds = clampBeds(input.totalBeds, input.availableBeds)
      const hospital: Hospital = {
        ...existing,
        name: input.name.trim(),
        shortName: input.shortName.trim() || input.name.trim(),
        type: input.type,
        area: input.area.trim(),
        address: input.address.trim(),
        distanceKm: Math.max(0, input.distanceKm),
        availability: availabilityStatuses.includes(input.availability)
          ? input.availability
          : existing.availability,
        ...beds,
        emergency: input.emergency,
        facilities: [...input.facilities],
        specialties: cleanStrings(input.specialties),
      }
      const hospitals = current.hospitals.map((item) =>
        item.id === id ? hospital : item,
      )

      return {
        ...current,
        hospitals,
        specialists: syncSpecialistsWithHospitals(current.specialists, hospitals),
        activity: prependActivity(
          current.activity,
          createActivityEntry(
            'hospital',
            'Demo hospital updated',
            `${hospital.name} now reports ${hospital.availableBeds} of ${hospital.totalBeds} simulated beds free.`,
          ),
        ),
      }
    })
  }, [])

  const removeHospital = useCallback((id: string) => {
    setSnapshot((current) => {
      const hospital = current.hospitals.find((item) => item.id === id)
      if (!hospital) return current

      const hospitals = current.hospitals.filter((item) => item.id !== id)
      const specialists = syncSpecialistsWithHospitals(
        current.specialists,
        hospitals,
      )
      const insuranceProviders = current.insuranceProviders.map((provider) => ({
        ...provider,
        hospitalIds: provider.hospitalIds.filter((hospitalId) => hospitalId !== id),
      }))

      return {
        ...current,
        hospitals,
        specialists,
        insuranceProviders,
        activity: prependActivity(
          current.activity,
          createActivityEntry(
            'hospital',
            'Demo hospital removed',
            `${hospital.name} was removed from the simulated directory. Linked demo doctors were kept and unlinked.`,
          ),
        ),
      }
    })
  }, [])

  const addSpecialist = useCallback((input: DoctorInput): string => {
    const id = createEntityId(input.name, 'doctor')

    setSnapshot((current) => {
      const doctor: Specialist = {
        id,
        name: input.name.trim(),
        specialty: input.specialty,
        hospital: '',
        area: '',
        distanceKm: 0,
        experienceYears: input.experienceYears,
        availableToday: false,
        nextAvailable: '',
        qualifications: cleanStrings(input.qualifications),
        bio: input.bio.trim(),
        languages: cleanStrings(input.languages),
        consultationFee: Math.max(0, input.consultationFee),
        consultationTypes: [...input.consultationTypes],
        hospitalIds: [...input.hospitalIds],
        availability: input.availability,
        active: input.active,
      }
      const specialists = syncSpecialistsWithHospitals(
        [...current.specialists, doctor],
        current.hospitals,
      )

      return {
        ...current,
        specialists,
        activity: prependActivity(
          current.activity,
          createActivityEntry(
            'doctor',
            'Fictional doctor profile added',
            `${doctor.name} was added with ${cleanStrings(input.hospitalIds).length} demo hospital association${input.hospitalIds.length === 1 ? '' : 's'}.`,
          ),
        ),
      }
    })

    return id
  }, [])

  const updateSpecialist = useCallback((id: string, input: DoctorInput) => {
    setSnapshot((current) => {
      const existing = current.specialists.find((doctor) => doctor.id === id)
      if (!existing) return current

      const doctor: Specialist = {
        ...existing,
        name: input.name.trim(),
        specialty: input.specialty,
        experienceYears: input.experienceYears,
        qualifications: cleanStrings(input.qualifications),
        bio: input.bio.trim(),
        languages: cleanStrings(input.languages),
        consultationFee: Math.max(0, input.consultationFee),
        consultationTypes: [...input.consultationTypes],
        hospitalIds: [...input.hospitalIds],
        availability: input.availability,
        active: input.active,
      }
      const specialists = syncSpecialistsWithHospitals(
        current.specialists.map((item) => (item.id === id ? doctor : item)),
        current.hospitals,
      )

      return {
        ...current,
        specialists,
        activity: prependActivity(
          current.activity,
          createActivityEntry(
            'doctor',
            'Doctor profile updated',
            `${doctor.name}'s fictional qualifications, fee, and simulated availability were updated.`,
          ),
        ),
      }
    })
  }, [])

  const setSpecialistActive = useCallback((id: string, active: boolean) => {
    setSnapshot((current) => {
      const doctor = current.specialists.find((item) => item.id === id)
      if (!doctor || doctor.active === active) return current
      if (active && doctor.hospitalIds.length === 0) return current

      return {
        ...current,
        specialists: current.specialists.map((item) =>
          item.id === id ? { ...item, active } : item,
        ),
        activity: prependActivity(
          current.activity,
          createActivityEntry(
            'doctor',
            active ? 'Doctor activated' : 'Doctor deactivated',
            `${doctor.name} was ${active ? 'listed in' : 'hidden from'} the public demo directory.`,
          ),
        ),
      }
    })
  }, [])

  const removeSpecialist = useCallback((id: string) => {
    setSnapshot((current) => {
      const doctor = current.specialists.find((item) => item.id === id)
      if (!doctor) return current

      return {
        ...current,
        specialists: current.specialists.filter((item) => item.id !== id),
        activity: prependActivity(
          current.activity,
          createActivityEntry(
            'doctor',
            'Fictional doctor removed',
            `${doctor.name} was removed from the demo directory. Existing local demo appointments were kept.`,
          ),
        ),
      }
    })
  }, [])

  const addInsuranceProvider = useCallback(
    (input: InsuranceProviderInput): string => {
      const id = createEntityId(input.name, 'insurance')

      setSnapshot((current) => {
        const provider: InsuranceProvider = {
          id,
          name: input.name.trim(),
          planName: input.planName.trim(),
          active: input.active,
          coverage: [...input.coverage],
          rules: input.rules,
          hospitalIds: input.hospitalIds.filter((hospitalId) =>
            current.hospitals.some((hospital) => hospital.id === hospitalId),
          ),
          updatedAt: new Date().toISOString(),
        }

        return {
          ...current,
          insuranceProviders: [...current.insuranceProviders, provider],
          activity: prependActivity(
            current.activity,
            createActivityEntry(
              'insurance',
              'Demo insurance provider added',
              `${provider.name} was added with ${provider.hospitalIds.length} simulated hospital association${provider.hospitalIds.length === 1 ? '' : 's'}.`,
            ),
          ),
        }
      })

      return id
    },
    [],
  )

  const updateInsuranceProvider = useCallback(
    (id: string, input: InsuranceProviderInput) => {
      setSnapshot((current) => {
        const existing = current.insuranceProviders.find(
          (provider) => provider.id === id,
        )
        if (!existing) return current

        const provider: InsuranceProvider = {
          ...existing,
          name: input.name.trim(),
          planName: input.planName.trim(),
          active: input.active,
          coverage: [...input.coverage],
          rules: input.rules,
          hospitalIds: input.hospitalIds.filter((hospitalId) =>
            current.hospitals.some((hospital) => hospital.id === hospitalId),
          ),
          updatedAt: new Date().toISOString(),
        }

        return {
          ...current,
          insuranceProviders: current.insuranceProviders.map((item) =>
            item.id === id ? provider : item,
          ),
          activity: prependActivity(
            current.activity,
            createActivityEntry(
              'insurance',
              'Demo insurance provider updated',
              `${provider.name} coverage categories and simulated hospital links were updated.`,
            ),
          ),
        }
      })
    },
    [],
  )

  const setInsuranceProviderActive = useCallback(
    (id: string, active: boolean) => {
      setSnapshot((current) => {
        const provider = current.insuranceProviders.find((item) => item.id === id)
        if (!provider || provider.active === active) return current

        return {
          ...current,
          insuranceProviders: current.insuranceProviders.map((item) =>
            item.id === id
              ? { ...item, active, updatedAt: new Date().toISOString() }
              : item,
          ),
          activity: prependActivity(
            current.activity,
            createActivityEntry(
              'insurance',
              active
                ? 'Demo insurance provider activated'
                : 'Demo insurance provider deactivated',
              `${provider.name} is now ${active ? 'active' : 'inactive'} in this simulated catalog.`,
            ),
          ),
        }
      })
    },
    [],
  )

  const resetCatalog = useCallback(() => {
    adminCatalogStorage.clear()
    setSnapshot(createInitialCatalogSnapshot())
  }, [])

  const value = useMemo<DemoCatalogContextValue>(
    () => ({
      hospitals: snapshot.hospitals,
      specialists: snapshot.specialists,
      insuranceProviders: snapshot.insuranceProviders,
      patientAccounts: snapshot.patientAccounts,
      activity: snapshot.activity,
      addHospital,
      updateHospital,
      removeHospital,
      addSpecialist,
      updateSpecialist,
      setSpecialistActive,
      removeSpecialist,
      addInsuranceProvider,
      updateInsuranceProvider,
      setInsuranceProviderActive,
      recordActivity,
      resetCatalog,
    }),
    [
      snapshot,
      addHospital,
      updateHospital,
      removeHospital,
      addSpecialist,
      updateSpecialist,
      setSpecialistActive,
      removeSpecialist,
      addInsuranceProvider,
      updateInsuranceProvider,
      setInsuranceProviderActive,
      recordActivity,
      resetCatalog,
    ],
  )

  return (
    <DemoCatalogContext.Provider value={value}>
      {children}
    </DemoCatalogContext.Provider>
  )
}
