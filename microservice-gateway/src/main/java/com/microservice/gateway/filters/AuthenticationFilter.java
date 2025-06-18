package com.microservice.gateway.filters;

import com.microservice.gateway.auth.AuthorizationRules;
import com.microservice.gateway.utils.JwtUtil;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import io.jsonwebtoken.Claims;

@Component
public class AuthenticationFilter implements GatewayFilter {

    private final JwtUtil jwtUtil;
    private final AuthorizationRules authorizationRules;

    public AuthenticationFilter(JwtUtil jwtUtil, AuthorizationRules authorizationRules) {
        this.jwtUtil = jwtUtil;
        this.authorizationRules = authorizationRules;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);
        try {
            Claims claims = jwtUtil.validateToken(token);
            String role = claims.get("role", String.class);
            String path = exchange.getRequest().getPath().toString();

            if (!authorizationRules.isAccessAllowed(path, role)) {
                exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                return exchange.getResponse().setComplete();
            }

            exchange.getRequest().mutate()
                    .header("userRole", role)
                    .build();

        } catch (Exception e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        return chain.filter(exchange);
    }
}


