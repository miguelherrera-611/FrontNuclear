package co.edu.modulocitas.service.impl;

import co.edu.modulocitas.model.Servicio;
import co.edu.modulocitas.repository.ServicioRepository;
import co.edu.modulocitas.service.ServicioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ServicioServiceImpl implements ServicioService {

    private final ServicioRepository servicioRepository;

    @Override
    public Servicio crearServicio(Servicio servicio) {
        return servicioRepository.save(servicio);
    }

    @Override
    public Optional<Servicio> actualizarServicio(int idServicio, Servicio servicio) {
        return servicioRepository.findById(idServicio)
                .map( servicioActual -> {
                    servicioActual.setDescripcion(servicio.getDescripcion());
                    servicioActual.setDuracion(servicio.getDuracion());
                    servicioActual.setRequisitos(servicio.getRequisitos());
                    servicioActual.setTipo(servicio.getTipo());
                    return servicioRepository.save(servicioActual);
                });
    }

    @Override
    public Optional<Servicio> borrarServicio(int idServicio) {
        return servicioRepository.findById(idServicio)
                .map( servicio -> {
                    servicioRepository.delete(servicio);
                    return servicio;
                });
    }

    @Override
    public Optional<Servicio> consultarServicioPorId(int idServicio) {
        return servicioRepository.findById(idServicio);
    }

    @Override
    public List<Servicio> consultarServicios() {
        return servicioRepository.findAll();
    }
}
