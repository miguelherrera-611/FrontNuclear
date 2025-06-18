package com.microservice.gateway.config;

import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class PublicPathConfig {
    private final List<String> publicPaths = List.of(
            "/api/usuarios/login",
            "/api/usuarios/registro",
            "/api/productos/lista"
    );

    public boolean isPublic(String path) {
        return publicPaths.stream().anyMatch(path::startsWith);
    }
}

