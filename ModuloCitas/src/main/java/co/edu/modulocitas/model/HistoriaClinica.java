package co.edu.modulocitas.model;

import jakarta.persistence.*;
import lombok.Data;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;

@Data
@Entity
@Table(name = "historia_clinica")
public class HistoriaClinica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private LocalDate fecha;
    private LocalTime hora;

    private Integer idCita;
    private String idVeterinario;
    private String idPaciente;

    private String motivo;
    private String diagnostico;
    private String tratamiento;
    private String proceder;
    private String observaciones;


}
