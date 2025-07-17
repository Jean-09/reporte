import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';

import { ApiService } from 'src/app/service/api.service';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestion-usuarios',
  templateUrl: './gestion-usuarios.page.html',
  styleUrls: ['./gestion-usuarios.page.scss'],
  standalone: false
})
export class GestionUsuariosPage implements OnInit {
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  filtroRol: string = 'todos';
  filtroEdificio: string = 'todos';

  nuevoUsuario = {
    nombre: '',
    email: '',
    role: 'docente',
    edificio: '',
    activo: true
  };

  usuario: any | null = null;

  editandoUsuario: any | null = null;
  mostrandoFormulario: boolean = false;
  edificios: any[] = [];

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private api: ApiService,
    private storage: Storage,
    private router: Router
  ) { }

  async ngOnInit() {

    await this.storage.create()
    await this.getToken();
    await this.cargarUsuarios();
    await this.getEdificios()
    const response = await this.storage.get('token');

    if (response) {
      this.usuario = response.user;
    } else {
      console.warn('No hay datos guardados en el storage.');
    }
    console.log('este es el usuario', this.usuario)



  }

    getEdificios() {
    this.api.getEdi(this.token).then((res) => {
      this.edificios = res.data.data
      console.log(this.edificios)
    }).catch((error) => {
      this.mostrarAlerta('Error', 'no hay edificios disponibles');
    })
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
  usurarios: any[] = [];

  cargarUsuarios() {
    this.api.getUsers(this.token).then((res) => {
      this.usuarios = res.data;
      this.aplicarFiltros();
    }).catch((error) => {
      this.mostrarAlerta('Error', 'Intenta iniciar sesión nuevamente');
    })
  }

  aplicarFiltros() {
    let usuariosFiltrados = this.usuarios;

    if (this.filtroRol !== 'todos') {
      usuariosFiltrados = usuariosFiltrados.filter(u => u.role.name === this.filtroRol);
    }

    if (this.filtroEdificio !== 'todos') {
      usuariosFiltrados = usuariosFiltrados.filter(u => u.edificio.nombre === this.filtroEdificio);
    }

    this.usuariosFiltrados = usuariosFiltrados;
  }

  onFiltroChange() {
    this.aplicarFiltros();
  }

  mostrarFormularioNuevo() {
    this.nuevoUsuario = {
      nombre: '',
      email: '',
      role: 'docente',
      edificio: '',
      activo: true
    };
    this.editandoUsuario = null;
    this.mostrandoFormulario = true;
  }

  editarUsuario(usuario: any) {
  this.nuevoUsuario = {
    nombre: usuario.nombre,
    email: usuario.email,
    role: usuario.role?.name || '',
    edificio: usuario.edificio?.nombre || '',
    activo: usuario.activo
  };
  this.editandoUsuario = usuario;
  this.mostrandoFormulario = true;
}


  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  cancelarFormulario() {
    this.mostrandoFormulario = false;
    this.editandoUsuario = null;
    this.nuevoUsuario = {
      nombre: '',
      email: '',
      role: 'docente',
      edificio: '',
      activo: true
    };
  }

  async guardarUsuario() {
    if (!this.validarFormulario()) {
      return;
    }

    try {
      if (this.editandoUsuario) {
        await this.api.putUser(this.editandoUsuario, this.nuevoUsuario, this.token);
        await this.mostrarToast('Usuario actualizado correctamente', 'success');
      } else {
        await this.api.postUser(this.nuevoUsuario, this.token);
        await this.mostrarToast('Usuario creado correctamente', 'success');
      }

      this.cancelarFormulario();
    } catch (error) {
      await this.mostrarToast('Error al guardar usuario', 'danger');
    }
  }

  async eliminarUsuario(usuario: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Está seguro que desea eliminar al usuario "${usuario.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.toggleEstadoUsuario(usuario);
              await this.mostrarToast('Usuario eliminado correctamente', 'success');
            } catch (error) {
              await this.mostrarToast('Error al eliminar usuario', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async toggleEstadoUsuario(usuario: any) {
    try {
      const usuarioActualizado = { ...usuario, activo: !usuario.activo };
      await this.api.putUserStatus(usuario!, usuarioActualizado, this.token);

      const estado = usuarioActualizado.activo ? 'activado' : 'desactivado';
      await this.mostrarToast(`Usuario ${estado} correctamente`, 'success');
    } catch (error) {
      await this.mostrarToast('Error al cambiar estado del usuario', 'danger');
    }
  }

  private validarFormulario(): boolean {
    if (!this.nuevoUsuario.nombre?.trim()) {
      this.mostrarToast('El nombre es requerido', 'warning');
      return false;
    }

    if (!this.nuevoUsuario.email?.trim()) {
      this.mostrarToast('El email es requerido', 'warning');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.nuevoUsuario.email)) {
      this.mostrarToast('Ingrese un email válido', 'warning');
      return false;
    }

    if (!this.nuevoUsuario.role) {
      this.mostrarToast('El rol es requerido', 'warning');
      return false;
    }

    return true;
  }

  getRolTexto(rol: string): string {
    switch (rol) {
      case 'alumno': return 'Alumno';
      case 'docente': return 'Docente';
      case 'tecnico': return 'Técnico';
      case 'rector': return 'Rector';
      case 'administrador': return 'Administrador';
      default: return rol;
    }
  }

  getRolColor(rol: string): string {
    switch (rol) {
      case 'administrador': return 'danger';
      case 'rector': return 'warning';
      case 'tecnico': return 'primary';
      case 'docente': return 'secondary';
      case 'alumno': return 'success';
      default: return 'medium';
    }
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
}