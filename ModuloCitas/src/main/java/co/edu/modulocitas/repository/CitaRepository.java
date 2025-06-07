package co.edu.modulocitas.repository;

import co.edu.modulocitas.enums.Estado;
import co.edu.modulocitas.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Time;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CitaRepository extends JpaRepository<Cita, Integer> {
    Optional<Cita> findByMotivo(String motivo);
    // Verifica si ya hay una cita para ese veterinario en esa fecha y hora
    boolean existsByIdVeterinarioAndFechaAndHora(String idVeterinario, LocalDate fecha, Time hora);

    // Verifica si ya hay una cita para ese paciente (mascota) en esa fecha y hora
    boolean existsByIdPacienteAndFechaAndHora(String idPaciente, LocalDate fecha, Time hora);

    boolean existsByIdVeterinarioAndFechaAndHoraAndEstadoIn(
            String idVeterinario, LocalDate fecha, Time hora, List<Estado> estados);

    boolean existsByIdPacienteAndFechaAndHoraAndEstadoIn(
            String idPaciente, LocalDate fecha, Time hora, List<Estado> estados);

    List<Cita> findCitaByEstado(Estado estado);
    List<Cita> findCitaByFecha(LocalDate fecha);
    List<Cita> findCitaByHora(Time hora);
    List<Cita> findCitaByFechaAndHora(LocalDate fecha, Time hora);
    List<Cita> findCitaByIdVeterinario(String idVeterinario);
    List<Cita> findCitaByIdPaciente(String idPaciente);
}
