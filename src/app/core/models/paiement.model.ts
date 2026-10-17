import { Utilisateur } from './utilisateur.model';

// Reflète l'enum Mois (gn.projet.cotisation.entity.Mois) : utilisé uniquement en entrée
// (CreatePaiementRequestDTO envoie un Set<Mois> sérialisé par son nom Java).
export const MOIS = [
  'JANVIER', 'FEVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
  'JUILLET', 'AOUT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DECEMBRE',
] as const;
export type Mois = (typeof MOIS)[number];

export const MOIS_LABEL: Record<Mois, string> = {
  JANVIER: 'Janvier', FEVRIER: 'Février', MARS: 'Mars', AVRIL: 'Avril',
  MAI: 'Mai', JUIN: 'Juin', JUILLET: 'Juillet', AOUT: 'Août',
  SEPTEMBRE: 'Septembre', OCTOBRE: 'Octobre', NOVEMBRE: 'Novembre', DECEMBRE: 'Décembre',
};

/** Numéro du mois (1-12) -> libellé français. PaiementResponseDTO.mois est cet entier, pas l'enum. */
export const NUMERO_MOIS_LABEL: Record<number, string> = {
  1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril', 5: 'Mai', 6: 'Juin',
  7: 'Juillet', 8: 'Août', 9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre',
};

// Reflète PaiementResponseDTO (gn.projet.cotisation.dto.paiements)
export interface Paiement {
  id: number;
  utilisateur: Utilisateur;
  mois: number;
  annee: number;
  montant: number;
  /** ISO-8601 LocalDate, ex: "2026-10-03" */
  datePaiement: string;
}

// Reflète CreatePaiementRequestDTO : paiement d'un ou plusieurs mois d'un coup, pour un membre donné.
export interface CreatePaiementRequest {
  utilisateurId: number;
  mois: Mois[];
  annee: number;
  /**
   * Pour les mois payés en retard (déjà passés) : applique ou non la pénalité de retard habituelle.
   * Sans effet sur les mois non en retard, qui n'en génèrent jamais. true si omis (comportement historique).
   */
  appliquerPenaliteRetard?: boolean;
}
