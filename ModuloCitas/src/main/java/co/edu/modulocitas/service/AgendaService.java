package co.edu.modulocitas.service;

import co.edu.modulocitas.enums.Estado;
import co.edu.modulocitas.model.Cita;

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface AgendaService {
    List<Cita> consultarCitas();
    Optional<Cita> consultarCitaPorId(Integer idCita);
    Cita crearCita(Cita cita);
    Optional<Cita> actualizarCita(int idCita, Cita cita);
    Optional<Cita> cambiarEstado(int idCita, Estado estado);
    List<Cita> consultarCitaPorEstado(Estado estado);
    List<Cita> consultarCitaPorFecha(LocalDate fecha);
    List<Cita> consultarCitaPorHora(LocalTime hora);
    List<Cita> consultarCitaPorFechaYHora(LocalDate fecha, LocalTime hora);
    List<Cita> consultarCitaPorVeterinario(String idVeterinario);
    List<Cita> consultarCitaPorPaciente(String idPaciente);
}
