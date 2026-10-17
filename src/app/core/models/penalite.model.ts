import { Utilisateur } from './utilisateur.model';

// Reflète les enums TypePenalite / StatutPenalite (gn.projet.cotisation.entity)
export type TypePenalite = 'RETARD_PAIEMENT' | 'ABSENCE_REUNION' | 'AUTRE';
export type StatutPenalite = 'PAYEE' | 'NON_PAYEE';

export const TYPE_PENALITE_LABEL: Record<TypePenalite, string> = {
  RETARD_PAIEMENT: 'Retard de paiement',
  ABSENCE_REUNION: 'Absence à une réunion',
  AUTRE: 'Autre (manuelle)',
};

// Reflète PenaliteResponseDTO (gn.projet.cotisation.dto.penalites)
export interface Penalite {
  id: number;
  utilisateur: Utilisateur;
  type: TypePenalite;
  montant: number;
  /** ISO-8601 LocalDate */
  date: string;
  statut: StatutPenalite;
  /** Rempli seulement si type = RETARD_PAIEMENT */
  paiementOrigineId: number | null;
  /** Mois (1-12) du paiement en retard à l'origine. Rempli seulement si type = RETARD_PAIEMENT */
  periodeMois: number | null;
  /** Année du paiement en retard à l'origine. Rempli seulement si type = RETARD_PAIEMENT */
  periodeAnnee: number | null;
  /** Rempli seulement si type = ABSENCE_REUNION */
  presenceOrigineId: number | null;
}

// Reflète UpdatePenaliteRequestDTO : le backend n'autorise QUE type=AUTRE en création manuelle
// (RETARD_PAIEMENT / ABSENCE_REUNION sont déclenchées automatiquement par le serveur).
export interface CreatePenaliteManuelleRequest {
  utilisateurId: number;
  type: 'AUTRE';
  montant: number;
  date: string;
  statut: StatutPenalite;
}
