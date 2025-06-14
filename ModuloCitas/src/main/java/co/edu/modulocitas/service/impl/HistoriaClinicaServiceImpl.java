package co.edu.modulocitas.service.impl;

import co.edu.modulocitas.model.Cita;
import co.edu.modulocitas.model.HistoriaClinica;
import co.edu.modulocitas.repository.HistoriaClinicaRepository;
import co.edu.modulocitas.request.NotificacionRequest;
import co.edu.modulocitas.service.AgendaService;
import co.edu.modulocitas.service.HistoriaClinicaService;
import com.itextpdf.text.BaseColor;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
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
    public Optional<HistoriaClinica> consultarHistoriaPorIdVeternario(String idVeterinario) {
        return historiaClinicaRepository.findHistoriaClinicaByIdVeterinario(idVeterinario);
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

//    private void notificarHistoriaClinica(HistoriaClinica historiaClinica) {
//        NotificacionRequest request = new NotificacionRequest();
//
//        String email = usuarioServiceImpl.obtenerEmail(historiaClinica.getIdPaciente());
//        String nombreMascota = usuarioServiceImpl.obtenerNombreMascota(historiaClinica.getIdPaciente());
//        String nombreVeterinario = usuarioServiceImpl.obtenerNombreVeterinario(historiaClinica.getIdVeternario());
//
//        request.setTipo("Historia Clínica");
//        request.setDestinatario(email);
//
//        String mensaje = String.format(
//                "¡Hola! 😊\n\n" +
//                        "Se ha registrado una nueva historia clínica para su mascota *%s*.\n\n" +
//                        "📅 Fecha de atención: %s\n" +
//                        "⏰ Hora: %s\n" +
//                        "👨‍⚕️ Atendido por: Dr. %s\n\n" +
//                        "🩺 Motivo de consulta: %s\n" +
//                        "📋 Diagnóstico: %s\n" +
//                        "💊 Tratamiento: %s\n" +
//                        "📌 Proceder: %s\n" +
//                        "📝 Observaciones: %s\n\n" +
//                        "Gracias por confiar en nosotros. 🐾\n\n" +
//                        "Este es un mensaje generado automáticamente. Por favor, no responder este correo.",
//                nombreMascota,
//                historiaClinica.getFecha().toString(),
//                historiaClinica.getHora().toString(),
//                nombreVeterinario,
//                historiaClinica.getMotivo(),
//                historiaClinica.getDiagnostico(),
//                historiaClinica.getTratamiento(),
//                historiaClinica.getProceder(),
//                historiaClinica.getObservaciones()
//        );
//
//        request.setMensaje(mensaje);
//
//        if (request.getDestinatario() == null || !request.getDestinatario().contains("@")) {
//            System.err.println("Email destinatario no válido: " + request.getDestinatario());
//            return;
//        }
//
//        if (request.getMensaje() == null || request.getMensaje().trim().isEmpty()) {
//            System.err.println("Mensaje vacío");
//            return;
//        }
//
//        notificacionesService.enviarNotificacion(request);
//    }

    private void notificarHistoriaClinica(HistoriaClinica historiaClinica) {
        String email = usuarioServiceImpl.obtenerEmail(historiaClinica.getIdPaciente());
        String nombreMascota = usuarioServiceImpl.obtenerNombreMascota(historiaClinica.getIdPaciente());
        String nombreVeterinario = usuarioServiceImpl.obtenerNombreVeterinario(historiaClinica.getIdVeterinario());

        byte[] pdf = generarPdfHistoriaClinica(historiaClinica, nombreMascota, nombreVeterinario);

        String base64Pdf = Base64.getEncoder().encodeToString(pdf);


        NotificacionRequest request = new NotificacionRequest();
        request.setTipo("Historia Clínica");
        request.setDestinatario(email);
        request.setMensaje("Hola, señor usuari@ "+"Se adjunta el resumen de la historia clínica de tu mascota.");
        request.setAdjunto(base64Pdf);
        request.setNombreAdjunto("Historia_" + nombreMascota + historiaClinica.getFecha()+".pdf");

        notificacionesService.enviarNotificacionConAdjunto(request);
    }

    public byte[] generarPdfHistoriaClinica(HistoriaClinica historia, String nombreMascota, String nombreVeterinario) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, out);
            document.open();

            // Fuentes
            Font tituloEmpresaFont = new Font(Font.HELVETICA, 20, Font.BOLD);
            Font subTituloFont = new Font(Font.HELVETICA, 12, Font.NORMAL);
            Font sectionTitleFont = new Font(Font.HELVETICA, 14, Font.BOLD);
            Font normalFont = new Font(Font.HELVETICA, 12);

            // Encabezado
            Paragraph encabezado = new Paragraph("🐶 Clínica Veterinaria Vida Animal", tituloEmpresaFont);
            encabezado.setAlignment(Element.ALIGN_CENTER);
            document.add(encabezado);

            Paragraph datosEmpresa = new Paragraph(
                    "📍 Dirección: Calle 123 #45-67, Ciudad Mascota\n" +
                            "📞 Tel: (123) 456 7890   ✉️ Email: contacto@vidaanimal.com\n\n",
                    subTituloFont
            );
            datosEmpresa.setAlignment(Element.ALIGN_CENTER);
            document.add(datosEmpresa);

            // Línea separadora
            document.add(new Paragraph("________________________________________________________\n\n"));

            // Título documento
            Paragraph titulo = new Paragraph("📝 Historia Clínica Veterinaria", sectionTitleFont);
            titulo.setAlignment(Element.ALIGN_CENTER);
            document.add(titulo);
            document.add(new Paragraph("\n"));

            // Datos generales
            document.add(new Paragraph("📅 Fecha: " + historia.getFecha(), normalFont));
            document.add(new Paragraph("⏰ Hora: " + historia.getHora(), normalFont));
            document.add(new Paragraph("👨‍⚕️ Veterinario: Dr. " + nombreVeterinario, normalFont));
            document.add(new Paragraph("🐾 Mascota: " + nombreMascota, normalFont));
            document.add(new Paragraph("\n"));

            // Secciones médicas
            document.add(new Paragraph("🩺 Motivo de consulta:", sectionTitleFont));
            document.add(new Paragraph(historia.getMotivo(), normalFont));
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("📋 Diagnóstico:", sectionTitleFont));
            document.add(new Paragraph(historia.getDiagnostico(), normalFont));
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("💊 Tratamiento:", sectionTitleFont));
            document.add(new Paragraph(historia.getTratamiento(), normalFont));
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("📌 Proceder:", sectionTitleFont));
            document.add(new Paragraph(historia.getProceder(), normalFont));
            document.add(new Paragraph("\n"));

            document.add(new Paragraph("📝 Observaciones:", sectionTitleFont));
            document.add(new Paragraph(historia.getObservaciones(), normalFont));

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }



}
