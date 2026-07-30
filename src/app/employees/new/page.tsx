"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Sector {
  id: number;
  name: string;
}

interface Location {
  id: number;
  name: string;
}

export default function NewEmployeePage() {
  const router = useRouter();
  const supabase = createClient();

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    nationality: "",
    national_registration: "",
    job_title: "",
    contract_type: "",
    date_of_hire: "",
    end_date: "",
    sector_id: "",
    location_id: "",
    is_inactive: false,
    email: "",
    mobile_phone: "",
    business_phone: "",
    home_phone: "",
    address: "",
    postal_code: "",
    city: "",
    province: "",
    country: "Belgique",
    granted_seniority: "",
    granted_seniority_date: "",
    inami_number: "",
    iban: "",
    bic: "",
  });

  useEffect(() => {
    async function fetchData() {
      const [sectorsRes, locationsRes] = await Promise.all([
        supabase.from("sectors").select("id, name").order("name"),
        supabase.from("locations").select("id, name").order("name"),
      ]);
      if (sectorsRes.data) setSectors(sectorsRes.data);
      if (locationsRes.data) setLocations(locationsRes.data);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.first_name.trim()) {
      setError("Le prénom est obligatoire.");
      return;
    }
    if (!form.last_name.trim()) {
      setError("Le nom est obligatoire.");
      return;
    }

    setLoading(true);

    const payload: Record<string, unknown> = {
      ...form,
      sector_id: form.sector_id ? Number(form.sector_id) : null,
      location_id: form.location_id ? Number(form.location_id) : null,
      granted_seniority: form.granted_seniority
        ? Number(form.granted_seniority)
        : null,
      date_of_birth: form.date_of_birth || null,
      date_of_hire: form.date_of_hire || null,
      end_date: form.end_date || null,
      granted_seniority_date: form.granted_seniority_date || null,
      title: form.title || null,
      contract_type: form.contract_type || null,
    };

    const { error: insertError } = await supabase
      .from("employees")
      .insert([payload]);

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/employees");
  }

  const inputClass =
    "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const sectionClass =
    "bg-white rounded-lg border border-gray-200 p-6 shadow-sm";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Ajouter un employé
        </h1>
        <Link
          href="/employees"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          ← Retour
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section: Identité */}
        <fieldset className={sectionClass}>
          <legend className="mb-4 text-lg font-semibold text-gray-800">
            Identité
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className={labelClass}>
                Titre
              </label>
              <select
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">-- Sélectionner --</option>
                <option value="M">M</option>
                <option value="Mme">Mme</option>
                <option value="Mlle">Mlle</option>
              </select>
            </div>
            <div />
            <div>
              <label htmlFor="first_name" className={labelClass}>
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={form.first_name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="last_name" className={labelClass}>
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={form.last_name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="date_of_birth" className={labelClass}>
                Date de naissance
              </label>
              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={form.date_of_birth}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="nationality" className={labelClass}>
                Nationalité
              </label>
              <input
                id="nationality"
                name="nationality"
                type="text"
                value={form.nationality}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="national_registration" className={labelClass}>
                N° Registre National
              </label>
              <input
                id="national_registration"
                name="national_registration"
                type="text"
                value={form.national_registration}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </fieldset>

        {/* Section: Emploi */}
        <fieldset className={sectionClass}>
          <legend className="mb-4 text-lg font-semibold text-gray-800">
            Emploi
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="job_title" className={labelClass}>
                Fonction
              </label>
              <input
                id="job_title"
                name="job_title"
                type="text"
                value={form.job_title}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="contract_type" className={labelClass}>
                Type de contrat
              </label>
              <select
                id="contract_type"
                name="contract_type"
                value={form.contract_type}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">-- Sélectionner --</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="INTERIM">INTERIM</option>
                <option value="STAGE">STAGE</option>
                <option value="BENEVOLE">BENEVOLE</option>
              </select>
            </div>
            <div>
              <label htmlFor="date_of_hire" className={labelClass}>
                Date d&apos;embauche
              </label>
              <input
                id="date_of_hire"
                name="date_of_hire"
                type="date"
                value={form.date_of_hire}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="end_date" className={labelClass}>
                Date de fin
              </label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                value={form.end_date}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="sector_id" className={labelClass}>
                Secteur
              </label>
              <select
                id="sector_id"
                name="sector_id"
                value={form.sector_id}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">-- Sélectionner --</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="location_id" className={labelClass}>
                Site
              </label>
              <select
                id="location_id"
                name="location_id"
                value={form.location_id}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">-- Sélectionner --</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="is_inactive"
                name="is_inactive"
                type="checkbox"
                checked={form.is_inactive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_inactive" className="text-sm text-gray-700">
                Inactif
              </label>
            </div>
          </div>
        </fieldset>

        {/* Section: Contact */}
        <fieldset className={sectionClass}>
          <legend className="mb-4 text-lg font-semibold text-gray-800">
            Contact
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="mobile_phone" className={labelClass}>
                Mobile
              </label>
              <input
                id="mobile_phone"
                name="mobile_phone"
                type="text"
                value={form.mobile_phone}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="business_phone" className={labelClass}>
                Tél. professionnel
              </label>
              <input
                id="business_phone"
                name="business_phone"
                type="text"
                value={form.business_phone}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="home_phone" className={labelClass}>
                Tél. domicile
              </label>
              <input
                id="home_phone"
                name="home_phone"
                type="text"
                value={form.home_phone}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </fieldset>

        {/* Section: Adresse */}
        <fieldset className={sectionClass}>
          <legend className="mb-4 text-lg font-semibold text-gray-800">
            Adresse
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="address" className={labelClass}>
                Adresse
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="postal_code" className={labelClass}>
                Code postal
              </label>
              <input
                id="postal_code"
                name="postal_code"
                type="text"
                value={form.postal_code}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="city" className={labelClass}>
                Ville
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="province" className={labelClass}>
                Province
              </label>
              <input
                id="province"
                name="province"
                type="text"
                value={form.province}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="country" className={labelClass}>
                Pays
              </label>
              <input
                id="country"
                name="country"
                type="text"
                value={form.country}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </fieldset>

        {/* Section: Ancienneté & Rémunération */}
        <fieldset className={sectionClass}>
          <legend className="mb-4 text-lg font-semibold text-gray-800">
            Ancienneté & Rémunération
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="granted_seniority" className={labelClass}>
                Ancienneté accordée (années)
              </label>
              <input
                id="granted_seniority"
                name="granted_seniority"
                type="number"
                min="0"
                value={form.granted_seniority}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="granted_seniority_date" className={labelClass}>
                Date d&apos;ancienneté accordée
              </label>
              <input
                id="granted_seniority_date"
                name="granted_seniority_date"
                type="date"
                value={form.granted_seniority_date}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="inami_number" className={labelClass}>
                N° INAMI
              </label>
              <input
                id="inami_number"
                name="inami_number"
                type="text"
                value={form.inami_number}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="iban" className={labelClass}>
                IBAN
              </label>
              <input
                id="iban"
                name="iban"
                type="text"
                value={form.iban}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="bic" className={labelClass}>
                BIC
              </label>
              <input
                id="bic"
                name="bic"
                type="text"
                value={form.bic}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/employees"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
