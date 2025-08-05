import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-detalle-reporte',
  templateUrl: './detalle-reporte.page.html',
  styleUrls: ['./detalle-reporte.page.scss'],
  standalone: false
})
export class DetalleReportePage implements OnInit {
  reporte: any;
  reporteId: number = 0;
  esTecnico: boolean = true; // Simulamos rol de técnico
  solucionAplicada: string = '';
  firmaUsuario: string = '';
  esUsuario: boolean = true;

  imagenSeleccionada: string | null = null;

mostrarImagen(a: any) {
  this.imagenSeleccionada = 'http://localhost:1337' + a.url;
}

cerrarImagen() {
  this.imagenSeleccionada = null;
}

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private storage: Storage,
    private api: ApiService
  ) { }

  usuario:any;

  async ngOnInit() {
    await this.cargarReporte();
    await this.storage.create()
    await this.getToken();
    
    const response = await this.storage.get('token');

    if (response) {
      this.usuario = response.user;
      console.log
      if (this.usuario.role.name == 'Authenticated'){
        this.esUsuario == true
      }
    } else {
      console.warn('No hay datos guardados en el storage.');
    }
    console.log('este es el usuario', this.usuario)


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

  async cargarReporte() {
    this.reporte = history.state.reporte
    console.log('reporte de llegada', this.reporte)
    if (!this.reporte) {
      this.router.navigate(['/reportes']);
    }
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
                reporte: reporte.documentId
              };

              // Primero intenta crear el historial
              const historialResult = await this.api.historialAcep(historialData, this.token);

              // Si se creó correctamente el historial, actualiza el reporte
              if (historialResult) {
                await this.api.actualizarestado(
                  reporte.documentId!,
                  'aceptado',
                  this.usuario.documentId,
                  this.token
                );
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

async marcarEnProceso() {
  try {
    const historialData = {
      accion: 'inicio_trabajo',
      descripcion: 'Técnico trabajando en la solución',
      fechaAccion: new Date().toISOString(),
      user: this.usuario.documentId,
      usuario: this.usuario.nombre,
      reporte: this.reporte.documentId
    };

    // Crear historial
    const historialResult = await this.api.historialAcep(historialData, this.token);

    if (historialResult) {
      // Actualizar estado del reporte a 'en_proceso'
      await this.api.enProceso(
        this.reporte.documentId,
        'en_proceso',
        this.token
      );
      this.cargarReporte();
      await this.mostrarToast('Reporte marcado como en proceso', 'warning');
    } else {
      this.mostrarToast('Error al crear historial. No se actualizó el reporte.', 'danger');
    }
  } catch (error) {
    console.error('Error al marcar en proceso:', error);
    this.mostrarToast('Error inesperado. Intenta de nuevo.', 'danger');
  }
}


    async marcarResuelto() {
    const alert = await this.alertController.create({
      header: 'Marcar como Resuelto',
      message: 'Describa la solución aplicada:',
     inputs: [
        {
          name: 'solucion',
          type: 'textarea',
          placeholder: 'Describa la solución implementada...'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Marcar Resuelto',
          handler: async (data) => {
            try {
              const historialData = {
                accion: 'aceptacion',
                descripcion: 'Reporte aceptado para revisión',
                fechaAccion: new Date().toISOString(),
                user: this.usuario.documentId,
                usuario:this.usuario.nombre,
                reporte: this.reporte.documentId
              };

              // Primero intenta crear el historial
              const historialResult = await this.api.historialAcep(historialData, this.token);

              // Si se creó correctamente el historial, actualiza el reporte
              if (historialResult) {
                await this.api.resuelto(
                this.reporte.documentId,
                'resuelto',
                data.solucion,
                this.token
              );
              this.cargarReporte();
              this.mostrarToast('Reporte marcado como resuelto', 'success');
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

  async firmarConformidad() {
    const alert = await this.alertController.create({
      header: 'Firmar Conformidad',
      message: '¿Confirma que el problema fue resuelto satisfactoriamente?',
      inputs: [
        {
          name: 'firma',
          type: 'text',
          placeholder: 'Escriba su nombre como firma digital',
          value: this.reporte?.nombreUsuario || ''
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Firmar y Cerrar',
          handler: (data) => {
            if (data.firma.trim()) {
              this.cargarReporte();
              this.mostrarToast('Reporte cerrado correctamente', 'success');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async imprimirReporte() {
    const alert = await this.alertController.create({
      header: 'Imprimir Reporte',
      message: 'Función de impresión será implementada próximamente.',
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  getEstadoTexto(estado: any): string {
    switch (estado) {
    case 'pendiente': return 'Pendiente';
    case 'aceptado': return 'Aceptado';
    case 'en_proceso': return 'En Proceso';
    case 'resuelto': return 'Resuelto';
    case 'cerrado': return 'Cerrado';
    default: return estado;
    }
  }

  getEstadoColor(estado: any): string {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'aceptado': return 'primary';
      case 'en_proceso': return 'secondary';
      case 'en_proceso': return 'success';
      case 'cerrado': return 'medium';
      default: return 'medium';
    }
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

  puedeAceptar(): boolean {
    return this.esTecnico && this.reporte?.estado === 'pendiente';
  }

  puedeMarcarEnProceso(): boolean {
    return this.esTecnico && this.reporte?.estado === 'aceptado';
  }

  puedeMarcarResuelto(): boolean {
    return this.esTecnico && this.reporte?.estado === 'en_proceso';
  }

  puedeFirmar(): boolean {
    return !this.usuario.role.name && this.reporte?.estado === 'resuelto';
  }

  puedeImprimir(): boolean {
    return this.reporte?.estado === 'cerrado';
  }
}