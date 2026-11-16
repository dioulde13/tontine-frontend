/**
 * true si `dateIso` (LocalDate "2026-03-05" ou LocalDateTime "2026-03-05T10:00:00") tombe dans
 * l'intervalle [from, to] (bornes incluses, chacune "2026-03-05" ou null = illimité). Compare
 * uniquement la partie date (10 premiers caractères) pour que les champs LocalDateTime se comparent
 * correctement à des bornes qui n'ont jamais d'heure.
 */
export function dansPeriode(dateIso: string, from: string | null, to: string | null): boolean {
  const jour = dateIso.slice(0, 10);
  if (from && jour < from) {
    return false;
  }
  if (to && jour > to) {
    return false;
  }
  return true;
}

/** "2026-11-01" — 1er jour du mois courant, en LocalDate ISO. Sert de borne par défaut aux filtres
 *  par plage de dates (plutôt que de les laisser vides), sur toutes les pages de listes. */
export function debutMoisCourant(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

/** "2026-11-30" — dernier jour du mois courant, en LocalDate ISO. */
export function finMoisCourant(): string {
  const now = new Date();
  const dernierJour = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(dernierJour).padStart(2, '0')}`;
}
