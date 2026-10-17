import { NUMERO_MOIS_LABEL, Paiement } from './paiement.model';

// Reflète RecuResponseDTO / CreateRecuRequestDTO (gn.projet.cotisation.dto.recus)
// Un reçu peut couvrir plusieurs paiements (plusieurs mois réglés d'un coup par le même membre).
export interface Recu {
  id: number;
  numero: string;
  /** ISO-8601 LocalDate */
  dateEmission: string;
  paiements: Paiement[];
}

export interface CreateRecuRequest {
  paiementIds: number[];
}

export function recuMontantTotal(recu: Recu): number {
  return recu.paiements.reduce((total, p) => total + p.montant, 0);
}

/** Ex: "Février 2026, Mai 2026 et Août 2026" (triés chronologiquement). */
export function recuPeriodes(recu: Recu): string {
  const libelles = [...recu.paiements]
    .sort((a, b) => a.annee - b.annee || a.mois - b.mois)
    .map((p) => `${NUMERO_MOIS_LABEL[p.mois]} ${p.annee}`);
  if (libelles.length <= 1) {
    return libelles[0] ?? '—';
  }
  return `${libelles.slice(0, -1).join(', ')} et ${libelles[libelles.length - 1]}`;
}
