import { Paiement } from './paiement.model';
import { Penalite } from './penalite.model';
import { Reunion } from './reunion.model';
import { Village } from './village.model';

// Reflète AdminDashboardResponseDTO (gn.projet.cotisation.dto.dashboard) — GET /api/admin/dashboard
export interface AdminDashboard {
  nombreVillages: number;
  nombreAdmins: number;
  nombrePresidents: number;
  nombreMembres: number;
  nombreReunions: number;
  nombrePaiements: number;
  montantTotalCotisationsCollectees: number;
  nombrePenalitesNonPayees: number;
  montantTotalPenalitesNonPayees: number;
}

// Reflète PresidentDashboardResponseDTO — GET /api/villages/{villageId}/dashboard
export interface PresidentDashboard {
  village: Village;
  moisCourant: number;
  anneeCourante: number;
  nombreMembres: number;
  /** null si ConfigurationVillage n'a pas encore été créée pour ce village. */
  montantCotisationMensuelle: number | null;
  nombreMembresAJourMoisCourant: number;
  nombreMembresEnRetardMoisCourant: number;
  montantTotalCollecte: number;
  montantCollecteMoisCourant: number;
  nombrePenalitesNonPayees: number;
  montantTotalPenalitesNonPayees: number;
  nombreReunions: number;
  /** null si aucune réunion n'est planifiée dans le futur. */
  prochaineReunion: Reunion | null;
  /** Pourcentage (0 à 100). */
  tauxPresence: number;
}

// Reflète MembreDashboardResponseDTO — GET /api/membres/moi/dashboard
export interface MembreDashboard {
  village: Village;
  moisCourant: number;
  anneeCourante: number;
  /** null si le village n'a pas encore de configuration. */
  montantCotisationMensuelle: number | null;
  aPayeMoisCourant: boolean;
  montantTotalPaye: number;
  nombrePaiements: number;
  nombrePenalitesNonPayees: number;
  montantTotalPenalitesNonPayees: number;
  /** null si aucune réunion n'est planifiée dans le futur pour son village. */
  prochaineReunion: Reunion | null;
  nombrePresences: number;
  nombreAbsences: number;
  /** Pourcentage (0 à 100). */
  tauxPresence: number;
}

// Reflète MoisImpayeDTO (gn.projet.cotisation.dto.membre) : un mois de l'année courante sans
// Paiement correspondant pour le membre connecté.
export interface MoisImpaye {
  mois: number;
  annee: number;
  montant: number;
}

// Reflète MembreCotisationsResponseDTO — GET /api/membres/moi/cotisations
export interface MembreCotisations {
  /** null si ConfigurationVillage n'a pas encore été créée pour le village du membre. */
  montantCotisationMensuelle: number | null;
  /** Historique complet des paiements du membre, du plus récent au plus ancien. */
  paiements: Paiement[];
  montantTotalPaye: number;
  /** Mois de l'année courante (janvier -> mois courant inclus) sans paiement correspondant. */
  moisImpayes: MoisImpaye[];
  montantTotalDu: number;
  /** Historique complet des pénalités du membre, de la plus récente à la plus ancienne. */
  penalites: Penalite[];
  montantTotalPenalitesNonPayees: number;
}
