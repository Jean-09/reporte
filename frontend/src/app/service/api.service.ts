import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular'
import axios, { AxiosHeaders } from 'axios';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private url = environment.urlapi;

  constructor(private storage: Storage) {
    this.storage.create()
  }

  async login(data: any) {

    const res = await axios.post(this.url + '/auth/local', data);
    const { jwt, user } = res.data;

    const userRes = await axios.get(this.url + '/users/me?populate[avatar]=true&populate[role]=true&populate[edificio]=true', {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });

    return {
      token: jwt,
      user: userRes.data
    };
  }

  // 
  getRepo(token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    })

    return axios.get(`${this.url}/reportes?populate=*`, { headers: options });
  }

  getRepoById(token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    // Filtra los reportes donde el campo 'usuario' coincide con el documentId
    return axios.get(`${this.url}/users/me?populate=reportes`, {
      headers: options
    });
  }

  async crearReporteConArchivos(data: any, token: string) {
    const headers = new AxiosHeaders({ 'Authorization': 'Bearer ' + token });

    try {
      const archivos: File[] = data.archivosAdjuntos || [];

      let fileIds: number[] = [];

      if (archivos.length > 0) {
        const formData = new FormData();
        archivos.forEach((file: File) => {
          formData.append('files', file);
        });

        const uploadResponse = await axios.post(this.url + '/upload', formData, {
          headers,
          timeout: 30000 // 30 segundos o más
        });

        fileIds = uploadResponse.data.map((file: any) => file.id);
        console.log(fileIds)
      }

      const datosFinales = {
        ...data,
        archivosAdjuntos: fileIds
      };

      const response = await axios.post(`${this.url}/reportes`, { data: datosFinales }, { headers });

      return response.data;

    } catch (error) {
      console.error('Error al crear reporte con archivos:', error);
      throw error;
    }
  }

  async crearHistorial(data: any, token: string) {
    console.log(data)
    const headers = new AxiosHeaders({ 'Authorization': 'Bearer ' + token });

    try {
      const response = await axios.post(`${this.url}/historial-acciones`, { data }, { headers });
      return response.data;
    } catch (error) {
      console.error('Error al crear historial:', error);
      throw error;
    }
  }



  getEdi(token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    })

    return axios.get(`${this.url}/edificios`, { headers: options });
  }


  getUsers(token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    })

    return axios.get(`${this.url}/users?populate=*`, { headers: options });
  }

  postUser(data: any, token: string) {

  }

  putUser(data: any, usuarioActualizado: any, token: string) {

  }

  putUserStatus(a: any, usuarioActualizado: any, token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    return axios.put(this.url + '/users/' + a.documentId, { data: { estatus: usuarioActualizado } }, { headers: options });

  }

}
