package co.edu.modulocitas.service.impl;


import co.edu.modulocitas.Exception.RecursoNoEncontradoExcepcion;
import co.edu.modulocitas.Exception.UsuarioOcupadoExcepcion;
import co.edu.modulocitas.Exception.VeterinarioNoDisponible;
import co.edu.modulocitas.enums.Estado;
import co.edu.modulocitas.model.Cita;
import co.edu.modulocitas.model.Servicio;
import co.edu.modulocitas.repository.CitaRepository;
import co.edu.modulocitas.request.NotificacionRequest;
import co.edu.modulocitas.service.AgendaService;
import co.edu.modulocitas.service.ServicioService;
import feign.Request;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
    private final NotificacionesService notificacionesService;
    private final UsuarioServiceImpl usuarioServiceImpl;


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
        usuarioServiceImpl.verificarDisponibilidadVeterinario(cita.getIdVeterinario(), cita.getFecha(),cita.getHora());
        cita.setServicio(servicio);
        notificarCita(cita);

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

    private void notificarCita(Cita cita) {
        NotificacionRequest request = new NotificacionRequest();

        String email = usuarioServiceImpl.obtenerEmail(cita.getIdPaciente());
        String nombreMascota = usuarioServiceImpl.obtenerNombreMascota(cita.getIdPaciente());
        String nombreVeterinario = usuarioServiceImpl.obtenerNombreVeterinario(cita.getIdPaciente());

        request.setTipo("Cita");
        request.setDestinatario(email);
        String mensaje = String.format(
                "¡Hola! 😊\n\n" +
                        "A agendado %s para su mascota *%s* exitosamente.\n\n" +
                        "📅 Fecha: %s\n" +
                        "⏰ Hora: %s\n" +
                        "👨‍⚕️ Veterinario asignado: Dr. %s\n" +
                        "Duracion:%s\n\n"+
                        "Por favor asegúrese de llegar con 10 minutos de anticipación. Si necesita reprogramar, contáctenos a la brevedad.\n\n" +
                        "¡Gracias por confiar en nosotros! 🐾\n\n\n\n" +
                        "Mensaje generado automaticamente, por favor no respoder este correo.",
                cita.getServicio().getTipo(),
                nombreMascota,
                cita.getFecha().toString(),
                cita.getHora().toString(),
                nombreVeterinario,
                cita.getServicio().getDuracion()
        );
        request.setMensaje(mensaje);

        if (request.getDestinatario() == null || !request.getDestinatario().contains("@")) {
            System.err.println("Email destinatario no válido: {}" + request.getDestinatario());
            return;
        }

        if (request.getMensaje() == null || request.getMensaje().trim().isEmpty()) {
            System.err.println("Mensaje vacío");
            return;
        }


        notificacionesService.enviarNotificacion(request);
    }



}

