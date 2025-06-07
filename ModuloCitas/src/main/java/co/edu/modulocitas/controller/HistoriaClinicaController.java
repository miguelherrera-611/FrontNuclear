package co.edu.modulocitas.controller;

import co.edu.modulocitas.model.HistoriaClinica;
import co.edu.modulocitas.service.HistoriaClinicaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/historiaClinica")
@RequiredArgsConstructor
public class HistoriaClinicaController {

    private final HistoriaClinicaService historiaClinicaService;

    @GetMapping
    public List<HistoriaClinica> consultarTodasLasCitas() {
        return historiaClinicaService.consultarHistoriaClinicas();
    }

    @GetMapping("/historia/{idHistoria}")
    public Optional<HistoriaClinica>  consultarHistoriaClinica(@PathVariable("idHistoria") Integer idHistoria) {
        return historiaClinicaService.consultarHistoriaPorId(idHistoria);
    }

    @GetMapping("/paciente/{idPaciente}")
    public Optional<HistoriaClinica> consultarHistoriaPaciente(@PathVariable("idPaciente") String  idPaciente) {
        return historiaClinicaService.consultarHistoriaPaciente(idPaciente);
    }

    @GetMapping("/cita/{idCita}")
    public Optional<HistoriaClinica> consultaHisoriaCita(@PathVariable("idCita") Integer idCita) {
        return historiaClinicaService.consultarHistoriaCita(idCita);
    }

    @GetMapping("/veterinario/{idVeterinario}")
    public Optional<HistoriaClinica> consultarHistoriaVeterinario(@PathVariable("idVeterinario") String idVeterinario) {
        return historiaClinicaService.consultarHistoriaPorIdVeternario(idVeterinario);
    }

    @PostMapping("/crear")
    public HistoriaClinica crearHistoriaClinica(@RequestBody HistoriaClinica historiaClinica) {
        return historiaClinicaService.crearHistoriaClinica(historiaClinica);
    }

    @PutMapping("/editar/{idHistoria}")
    public Optional<HistoriaClinica> actualizarHistoriaClinica(@PathVariable("idHistoria") Integer idHistoria, HistoriaClinica historiaClinica) {
        return historiaClinicaService.actualizarHistoriaClinica( idHistoria,historiaClinica);
    }

    @DeleteMapping("/eliminar/{idHistoria}")
    public Optional<HistoriaClinica> borrarHistoriaClinica(@PathVariable("idHistoria") Integer idHistoria) {
        return historiaClinicaService.eliminarHistoriaClinica(idHistoria);
    }

}
