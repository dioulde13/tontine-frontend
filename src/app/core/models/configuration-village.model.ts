// Reflète ConfigurationVillageResponseDTO / UpdateConfigurationVillageRequestDTO
// (gn.projet.cotisation.dto.configurationvillages)

export interface ConfigurationVillage {
  id: number;
  villageId: number;
  montantCotisationMensuelle: number;
  montantPenaliteRetard: number;
  montantPenaliteAbsenceReunion: number;
}

export interface UpdateConfigurationVillageRequest {
  montantCotisationMensuelle: number;
  montantPenaliteRetard: number;
  montantPenaliteAbsenceReunion: number;
}
