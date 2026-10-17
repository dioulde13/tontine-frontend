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
