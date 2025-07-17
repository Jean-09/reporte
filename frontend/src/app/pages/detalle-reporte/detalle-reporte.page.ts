import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { Reporte, EstadoReporte, HistorialAccion } from '../../models/reporte.model';

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
    private modalController: ModalController
  ) { }

  async ngOnInit() {
    await this.cargarReporte();
  }

  async cargarReporte() {
    this.reporte = history.state.reporte
    console.log('reporte de llegada', this.reporte)
    if (!this.reporte) {
      this.router.navigate(['/reportes']);
    }
  }

  async aceptarReporte() {
    const alert = await this.alertController.create({
      header: 'Aceptar Reporte',
      message: '¿Está seguro que desea aceptar este reporte?',
      inputs: [
        {
          name: 'nombreTecnico',
          type: 'text',
          placeholder: 'Ingrese su nombre',
          value: 'Carlos Técnico'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: (data) => {
            if (data.nombreTecnico.trim()) {
              // this.reportesService.actualizarEstadoReporte(
              //   this.reporteId,
              //   EstadoReporte.ACEPTADO,
              //   data.nombreTecnico
              // );
              // this.cargarReporte();
              // this.mostrarToast('Reporte aceptado correctamente', 'success');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async marcarEnProceso() {
    // this.reportesService.actualizarEstadoReporte(
    //   this.reporteId,
    //   EstadoReporte.EN_PROCESO
    // );
    // this.cargarReporte();
    // await this.mostrarToast('Reporte marcado como en proceso', 'warning');
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
          handler: (data) => {
            if (data.solucion.trim()) {
              // this.reportesService.actualizarEstadoReporte(
              //   this.reporteId,
              //   EstadoReporte.RESUELTO,
              //   undefined,
              //   data.solucion
              // );
              // this.cargarReporte();
              // this.mostrarToast('Reporte marcado como resuelto', 'success');
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

  getEstadoTexto(estado: EstadoReporte): string {
    switch (estado) {
      case EstadoReporte.PENDIENTE: return 'Pendiente';
      case EstadoReporte.ACEPTADO: return 'Aceptado';
      case EstadoReporte.EN_PROCESO: return 'En Proceso';
      case EstadoReporte.RESUELTO: return 'Resuelto';
      case EstadoReporte.CERRADO: return 'Cerrado';
      default: return estado;
    }
  }

  getEstadoColor(estado: EstadoReporte): string {
    switch (estado) {
      case EstadoReporte.PENDIENTE: return 'warning';
      case EstadoReporte.ACEPTADO: return 'primary';
      case EstadoReporte.EN_PROCESO: return 'secondary';
      case EstadoReporte.RESUELTO: return 'success';
      case EstadoReporte.CERRADO: return 'medium';
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
    return this.esTecnico && this.reporte?.estado === EstadoReporte.PENDIENTE;
  }

  puedeMarcarEnProceso(): boolean {
    return this.esTecnico && this.reporte?.estado === EstadoReporte.ACEPTADO;
  }

  puedeMarcarResuelto(): boolean {
    return this.esTecnico && this.reporte?.estado === EstadoReporte.EN_PROCESO;
  }

  puedeFirmar(): boolean {
    return !this.esTecnico && this.reporte?.estado === EstadoReporte.RESUELTO;
  }

  puedeImprimir(): boolean {
    return this.reporte?.estado === EstadoReporte.CERRADO;
  }
}