import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Layout from './components/common/Layout';
import Dashboard from './components/dashboard/Dashboard';
import CitasList from './components/citas/CitasList';
import CitaForm from './components/citas/CitaForm';
import MascotasList from './components/mascotas/MascotasList';
import MascotaForm from './components/mascotas/MascotaForm';
import VeterinariosList from './components/veterinarios/VeterinariosList';
import VeterinarioForm from './components/veterinarios/VeterinarioForm';
import DisponibilidadForm from './components/veterinarios/DisponibilidadForm';
import ProductosList from './components/tienda/ProductosList';
import Carrito from './components/tienda/Carrito';
import HistoriaClinicaList from './components/historia/HistoriaClinicaList';
import HistoriaClinicaForm from './components/historia/HistoriaClinicaForm';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Routes>
                {/* Rutas públicas */}
                <Route
                    path="/login"
                    element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
                />
                <Route
                    path="/register"
                    element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />}
                />

                {/* Rutas protegidas */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    {/* Dashboard principal */}
                    <Route index element={<Navigate to="/dashboard" />} />
                    <Route path="dashboard" element={<Dashboard />} />

                    {/* Gestión de Citas */}
                    <Route path="citas" element={<CitasList />} />
                    <Route path="citas/nueva" element={<CitaForm />} />
                    <Route path="citas/editar/:id" element={<CitaForm />} />

                    {/* Gestión de Mascotas */}
                    <Route path="mascotas" element={<MascotasList />} />
                    <Route path="mascotas/nueva" element={<MascotaForm />} />
                    <Route path="mascotas/editar/:id" element={<MascotaForm />} />

                    {/* Gestión de Veterinarios (Solo Admin) */}
                    <Route
                        path="veterinarios"
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <VeterinariosList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="veterinarios/nuevo"
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <VeterinarioForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="veterinarios/editar/:id"
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <VeterinarioForm />
                            </ProtectedRoute>
                        }
                    />

                    {/* Disponibilidad de Veterinarios */}
                    <Route
                        path="disponibilidad"
                        element={
                            <ProtectedRoute roles={['veterinario', 'admin']}>
                                <DisponibilidadForm />
                            </ProtectedRoute>
                        }
                    />

                    {/* Historia Clínica */}
                    <Route
                        path="historia-clinica"
                        element={
                            <ProtectedRoute roles={['veterinario', 'admin']}>
                                <HistoriaClinicaList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="historia-clinica/nueva"
                        element={
                            <ProtectedRoute roles={['veterinario', 'admin']}>
                                <HistoriaClinicaForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="historia-clinica/editar/:id"
                        element={
                            <ProtectedRoute roles={['veterinario', 'admin']}>
                                <HistoriaClinicaForm />
                            </ProtectedRoute>
                        }
                    />

                    {/* Tienda */}
                    <Route path="tienda" element={<ProductosList />} />
                    <Route path="carrito" element={<Carrito />} />
                </Route>

                {/* Ruta 404 */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
        </div>
    );
}

export default App;