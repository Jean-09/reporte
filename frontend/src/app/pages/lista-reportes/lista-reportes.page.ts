import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-lista-reportes',
  templateUrl: './lista-reportes.page.html',
  styleUrls: ['./lista-reportes.page.scss'],
  standalone: false
})
export class ListaReportesPage implements OnInit {
  reportes: any [] = [];
  reportesFiltrados: any [] = [];
  filtroEstado: string = 'todos';
  usuario: any;

  constructor(
    private router: Router,
    private storage: Storage,
    private api: ApiService
  ) { }

  async ngOnInit() {

    await this.storage.create()
    await this.getToken();
    
    const response = await this.storage.get('token');

    if (response) {
      this.usuario = response.user;
      console.log
    } else {
      console.warn('No hay datos guardados en el storage.');
    }
    console.log('este es el usuario', this.usuario)

    await this.cargarReportes()

  }


  token = '';

  async getToken() {
    const tokenData = await this.storage.get('token');
    console.log('este es el data del token', tokenData)
    if (tokenData?.token && tokenData?.user) {
      this.token = tokenData.token;
      console.log('token:', this.token);
    } else {
      // Si falta alguno, redirigimos al login
      this.router.navigate(['/login']);
    }
  }

  filtro:any[]=[];

  cargarReportes() {
  const roleName = this.usuario.role?.name;

  if (roleName === 'Administrador' || roleName === 'Técnico') {
    this.api.getRepo(this.token)
      .then((res) => {
        this.reportes = res.data.data;
        console.log(this.reportes);
        this.aplicarFiltro();
      })
      .catch((error) => {
        console.error(error);
      });
  } else if (roleName === 'Authenticated') {
    this.api.getRepoById(this.token)
      .then((res) => {
        this.reportes = res.data.reportes;
        console.log(this.reportes);
        this.aplicarFiltro();
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    // Opcional: manejar otros roles o usuarios no autenticados
    this.reportes = [];
  }
}


aplicarFiltro() {
  if (this.filtroEstado === 'todos') {
    this.reportesFiltrados = this.reportes;
  } else {
    const filtrados = this.reportes.filter(r => 
      (r.estado || '').toLowerCase().replace(/\s/g, '_') === this.filtroEstado
    );
    console.log('Reportes filtrados:', filtrados);
    this.reportesFiltrados = filtrados;
  }
}



  onFiltroChange() {
    this.aplicarFiltro();
  }

getEstadoTexto(estado: string): string {
   console.log('Este es el estado', estado)
  switch (estado) {
    case 'pendiente': return 'Pendiente';
    case 'aceptado': return 'Aceptado';
    case 'en_proceso': return 'En Proceso';
    case 'resuelto': return 'Resuelto';
    case 'cerrado': return 'Cerrado';
    default: return estado || 'No especificado';
  }
}


  getEstadoClase(estado: any): string {
    return `status-badge status-${estado}`;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-ES');
  }

   async logout() {
    await this.storage.remove('token');
    this.router.navigate(['/login']);
  }

  async puedeCrearReporte() {
     return this.usuario?.role.name === 'Authenticated' || this.usuario?.role.name === 'Administrador';
  }

  volverAlDashboard() {
    if (this.usuario?.role.name === 'Administrador') {
      this.router.navigate(['/dashboard-admin']);
    } else if (this.usuario?.role.name === 'Técnico') {
      this.router.navigate(['/gestion-tecnicos']);
    }
  }
    verDetallesRepo(repo: any) {
    console.log('reportes', repo)
    this.router.navigate(['/detalle-reporte'], {
      state: {
        reporte: repo
      }
    })
  }
}