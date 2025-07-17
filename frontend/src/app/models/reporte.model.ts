export interface Reporte {
  id?: number;
  numeroReporte?: string;
  usuario: string;
  emailUsuario?: string;
  edificio: string;
  aula?: string;
  fechaIncidente: string;
  tipoProblema: string;
  descripcionDetallada: string;
  equipoAfectado?: string;
  archivosAdjuntos?: any[];
  estado: EstadoReporte;
  fechaCreacion: string;
  tecnicoAsignado?: string;
  rectorEdificio?: string;
  fechaAceptacion?: string;
  fechaResolucion?: string;
  solucionAplicada?: string;
  observacionesTecnico?: string;
  historial: HistorialAccion[];
}

export enum EstadoReporte {
  PENDIENTE = 'pendiente',
  ACEPTADO = 'aceptado',
  EN_PROCESO = 'en_proceso',
  RESUELTO = 'resuelto',
  CERRADO = 'cerrado'
}

export interface HistorialAccion {
  id?: number;
  fecha: string;
  accion: string;
  usuario: string;
  descripcion: string;
}

export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  rol: 'alumno' | 'docente' | 'tecnico' | 'rector' | 'administrador';
  edificio?: string;
  activo: boolean;
}

export const TIPOS_PROBLEMA = [
  'Hardware - Computadora',
  'Hardware - Proyector',
  'Hardware - Impresora',
  'Hardware - Red/Internet',
  'Software - Sistema Operativo',
  'Software - Aplicaciones Educativas',
  'Software - Navegadores',
  'Audio y Video',
  'Mobiliario Tecnológico',
  'Aire Acondicionado',
  'Iluminación',
  'Otro'
];

export const EDIFICIOS = [
  'Edificio A - Ciencias Exactas',
  'Edificio B - Humanidades',
  'Edificio C - Ingeniería',
  'Edificio D - Medicina',
  'Edificio E - Administración',
  'Edificio F - Biblioteca',
  'Edificio G - Laboratorios',
  'Edificio H - Auditorios',
  'Edificio I - Deportes',
  'Edificio J - Cafetería'
];