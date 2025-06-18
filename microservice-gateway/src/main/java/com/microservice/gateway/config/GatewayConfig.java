package com.microservice.gateway.config;

import com.microservice.gateway.filters.AuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Autowired
    private AuthenticationFilter authenticationFilter;

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("usuarios", r -> r.path("/api/usuarios/**")
                        .filters(f -> f.filter (authenticationFilter))
                        .uri("http://localhost:8080"))
                .route("tienda_veterinaria", r -> r.path("/api/tienda/**")
                        .filters(f -> f.filter(authenticationFilter))
                        .uri("http://localhost:5050"))
                .route("ModuloCitas", r -> r.path("api/modulo_citas/**")
                        .filters(f -> f.filter(authenticationFilter))
                        .uri("http://localhost:8081"))
                .route("ModuloPagosStripe", r -> r.path("/api/pagos/**")
                        .filters(f -> f.filter(authenticationFilter))
                        .uri("http://localhost:5500"))
                .route("ModuloNotificaciones", r -> r.path("/api/notificaciones/**")
                        .filters(f -> f.filter(authenticationFilter))
                        .uri("http://localhost:8000"))
                .build();
    }
}

