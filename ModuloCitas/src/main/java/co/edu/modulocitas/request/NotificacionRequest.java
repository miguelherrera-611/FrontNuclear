package co.edu.modulocitas.request;


import lombok.Data;

@Data
public class NotificacionRequest {

    private String tipo;
    private String mensaje;
    private String destinatario;
    private String adjunto;
    private String nombreAdjunto;
}
