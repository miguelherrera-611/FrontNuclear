package co.edu.modulocitas.model;

import co.edu.modulocitas.enums.Estado;
import jakarta.persistence.*;
import lombok.Data;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Data
@Table(name = "cita")
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCita;

    private String idPaciente;
    private String idVeterinario;
    private LocalDate fecha;
    private LocalTime hora;
    private boolean esUrgencia;
    private String motivo;

    @Enumerated(EnumType.STRING)
    private Estado estado;

    @ManyToOne
    @JoinColumn(name = "servicio_id")
    private Servicio servicio;

}
