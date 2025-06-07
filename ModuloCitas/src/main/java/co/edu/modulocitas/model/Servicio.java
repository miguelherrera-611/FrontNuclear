package co.edu.modulocitas.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Duration;


@Data
@Entity
@Table(name = "servicios")
public class Servicio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String tipo;
    private String descripcion;
    private Duration duracion;
    private String requisitos;

}
