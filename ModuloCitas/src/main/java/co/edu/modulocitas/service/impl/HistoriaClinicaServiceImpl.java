package co.edu.modulocitas.service.impl;

import co.edu.modulocitas.model.HistoriaClinica;
import co.edu.modulocitas.repository.HistoriaClinicaRepository;
import co.edu.modulocitas.service.HistoriaClinicaService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
@AllArgsConstructor
public class HistoriaClinicaServiceImpl implements HistoriaClinicaService {

    private final HistoriaClinicaRepository historiaClinicaRepository;


    @Override
    public List<HistoriaClinica> consultarHistoriaClinicas() {
        return  historiaClinicaRepository.findAll();
    }

    @Override
    public Optional<HistoriaClinica> consultarHistoriaCita(Integer idCita) {
        return historiaClinicaRepository.findById(idCita);
    }

    @Override
    public HistoriaClinica crearHistoriaClinica(HistoriaClinica historiaClinica) {
        return historiaClinicaRepository.save(historiaClinica);
    }

    @Override
    public Optional<HistoriaClinica> consultarHistoriaPaciente(String idPaciente) {
        return historiaClinicaRepository.findHistoriaClinicaByIdPaciente(idPaciente);
    }

    @Override
    public Optional<HistoriaClinica> consultarHistoriaPorId(Integer idHistoria) {
        return historiaClinicaRepository.findById(idHistoria);
    }

    @Override
    public Optional<HistoriaClinica> consultarHistoriaPorIdVeternario(String idVeternario) {
        return historiaClinicaRepository.findHistoriaClinicaByIdVeternario(idVeternario);
    }

    @Override
    public Optional<HistoriaClinica> eliminarHistoriaClinica(Integer idHistoriaClinica) {
        return historiaClinicaRepository.findById(idHistoriaClinica)
                .map(historiaClinica -> {
                    historiaClinicaRepository.delete(historiaClinica);
                    return historiaClinica;
                });
    }

    @Override
    public Optional<HistoriaClinica> actualizarHistoriaClinica( Integer idHistoria,HistoriaClinica historiaClinica) {
        return historiaClinicaRepository.findById(idHistoria)
                .map(historiaActual -> {
                    historiaActual.setDiagnostico(historiaClinica.getDiagnostico());
                    historiaActual.setMotivo(historiaClinica.getMotivo());
                    historiaActual.setProceder(historiaClinica.getProceder());
                    historiaActual.setObservaciones(historiaClinica.getObservaciones());
                    historiaActual.setTratamiento(historiaClinica.getTratamiento());

                    return historiaClinicaRepository.save(historiaActual);
                });
    }
}
