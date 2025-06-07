package co.edu.modulocitas.service.impl;

import co.edu.modulocitas.request.NotificacionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class NotificacionesService {

    @Qualifier(value ="notificacionesWebClient")
    private final WebClient notificacionesWebClient;



    public void enviarNotificacion(NotificacionRequest request) {
        notificacionesWebClient.post()
                .uri("/notificar") // Usa el path relativo correcto si tienes baseUrl
                .bodyValue(request)            // Forma más limpia y moderna de enviar el body
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(v -> System.out.println("Notificación enviada con éxito"))
                .doOnError(e -> System.err.println("Error al enviar notificación: " + e.getMessage()))
                .subscribe(); // Ejecuta la llamada en modo reactivo
    }

}
