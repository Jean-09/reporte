import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/service/api.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-crear-reporte',
  templateUrl: './crear-reporte.page.html',
  styleUrls: ['./crear-reporte.page.scss'],
  standalone: false
})
export class CrearReportePage implements OnInit {
  reporte = {
    usuario: '',
    edificio: '',
    aula: '',
    numeroReporte: Math.floor(Math.random() * 9999) + 1,
    fechaIncidente: new Date().toISOString(),
    tipoProblema: '',
    descripcionDetallada: '',
    equipoAfectado: '',
    archivosAdjuntos: [] as File[],
  };

  historial = {
    accion: 'creacion',
    descripcion: 'Creacion de reporte',
    usuario: '',
    fechaAccion: new Date().toISOString(),
    user: '',
    //aqui va el document id del reporte recien creado
    reporte: ''

  }

  edificios: any[] = [];
  archivoSeleccionado: File | null = null;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private api: ApiService,
    private storage: Storage
  ) {
  }
  usuario: any;

  async ngOnInit() {
    await this.storage.create();
    await this.getToken();
    await this.getEdificios();

    // Obtén el token y el usuario guardados
    const tokenData = await this.storage.get('token');
    this.reporte.usuario = tokenData.user.documentId;
    this.historial.usuario = tokenData.user.nombre;
    this.historial.user = tokenData.user.documentId;

    if (tokenData?.token && tokenData?.user) {
      this.usuario = tokenData.user;
      console.log('este es el usuario', this.usuario)



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

  eliminarImagen(index: number) {
    if (this.reporte.archivosAdjuntos && this.previewImage) {
      this.reporte.archivosAdjuntos.splice(index, 1);
      this.previewImage.splice(index, 1);
    }
  }



  previewImage: (string | ArrayBuffer | null)[] = [];

seleccionarFoto(event: any) {
  const archivos: FileList = event.target.files;

  if (archivos && archivos.length > 0) {
    this.previewImage = [];
    for (const archivo of Array.from(archivos)) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage.push(reader.result);
      };
      reader.readAsDataURL(archivo);
    }
    this.reporte.archivosAdjuntos = Array.from(archivos);
  }
}




  getEdificios() {
    this.api.getEdi(this.token).then((res) => {
      this.edificios = res.data.data
      console.log(this.edificios)
    }).catch((error) => {
      this.mostrarAlerta('Error', 'no hay edificios disponibles');
    })
  }



async enviarReporte() {
  if (!this.validarFormulario()) {
    return;
  }

  const loading = await this.mostrarLoading();
  let reporteCreado = false;
  let historialCreado = false;
  let reporteId: string | null = null;

  try {
    // Guarda el ID del usuario antes por si se sobrescribe después
    const usuarioId = this.usuario.documentId;
    const usuarioNombre = this.usuario.nombre;

    // Preparar datos del reporte
    const data = {
      edificio: this.reporte.edificio,
      aula: this.reporte.aula,
      numeroReporte: Math.floor(Math.random() * 9999) + 1,
      fechaIncidente: this.reporte.fechaIncidente,
      tipoProblema: this.reporte.tipoProblema,
      descripcionDetallada: this.reporte.descripcionDetallada,
      equipoAfectado: this.reporte.equipoAfectado,
      archivosAdjuntos: this.reporte.archivosAdjuntos,
      usuario: usuarioId
    };

    console.log('Datos enviados:', data);

    // Crear reporte con archivos
    const resReporte = await this.api.crearReporteConArchivos(data, this.token);
    reporteId = resReporte.reporteId;

    if (!reporteId) {
      throw new Error('No se recibió un ID de reporte válido');
    }

    reporteCreado = true;

    // Crear historial
    const historialData = {
      accion: 'creacion',
      descripcion: 'Reporte creado por el usuario',
      fechaAccion: new Date().toISOString(),
      user: usuarioId,
      usuario: usuarioNombre,
      reporte: reporteId
    };

    await this.api.historialAcep(historialData, this.token);
    historialCreado = true;

    // Éxito
    await loading.dismiss();
    await this.mostrarToast('Reporte y historial creados correctamente', 'success');
    this.limpiarFormulario();

  } catch (error) {
    await loading.dismiss();

    let mensajeError = 'No se pudo completar la operación';

    if (error instanceof Error) {
      console.error('Error:', error);
      mensajeError = error.message;
    }

    if (reporteCreado && !historialCreado) {
      mensajeError = 'El reporte se creó pero falló el historial. El sistema puede mostrar inconsistencia.';
    }

    await this.mostrarAlerta('Error', mensajeError);
  }
}





  private validarFormulario(): boolean {
    if (!this.reporte.usuario?.trim()) {
      this.mostrarAlerta('Error', 'El nombre del usuario es requerido');
      return false;
    }

    if (!this.reporte.edificio) {
    }
    if (!this.reporte.edificio) {
      this.mostrarAlerta('Error', 'El edificio es requerido');
      return false;
    }

    if (!this.reporte.tipoProblema) {
      this.mostrarAlerta('Error', 'El tipo de problema es requerido');
      return false;
    }

    if (!this.reporte.descripcionDetallada?.trim()) {
      this.mostrarAlerta('Error', 'La descripción detallada es requerida');
      return false;
    }

    if (this.reporte.descripcionDetallada.trim().length < 10) {
      this.mostrarAlerta('Error', 'La descripción debe tener al menos 10 caracteres');
      return false;
    }

    return true;
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['Aceptar']
    });
    await alert.present();
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

  async mostrarLoading() {
    const loading = await this.loadingController.create({
      message: 'Por favor espere...',
      spinner: 'crescent',
      duration: 3000
    });

    await loading.present();
    return loading;
  }

  limpiarFormulario() {
    this.reporte = {
      usuario: this.historial.user,
      edificio: '',
      aula: '',
      numeroReporte: Math.floor(Math.random() * 9999) + 1,
      fechaIncidente: new Date().toISOString(),
      tipoProblema: '',
      descripcionDetallada: '',
      equipoAfectado: '',
      archivosAdjuntos: []
    };
    this.archivoSeleccionado = null;
  }
}