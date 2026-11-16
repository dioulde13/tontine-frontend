import { TypeMouvementCaisse } from './type-mouvement-caisse.model';

// Reflète DepenseResponseDTO (gn.projet.cotisation.dto.depenses) — une sortie d'argent de la
// caisse du village. Un reçu (numeroRecu/dateEmissionRecu) est toujours généré automatiquement
// à la création : contrairement au reçu de paiement (Recu), pas de regroupement possible ici.
export interface Depense {
  id: number;
  type: TypeMouvementCaisse;
  montant: number;
  /** Motif libre, optionnel : vient préciser le type choisi. */
  motif: string | null;
  /** ISO-8601 LocalDate */
  date: string;
  numeroRecu: string;
  /** ISO-8601 LocalDate */
  dateEmissionRecu: string;
  /** ISO-8601 LocalDateTime. Une dépense n'est jamais modifiée après création. */
  creeLe: string;
  /** Téléphone du président qui a enregistré cette dépense ; null si hors contexte authentifié. */
  creePar: string | null;
  /** Nom complet résolu depuis creePar ; null si creePar est null ou ne correspond plus à personne. */
  creeParNom: string | null;
}

// Reflète CreateDepenseRequestDTO : typeId doit référencer un TypeMouvementCaisse de CE village.
export interface CreateDepenseRequest {
  typeId: number;
  montant: number;
  motif: string | null;
  date: string;
}
