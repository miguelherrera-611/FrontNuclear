package co.edu.modulocitas.service;

import co.edu.modulocitas.model.HistoriaClinica;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface HistoriaClinicaService {
    List<HistoriaClinica> consultarHistoriaClinicas();
    Optional<HistoriaClinica> consultarHistoriaCita(Integer idCita);
    Optional<HistoriaClinica>  consultarHistoriaPaciente(String idPaciente);
    Optional<HistoriaClinica> consultarHistoriaPorId (Integer idHistoria);
    Optional<HistoriaClinica> consultarHistoriaPorIdVeternario (String idVeternario);
    HistoriaClinica crearHistoriaClinica(HistoriaClinica historiaClinica);
    Optional<HistoriaClinica> eliminarHistoriaClinica(Integer idHistoriaClinica);
    Optional<HistoriaClinica> actualizarHistoriaClinica( Integer idHistoria,HistoriaClinica historiaClinica);
}
