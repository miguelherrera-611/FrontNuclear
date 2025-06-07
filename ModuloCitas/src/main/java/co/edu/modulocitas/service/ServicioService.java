package co.edu.modulocitas.service;

import co.edu.modulocitas.model.Servicio;
import java.util.List;
import java.util.Optional;

public interface ServicioService {

    Servicio crearServicio(Servicio servicio);
    Optional<Servicio> actualizarServicio(int idServicio, Servicio servicio);
    Optional<Servicio> borrarServicio(int idServicio);
    Optional<Servicio> consultarServicioPorId(int idServicio);
    List<Servicio> consultarServicios();

}
