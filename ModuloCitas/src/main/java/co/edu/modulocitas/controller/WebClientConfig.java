package co.edu.modulocitas.controller;

import lombok.Value;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    @Qualifier("usuarioWebClient")
    public WebClient usuarioWebClient(WebClient.Builder builder){
        return builder
                .baseUrl("http://localhost:8080/api")
                .build();
    }

    @Bean
    @Qualifier("notificacionesWebClient")
    public WebClient notificacionesWebClient(WebClient.Builder builder){
        return builder
                .baseUrl("http://localhost:8000")
                .build();
    }
}
