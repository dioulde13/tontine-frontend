// Reflète ConfigurationVillageResponseDTO / UpdateConfigurationVillageRequestDTO
// (gn.projet.cotisation.dto.configurationvillages)

export interface ConfigurationVillage {
  id: number;
  villageId: number;
  montantCotisationMensuelle: number;
  montantPenaliteRetard: number;
  montantPenaliteAbsenceReunion: number;
  /** ISO-8601 LocalDateTime ; null si jamais modifiée hors contexte authentifié. */
  modifieLe: string | null;
  /** Téléphone du président qui a fait la dernière modification. */
  modifiePar: string | null;
  /** Nom complet résolu depuis modifiePar ; null si modifiePar est null ou ne correspond plus à personne. */
  modifieParNom: string | null;
}

export interface UpdateConfigurationVillageRequest {
  montantCotisationMensuelle: number;
  montantPenaliteRetard: number;
  montantPenaliteAbsenceReunion: number;
}
