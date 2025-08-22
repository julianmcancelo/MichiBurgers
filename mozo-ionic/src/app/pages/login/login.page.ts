import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  legajo = '';
  password = '';
  loading = false;

  constructor(
    private http: HttpClient,
    private toast: ToastController,
    private router: Router
  ) {}

  async presentToast(message: string) {
    const t = await this.toast.create({ message, duration: 1600, position: 'bottom' });
    await t.present();
  }

  async submit() {
    if (!this.legajo || !this.password) {
      this.presentToast('Ingresá legajo y password');
      return;
    }
    this.loading = true;
    try {
      const res = await this.http.post<{ token: string; usuario?: any }>(`${environment.apiBase}/api/auth/login.php`, {
        legajo: this.legajo.trim(),
        password: this.password
      }).toPromise();
      const token = res?.token;
      if (!token) throw new Error('No token');
      localStorage.setItem('auth_token', token);
      if (res?.usuario) {
        localStorage.setItem('auth_user', JSON.stringify(res.usuario));
      }
      await this.presentToast('Bienvenido');
      // Navegar a home
      this.router.navigateByUrl('/', { replaceUrl: true });
    } catch (e) {
      await this.presentToast('Credenciales inválidas');
    } finally {
      this.loading = false;
    }
  }
}
