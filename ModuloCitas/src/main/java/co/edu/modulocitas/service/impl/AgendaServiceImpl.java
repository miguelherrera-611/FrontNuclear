package co.edu.modulocitas.service.impl;


import co.edu.modulocitas.Exception.RecursoNoEncontradoExcepcion;
import co.edu.modulocitas.Exception.UsuarioOcupadoExcepcion;
import co.edu.modulocitas.Exception.VeterinarioNoDisponible;
import co.edu.modulocitas.enums.Estado;
import co.edu.modulocitas.model.Cita;
import co.edu.modulocitas.model.Servicio;
import co.edu.modulocitas.repository.CitaRepository;
import co.edu.modulocitas.service.AgendaService;
import co.edu.modulocitas.service.ServicioService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class AgendaServiceImpl implements AgendaService {

    private final CitaRepository citaRepository;
    private final ServicioService servicioService;
    private final WebClient webClient;

    List<Estado> estadosOcupados = List.of(Estado.PROGRAMADA, Estado.ATENDIDA, Estado.EN_CURSO);

    @Override
    public List<Cita> consultarCitas() {
        return citaRepository.findAll();
    }

    @Override
    public Optional<Cita> consultarCitaPorId(Integer idCita){
        return citaRepository.findById(idCita);
    }

    @Override
    public Cita crearCita(Cita cita) {

        Servicio servicio = validarYObtenerServicio(cita.getServicio().getId());
        validarVeterinarioDisponible(cita.getIdVeterinario(), cita.getFecha(), cita.getHora());
        validarPacienteDisponible(cita.getIdPaciente(), cita.getFecha(), cita.getHora());
        verificarDisponibilidadVeterinario(cita.getIdVeterinario(), cita.getFecha(),cita.getHora());
        cita.setServicio(servicio);

        return citaRepository.save(cita);

    }

    @Override
    public Optional<Cita> actualizarCita(int idCita, Cita cita) {
        return citaRepository.findById(idCita)
                .map(existingCita -> {
                    existingCita.setFecha(cita.getFecha());
                    existingCita.setHora( cita.getHora());
                    existingCita.setEstado(cita.getEstado());
                    existingCita.setEsUrgencia(cita.isEsUrgencia());
                    existingCita.setIdPaciente(cita.getIdPaciente());
                    return citaRepository.save(existingCita);
                });
    }

    @Override
    public Optional<Cita> cambiarEstado(int idCita, Estado estado) {
        return citaRepository.findById(idCita)
                .map( existingCita ->{
                    existingCita.setEstado(estado);
                    return citaRepository.save(existingCita);
                });
    }

    // Metodo que consulta a otro microservicio si un veterinario está disponible en una fecha y hora específicas.
    public void verificarDisponibilidadVeterinario(String veterinarioId, LocalDate fecha, LocalTime hora) {

            // Realiza una solicitud HTTP GET al endpoint del microservicio de usuarios
        Map<String, Object> response = webClient.get() // Inicia la construcción de una petición GET con WebClient
                .uri(uriBuilder -> uriBuilder              // Usa un uriBuilder para construir dinámicamente la URL
                        .path("/verificar/{veterinarioId}")    // Define el path del endpoint con un parámetro
                        .queryParam("fecha", fecha)            // Agrega el parámetro de la fecha (en formato ISO)
                        .queryParam("hora", hora)              // Agrega el parámetro de la hora (en formato HH:mm)
                        .build(veterinarioId))                 // Sustituye el {veterinarioId} en la URL con el valor real
                .retrieve()                                // Ejecuta la solicitud HTTP y obtiene la respuesta
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {}) // Convierte la respuesta a un Mono de tipo Map<String, Object>
                .block();                                  // Bloquea hasta recibir la respuesta (de forma sincrónica)

        // Si la respuesta no es nula y contiene la clave "disponible"
//            if (response != null && response.containsKey("disponible")) {
//                // Devuelve true si el valor de "disponible" es true, de lo contrario false
//                return Boolean.TRUE.equals(response.get("disponible"));
        if (response == null || !Boolean.TRUE.equals(response.get("disponible"))) {
            throw new VeterinarioNoDisponible("El veterinario no está disponible en ese horario");
        }



    }


    @Override
    public List<Cita> consultarCitaPorEstado(Estado estado) {
        return citaRepository.findCitaByEstado(estado);
    }

    @Override
    public List<Cita> consultarCitaPorFecha(LocalDate fecha) {
        return citaRepository.findCitaByFecha(fecha);
    }

    @Override
    public List<Cita> consultarCitaPorHora(LocalTime hora) {
        return citaRepository.findCitaByHora(hora);
    }

    @Override
    public List<Cita> consultarCitaPorFechaYHora(LocalDate fecha, LocalTime hora) {
        return citaRepository.findCitaByFechaAndHora(fecha, hora);
    }

    @Override
    public List<Cita> consultarCitaPorVeterinario(String idVeterinario) {
        return citaRepository.findCitaByIdVeterinario(idVeterinario);
    }

    @Override
    public List<Cita> consultarCitaPorPaciente(String idPaciente) {
        return citaRepository.findCitaByIdPaciente(idPaciente);
    }

//    private void validarVeterinarioDisponible(Integer idVeterinario, LocalDate fecha, LocalTime hora) {
//        boolean vetOcupado = citaRepository.existsByIdVeterinarioAndFechaAndHora(idVeterinario, fecha, hora);
//        if (vetOcupado) {
//            throw new UsuarioOcupadoExcepcion("El veterinario ya tiene una cita en esa fecha y hora.");
//        }
//    }
//
//    private void validarPacienteDisponible(Integer idPaciente, LocalDate fecha, LocalTime hora) {
//        boolean pacienteOcupado = citaRepository.existsByIdPacienteAndFechaAndHora(idPaciente, fecha, hora);
//        if (pacienteOcupado) {
//            throw new UsuarioOcupadoExcepcion("La mascota ya tiene una cita en esa fecha y hora.");
//        }
//    }

    private void validarVeterinarioDisponible(String idVeterinario, LocalDate fecha, LocalTime hora) {

        boolean vetOcupado = citaRepository.existsByIdVeterinarioAndFechaAndHoraAndEstadoIn(
                idVeterinario, fecha, hora, estadosOcupados
        );
        if (vetOcupado) {
            throw new UsuarioOcupadoExcepcion("El veterinario ya tiene una cita en esa fecha y hora.");
        }
    }

    private void validarPacienteDisponible(String idPaciente, LocalDate fecha, LocalTime hora) {
        boolean pacienteOcupado = citaRepository.existsByIdPacienteAndFechaAndHoraAndEstadoIn(
                idPaciente, fecha, hora, estadosOcupados
        );
        if (pacienteOcupado) {
            throw new UsuarioOcupadoExcepcion("La mascota ya tiene una cita en esa fecha y hora.");
        }
    }

    private Servicio validarYObtenerServicio(Integer servicioId) {
        return servicioService.consultarServicioPorId(servicioId)
                .orElseThrow(() -> new RecursoNoEncontradoExcepcion("El servicio con ID " + servicioId + " no existe. No se puede crear la cita."));
    }

}

