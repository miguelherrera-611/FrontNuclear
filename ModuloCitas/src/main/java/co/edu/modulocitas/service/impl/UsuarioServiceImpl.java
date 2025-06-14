package co.edu.modulocitas.service.impl;


import co.edu.modulocitas.Exception.VeterinarioNoDisponible;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl {

    @Qualifier(value = "usuarioWebClient")
    private final WebClient usuarioWebClient;


    // Metodo que consulta a otro microservicio si un veterinario está disponible en una fecha y hora específicas.
    public void verificarDisponibilidadVeterinario(String veterinarioId, LocalDate fecha, LocalTime hora) {


        // Realiza una solicitud HTTP GET al endpoint del microservicio de usuarios
        Map<String, Object> response = usuarioWebClient.get() // Inicia la construcción de una petición GET con WebClient
                .uri(uriBuilder -> uriBuilder              // Usa un uriBuilder para construir dinámicamente la URL
                        .path("/disponibilidades/verificar/{veterinarioId}")    // Define el path del endpoint con un parámetro
                        .queryParam("fecha", fecha)            // Agrega el parámetro de la fecha (en formato ISO)
                        .queryParam("hora", hora)              // Agrega el parámetro de la hora (en formato HH:mm)
                        .build(veterinarioId))                 // Sustituye el {veterinarioId} en la URL con el valor real
//                .uri(urlCompleta)
                .retrieve()                                // Ejecuta la solicitud HTTP y obtiene la respuesta
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {}) // Convierte la respuesta a un Mono de tipo Map<String, Object>
                .block();                                  // Bloquea hasta recibir la respuesta (de forma sincrónica)

        if (response == null || !Boolean.TRUE.equals(response.get("disponible"))) {
            throw new VeterinarioNoDisponible("El veterinario no está disponible en ese horario");
        }
    }

    public String obtenerEmail(String idMascota) {
        try {
            String email= usuarioWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/usuarios/buscarEmail/idMascota/{idMascota}")
                            .build(idMascota))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(); // Espera sincrónicamente la respuesta
            System.out.println(email);
            return email;
        } catch (Exception e) {
            System.err.println("Error al obtener el email del usuario: " + e.getMessage());
            return null;
        }
    }

    public String obtenerNombreMascota(String idMascota) {
         try {
             String nombre = usuarioWebClient.get()
                     .uri(uriBuilder -> uriBuilder
                             .path("/mascotas/nombre/{idMascota}")
                             .build(idMascota))
                     .retrieve()
                     .bodyToMono(String.class)
                     .block(); // Espera sincrónicamente la respuesta
             System.out.println("Mascota:" +nombre);
             return nombre;
         } catch (Exception e) {
             System.err.println("Error al obtener el nombre de la mascota: " + e.getMessage());
             return null;
         }
    }

    public String obtenerNombreVeterinario(String idVeterinario) {
        try {
            String nombre = usuarioWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/veterinarios/nombre/{idVeterinario}")
                            .build(idVeterinario))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(); // Espera sincrónicamente la respuesta
            System.out.println("Veterinario:" +idVeterinario);
            System.out.println("Veterinario"+ nombre);
            return nombre;
        } catch (Exception e) {
            System.err.println("Error al obtener el nombre del veterinario: " + e.getMessage());
            return null;
        }
    }
}
