package co.edu.modulocitas.repository;

import co.edu.modulocitas.model.HistoriaClinica;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HistoriaClinicaRepository extends JpaRepository<HistoriaClinica, Integer> {

    Optional<HistoriaClinica> findHistoriaClinicaByIdPaciente(String idPaciente);
    Optional<HistoriaClinica> findHistoriaClinicaByIdVeternario (String idVeternario);
}
