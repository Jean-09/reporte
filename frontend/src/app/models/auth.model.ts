export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol: 'usuario' | 'tecnico' | 'administrador';
  departamento?: Departamento;
  activo: boolean;
  fechaUltimoAcceso?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Departamento {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  jwt: string;
  user: Usuario;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: Usuario | null;
  token: string | null;
}

export const ROLES = {
  USUARIO: 'usuario',
  TECNICO: 'tecnico',
  ADMINISTRADOR: 'administrador'
} as const;

export type RolType = typeof ROLES[keyof typeof ROLES];