package co.edu.modulocitas.repository;

import co.edu.modulocitas.enums.Estado;
import co.edu.modulocitas.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface CitaRepository extends JpaRepository<Cita, Integer> {
    Optional<Cita> findByMotivo(String motivo);
    // Verifica si ya hay una cita para ese veterinario en esa fecha y hora
    boolean existsByIdVeterinarioAndFechaAndHora(String idVeterinario, LocalDate fecha, LocalTime hora);

    // Verifica si ya hay una cita para ese paciente (mascota) en esa fecha y hora
    boolean existsByIdPacienteAndFechaAndHora(String idPaciente, LocalDate fecha, LocalTime hora);

    boolean existsByIdVeterinarioAndFechaAndHoraAndEstadoIn(
            String idVeterinario, LocalDate fecha, LocalTime hora, List<Estado> estados);

    boolean existsByIdPacienteAndFechaAndHoraAndEstadoIn(
            String idPaciente, LocalDate fecha, LocalTime hora, List<Estado> estados);

    List<Cita> findCitaByEstado(Estado estado);
    List<Cita> findCitaByFecha(LocalDate fecha);
    List<Cita> findCitaByHora(LocalTime hora);
    List<Cita> findCitaByFechaAndHora(LocalDate fecha, LocalTime hora);
    List<Cita> findCitaByIdVeterinario(String idVeterinario);
    List<Cita> findCitaByIdPaciente(String idPaciente);

    @Query(value = """
    SELECT COALESCE(COUNT(*), 0)
    FROM cita c
    JOIN servicios s ON c.servicio_id = s.id
    WHERE c.id_veterinario = :idVeterinario
      AND c.fecha = :fecha
      AND TIME(:nuevaHora) < ADDTIME(c.hora, SEC_TO_TIME(s.duracion * 60))
      AND ADDTIME(:nuevaHora, SEC_TO_TIME(:duracion * 60)) > c.hora
""", nativeQuery = true)
    long conflictoHorario(
            @Param("idVeterinario") String idVeterinario,
            @Param("fecha") LocalDate fecha,
            @Param("nuevaHora") LocalTime nuevaHora,
            @Param("duracion") int duracion);
}
