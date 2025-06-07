package co.edu.modulocitas.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNoEncontradoExcepcion.class)
    public ResponseEntity<Map<String, String>> manejarRecursoNoEncontrado(RecursoNoEncontradoExcepcion ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Recurso no encontrado");
        error.put("mensaje", ex.getMessage());

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND); // 404
    }

    @ExceptionHandler(UsuarioOcupadoExcepcion.class)
    public ResponseEntity<Map<String, String>> manejarRecursoOcupado(UsuarioOcupadoExcepcion ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Usuario ocupado");
        error.put("mensaje", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(VeterinarioNoDisponible.class)
    public ResponseEntity<Map<String, String>> manejarRecursoOcupado(VeterinarioNoDisponible ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Veterinario ocupado");
        error.put("mensaje", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }
}
