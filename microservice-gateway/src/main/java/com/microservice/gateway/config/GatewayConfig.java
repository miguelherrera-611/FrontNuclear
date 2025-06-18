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
                .route("productos-service", r -> r.path("/api/productos/**")
                        .filters(f -> f.filter(authenticationFilter))
                        .uri("http://localhost:8081"))
                .route("pagos-service", r -> r.path("/api/pagos/**")
                        .filters(f -> f.filter(authenticationFilter))
                        .uri("http://localhost:8082"))
                .build();
    }
}

