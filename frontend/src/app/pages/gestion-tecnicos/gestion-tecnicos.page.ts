import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/service/api.service';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestion-tecnicos',
  templateUrl: './gestion-tecnicos.page.html',
  styleUrls: ['./gestion-tecnicos.page.scss'],
  standalone: false
})
export class GestionTecnicosPage implements OnInit {
  reportesPendientes: any[] = [];
  reportesAceptados: any[] = [];
  tecnicoActual: string = 'Carlos Técnico';

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private api: ApiService,
    private storage: Storage,
    private router: Router,
    private loadingController: LoadingController,
  ) { }

  usuario: any;
  tecnico: any;

  async ngOnInit() {

    await this.storage.create();
    await this.getToken();
    await this.cargarReportes();

    // Obtén el token y el usuario guardados
    const tokenData = await this.storage.get('token');
    console.log('este es mis datos del token', tokenData)
    this.tecnico = tokenData.user
    if (tokenData?.token && tokenData?.user) {
      this.usuario = tokenData.user;
      console.log('este es el usuario', this.usuario)
      await this.cargarReportesPropios();


    } else {
      this.mostrarAlerta('Error', 'Intenta iniciar sesión nuevamente');
      this.router.navigate(['/login']);
    }

  }


  token = '';

  async getToken() {
    const tokenData = await this.storage.get('token');
    console.log('este es el data del token', tokenData)
    if (tokenData?.token && tokenData?.user) {
      this.token = tokenData.token;
      console.log('token:', this.token);
    } else {
      this.mostrarAlerta('Error', 'Intenta iniciar sesión nuevamente');
      this.router.navigate(['/login']);
    }
  }

  cargarReportes() {
    this.api.getRepo(this.token).then((res) => {
      const reportes = res.data.data;
      console.log('reportes totales', reportes);
      this.reportesPendientes = reportes.filter((r: any) => r.estado === 'pendiente');
      console.log('estos son los pendientes', this.reportesPendientes);
    }).catch((error) => {
      this.mostrarAlerta('Error', 'Intenta iniciar sesión nuevamente');
    });
  }

  cargarReportesPropios() {
    this.api.getRepoPropio(this.usuario.documentId, this.token).then((res) => {
      let reportes = res.data.data
      console.log('propios', reportes);

      this.reportesAceptados = reportes.filter((r: any) => r.estado === 'aceptado' || r.estado === 'en_proceso' || r.estado === 'resuelto' || r.estado === 'cerrado');

      console.log('estos son los aceptados', this.reportesAceptados);
    }).catch((error) => {
      console.error('Error completo:', error);
      this.mostrarAlerta('Error', 'Intenta iniciar sesión nuevamente');
    });
  }


  async aceptarReporte(reporte: any) {
    const alert = await this.alertController.create({
      header: 'Aceptar Reporte',
      message: `¿Desea aceptar el reporte #${reporte.numeroReporte} de ${reporte.usuario.nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: async () => {
            try {
              const historialData = {
                accion: 'aceptacion',
                descripcion: 'Reporte aceptado para revisión',
                fechaAccion: new Date().toISOString(),
                user: reporte.usuario.documentId,
                reporte: reporte.documentId,
                usuario: this.usuario?.nombre
              };

              // Primero intenta crear el historial
              const historialResult = await this.api.historialAcep(historialData, this.token);

              // Si se creó correctamente el historial, actualiza el reporte
              if (historialResult) {
                await this.api.actualizarestado(
                  reporte.documentId!,
                  'aceptado',
                  this.tecnico.documentId,
                  this.token
                );

                await this.cargarReportes();
                await this.cargarReportesPropios();

                this.mostrarToast('Reporte aceptado correctamente', 'success');
              } else {
                this.mostrarToast('Error al crear historial. No se aceptó el reporte.', 'danger');
              }
            } catch (error) {
              console.error('Error al aceptar reporte:', error);
              this.mostrarToast('Error inesperado. Intenta de nuevo.', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async rechazarReporte(reporte: any) {
    const alert = await this.alertController.create({
      header: 'Rechazar Reporte',
      message: `¿Por qué desea rechazar el reporte #${reporte.documentId}?`,
      inputs: [
        {
          name: 'motivo',
          type: 'textarea',
          placeholder: 'Ingrese el motivo del rechazo...'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Rechazar',
          handler: (data) => {
            if (data.motivo.trim()) {
              this.mostrarToast('Reporte rechazado', 'warning');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-ES');
  }

  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  getTiempoTranscurrido(fechaCreacion: string): string {
    const ahora = new Date();
    const fecha = new Date(fechaCreacion);
    const diferencia = ahora.getTime() - fecha.getTime();
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    } else {
      return `${minutos}m`;
    }
  }

  getPrioridad(fechaCreacion: string): string {
    const horas = Math.floor((new Date().getTime() - new Date(fechaCreacion).getTime()) / (1000 * 60 * 60));

    if (horas > 24) return 'alta';
    if (horas > 8) return 'media';
    return 'baja';
  }

  getPrioridadColor(prioridad: string): string {
    switch (prioridad) {
      case 'alta': return 'danger';
      case 'media': return 'warning';
      case 'baja': return 'success';
      default: return 'medium';
    }
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  async mostrarLoading() {
    const loading = await this.loadingController.create({
      message: 'Por favor espere...',
      spinner: 'crescent',
      duration: 3000
    });

    await loading.present();
    return loading;
  }
  reporteDetalle(repo: any) {
    console.log('reportes', repo)
    this.router.navigate(['/detalle-reporte'], {
      state: {
        reporte: repo
      }
    })
  }
}