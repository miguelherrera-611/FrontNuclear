package com.microservice.gateway.auth;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class AuthorizationRules {

    private final Map<String, List<String>> roleRules = new HashMap<>();

    public AuthorizationRules() {
        roleRules.put("/api/pagos", List.of("admin")); // Solo admin
        roleRules.put("/api/productos", List.of("admin", "veterinario")); // Admin y veterinario
        roleRules.put("/api/citas", List.of("paciente", "veterinario", "admin")); // Todos
        roleRules.put("/agenda", List.of("user", "veterinario", "admin")); // Todos

        // Agrega más rutas según necesites
    }

    public boolean isAccessAllowed(String path, String role) {
        if (role == null || role.isEmpty()) {
            return false;
        }

        return roleRules.entrySet().stream()
                .filter(entry -> path.startsWith(entry.getKey()))
                .anyMatch(entry -> entry.getValue().contains(role.toLowerCase()));
    }

    public List<String> getAllowedRoles(String path) {
        return roleRules.entrySet().stream()
                .filter(entry -> path.startsWith(entry.getKey()))
                .findFirst()
                .map(Map.Entry::getValue)
                .orElse(List.of());
    }
}

