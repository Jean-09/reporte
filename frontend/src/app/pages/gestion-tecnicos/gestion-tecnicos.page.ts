import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { ReportesService } from '../../../../../project/src/app/services/reportes.service';
import { Reporte, EstadoReporte } from '../../models/reporte.model';

@Component({
  selector: 'app-gestion-tecnicos',
  templateUrl: './gestion-tecnicos.page.html',
  styleUrls: ['./gestion-tecnicos.page.scss'],
  standalone: false
})
export class GestionTecnicosPage implements OnInit {
  reportesPendientes: Reporte[] = [];
  reportesAceptados: Reporte[] = [];
  tecnicoActual: string = 'Carlos Técnico';

  constructor(
    private reportesService: ReportesService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.cargarReportes();
  }

  cargarReportes() {
    this.reportesService.getReportes().subscribe(reportes => {
      this.reportesPendientes = reportes.filter(r => r.estado === EstadoReporte.PENDIENTE);
      this.reportesAceptados = reportes.filter(r => 
        r.estado === EstadoReporte.ACEPTADO || 
        r.estado === EstadoReporte.EN_PROCESO
      );
    });
  }

  async aceptarReporte(reporte: Reporte) {
    const alert = await this.alertController.create({
      header: 'Aceptar Reporte',
      message: `¿Desea aceptar el reporte #${reporte.id} de ${reporte.nombreUsuario}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.reportesService.actualizarEstadoReporte(
              reporte.id!,
              EstadoReporte.ACEPTADO,
              this.tecnicoActual
            );
            this.cargarReportes();
            this.mostrarToast('Reporte aceptado correctamente', 'success');
          }
        }
      ]
    });
    await alert.present();
  }

  async rechazarReporte(reporte: Reporte) {
    const alert = await this.alertController.create({
      header: 'Rechazar Reporte',
      message: `¿Por qué desea rechazar el reporte #${reporte.id}?`,
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
}