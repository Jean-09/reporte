import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from 'src/app/service/api.service';
import { Usuario } from '../../models/auth.model';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.page.html',
  styleUrls: ['./dashboard-admin.page.scss'],
  standalone: false
})
export class DashboardAdminPage implements OnInit {
  usuario: Usuario| null = null;
  reportes: any[] = [];
  estadisticas = {
    totalReportes: 0,
    pendientes: 0,
    enProceso: 0,
    resueltos: 0,
    cerrados: 0
  };

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
    } else {
    console.warn('No hay datos guardados en el storage.');
    }
    console.log('este es el usuario', this.usuario)
    await this.cargarDatos();
    

  }

  token = '';

  async getToken() {
  const tokenData = await this.storage.get('token');
    console.log('este es el data del token',tokenData)
  if (tokenData?.token && tokenData?.user) {
    this.token = tokenData.token;
    console.log('token:', this.token);
  } else {
    // Si falta alguno, redirigimos al login
    this.router.navigate(['/login']);
  }
}


  async cargarDatos() {
    await this.api.getRepo(this.token).then((res) => {
      this.reportes = res.data.data;
      console.log(this.reportes)
      this.calcularEstadisticas();
    }).catch((error)=>{

    });
  }

  calcularEstadisticas() {
    this.estadisticas.totalReportes = this.reportes.length;
    this.estadisticas.pendientes = this.reportes.filter(r => r.estado === 'pendiente').length;
    this.estadisticas.enProceso = this.reportes.filter(r => r.estado === 'en_proceso').length;
    this.estadisticas.resueltos = this.reportes.filter(r => r.estado === 'resuelto').length;
    this.estadisticas.cerrados = this.reportes.filter(r => r.estado === 'resuelto').length;
  }

  getEstadoTexto(estado: any): string {
    switch (estado) {
      case estado.PENDIENTE: return 'Pendiente';
      case estado.ACEPTADO: return 'Aceptado';
      case estado.EN_PROCESO: return 'En Proceso';
      case estado.RESUELTO: return 'Resuelto';
      case estado.CERRADO: return 'Cerrado';
      default: return estado;
    }
  }

  getEstadoColor(estado: any): string {
    switch (estado) {
      case estado.PENDIENTE: return 'warning';
      case estado.ACEPTADO: return 'primary';
      case estado.EN_PROCESO: return 'secondary';
      case estado.RESUELTO: return 'success';
      case estado.CERRADO: return 'medium';
      default: return 'medium';
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-ES');
  }

  async logout() {
     await this.storage.remove('token');
    this.router.navigate(['/login']);
  }

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
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