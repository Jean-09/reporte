import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ApiService } from 'src/app/service/api.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
    identifier= ''
    password= ''

  showPassword = false;
  isLoading = false;

  // Usuarios demo para mostrar
  usuariosDemo = [
    { email: 'cruz@gmail.com', password: '12345678' },
    { email: 'tecnico@empresa.com', password: '123456', rol: 'Técnico' },
    { email: 'luis@gmail.com', password: '12345678'}
  ];

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private api:ApiService,
    private storage: Storage
  ) {}

  ngOnInit(){
    this.storage.create();
  }

  async onLogin() {
    if (!this.validarFormulario()) {
      return;
    }

    const loading = await this.mostrarLoading();
    this.isLoading = true;

    try {
      const credentials = {
        identifier: this.identifier,
        password: this.password,
      }
      const response = await this.api.login(credentials);
      this.storage.set('token', response)
      await loading.dismiss();
      console.log(response.user.role)
      
      await this.mostrarToast(`¡Bienvenido ${response.user.nombre}!`, 'success');
      
      // Redirigir según el rol
      this.redirigirSegunRol(response.user.role.name);
      
    } catch (error: any) {
      await loading.dismiss();
      await this.mostrarAlerta('Error de Autenticación', error.message || 'Credenciales incorrectas');
    } finally {
      this.isLoading = false;
    }
  }

  private redirigirSegunRol(rol: string) {
    switch (rol) {
      case 'Administrador':
        this.router.navigate(['/dashboard-admin']);
        break;
      case 'Técnico':
        this.router.navigate(['/gestion-tecnicos']);
        break;
      case 'Authenticated':
      default:
        this.router.navigate(['/reportes']);
        break;
    }
  }

  async usarCredencialesDemo(usuario: any) {
    this.identifier = usuario.email;
    this.password = usuario.password;
    await this.mostrarToast(`Credenciales cargadas para ${usuario.rol}`, 'primary');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private validarFormulario(): boolean {
    if (!this.identifier.trim()) {
      this.mostrarAlerta('Error', 'El email es requerido');
      return false;
    }

    if (!this.password.trim()) {
      this.mostrarAlerta('Error', 'La contraseña es requerida');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.identifier)) {
      this.mostrarAlerta('Error', 'Ingrese un email válido');
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
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }
}