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

  getRepoPropio(documentId: string, token: string) {
    const options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    return axios.get(`${this.url}/reportes?filters[tecnico_asignado][documentId][$eq]=${documentId}&populate=*`, { headers: options });
  }

  reportesReload(id: string, token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });
    return axios.get(`${this.url}/reportes/${id}?populate=deep,5`, { headers: options });
  }

  getRepoById(token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    // Filtra los reportes donde el campo 'usuario' coincide con el documentId
    return axios.get(`${this.url}/users/me?populate[reportes][populate][usuario]=true&populate[reportes][populate][edificio]=true&populate[reportes][populate][historial_acciones]=true&populate[role]=true`, {
      headers: options
    });
  }

  async crearReporteConArchivos(data: any, token: string) {
    console.log('Datos recibidos:', data);
    const baseHeaders = new AxiosHeaders({
      'Authorization': `Bearer ${token}`
    });

    let fileIds: number[] = [];
    let reporteId: string | null = null;

    try {
      // 1. Subir archivos (si existen)
      if (data.archivosAdjuntos?.length > 0) {
        const formData = new FormData();
        data.archivosAdjuntos.forEach((file: File) => {
          formData.append('files', file, encodeURIComponent(file.name));
        });

        const uploadResponse = await axios.post(`${this.url}/upload`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000
        });

        if (!Array.isArray(uploadResponse.data)) {
          throw new Error('Formato de respuesta de archivos inválido');
        }

        fileIds = uploadResponse.data.map((file: any) => {
          if (!file.id) throw new Error('Archivo sin ID');
          return file.id;
        });
        console.log('Archivos subidos con IDs:', fileIds);
      }

      // 2. Crear el reporte
      const reporteData = {
        data: {
          ...data,
          archivosAdjuntos: fileIds.length > 0 ? fileIds : undefined
        }
      };

      const response = await axios.post(`${this.url}/reportes`, reporteData, {
        headers: baseHeaders,
        timeout: 30000
      });

      if (!response.data?.data?.id) {
        throw new Error('No se recibió ID del reporte');
      }

      reporteId = response.data.data.id;
      console.log('Reporte creado con ID:', reporteId);

      return {
        reporteId,
        fileIds
      };

    } catch (error) {
      console.error('Error en crearReporteConArchivos:', error);
      throw new Error(`No se pudo crear el reporte: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  enProceso(documentId: any, estado: any, token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    })

    return axios.put(`${this.url}/reportes/${documentId}`, { data: { estado: estado } }, { headers: options });
  }
  resuelto(documentId: any, estado: any, solucion:any, token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    })

    return axios.put(`${this.url}/reportes/${documentId}`, { data: { estado: estado, solucionAplicada: solucion } }, { headers: options });
  }

  actualizarestado(id: any, estado: any, tecnico: any, token: string) {
    let options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    })
    console.log(id, estado, tecnico)

    return axios.put(`${this.url}/reportes/${id}`, { data: { tecnico_asignado: tecnico, estado: estado } }, { headers: options });
  }

  historialAcep(data: any, token: string) {
    console.log('esto se manda al historial', data)
    const options = new AxiosHeaders({
      'Authorization': 'Bearer ' + token
    });

    return axios.post(`${this.url}/historial-acciones`, { data }, { headers: options });
  }

  async crearHistorial(data: any, token: string) {
    const headers = new AxiosHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    console.log('Datos que se mandan ', data)

    try {
      const response = await axios.post(`${this.url}/historial-acciones`, { data}, {
        headers,
        timeout: 60000
      });
      return response.data;
    } catch (error) {
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
    console.log(a, usuarioActualizado)
    return axios.put(`${this.url}/users/${a}`, { data: { estatus: usuarioActualizado } }, { headers: options });

  }

}
