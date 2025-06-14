package co.edu.modulocitas.service.impl;

import co.edu.modulocitas.model.Cita;
import co.edu.modulocitas.model.HistoriaClinica;
import co.edu.modulocitas.repository.HistoriaClinicaRepository;
import co.edu.modulocitas.request.NotificacionRequest;
import co.edu.modulocitas.service.AgendaService;
import co.edu.modulocitas.service.HistoriaClinicaService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;


@Service
@AllArgsConstructor
public class HistoriaClinicaServiceImpl implements HistoriaClinicaService {

    private final HistoriaClinicaRepository historiaClinicaRepository;
    private final AgendaService agendaService;
    private final UsuarioServiceImpl usuarioServiceImpl;
    private final NotificacionesService  notificacionesService;


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

        Optional<Cita> citaOptional = agendaService.consultarCitaPorId(historiaClinica.getIdCita());

        if (citaOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La cita no existe.");
        }

    notificarHistoriaClinica(historiaClinica);
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

    private void notificarHistoriaClinica(HistoriaClinica historiaClinica) {
        NotificacionRequest request = new NotificacionRequest();

        String email = usuarioServiceImpl.obtenerEmail(historiaClinica.getIdPaciente());
        String nombreMascota = usuarioServiceImpl.obtenerNombreMascota(historiaClinica.getIdPaciente());
        String nombreVeterinario = usuarioServiceImpl.obtenerNombreVeterinario(historiaClinica.getIdVeternario());

        request.setTipo("Historia Clínica");
        request.setDestinatario(email);

        String mensaje = String.format(
                "¡Hola! 😊\n\n" +
                        "Se ha registrado una nueva historia clínica para su mascota *%s*.\n\n" +
                        "📅 Fecha de atención: %s\n" +
                        "⏰ Hora: %s\n" +
                        "👨‍⚕️ Atendido por: Dr. %s\n\n" +
                        "🩺 Motivo de consulta: %s\n" +
                        "📋 Diagnóstico: %s\n" +
                        "💊 Tratamiento: %s\n" +
                        "📌 Proceder: %s\n" +
                        "📝 Observaciones: %s\n\n" +
                        "Gracias por confiar en nosotros. 🐾\n\n" +
                        "Este es un mensaje generado automáticamente. Por favor, no responder este correo.",
                nombreMascota,
                historiaClinica.getFecha().toString(),
                historiaClinica.getHora().toString(),
                nombreVeterinario,
                historiaClinica.getMotivo(),
                historiaClinica.getDiagnostico(),
                historiaClinica.getTratamiento(),
                historiaClinica.getProceder(),
                historiaClinica.getObservaciones()
        );

        request.setMensaje(mensaje);

        if (request.getDestinatario() == null || !request.getDestinatario().contains("@")) {
            System.err.println("Email destinatario no válido: " + request.getDestinatario());
            return;
        }

        if (request.getMensaje() == null || request.getMensaje().trim().isEmpty()) {
            System.err.println("Mensaje vacío");
            return;
        }

        notificacionesService.enviarNotificacion(request);
    }

    
}
