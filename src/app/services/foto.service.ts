
import { Injectable } from '@angular/core';

import {
  Camera,
  CameraPhoto,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

import { Foto } from '../models/foto.interface';

@Injectable({
  providedIn: 'root'
})
export class FotoService {

  // Arreglo para almacenar las fotos capturadas
  public fotos: Foto[] = [];

  // Clave para guardar las fotos en Preferences
  private PHOTO_STORAGE: string = 'fotos';

  constructor() {}

  // Tomar una fotografía
  public async addNewToGallery() {

    const fotoCapturada = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    console.log('Foto capturada:', fotoCapturada);

    // Guardar la fotografía en el sistema de archivos
    const savedImageFile = await this.savedPicture(fotoCapturada);

    // Agregar la fotografía al arreglo
    this.fotos.unshift(savedImageFile);

    // Guardar la lista de fotografías en Preferences
    await Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.fotos)
    });
  }

  // Guardar la fotografía en Filesystem
  public async savedPicture(cameraPhoto: CameraPhoto) {

    // Convertir la fotografía a Base64
    const base64Data = await this.readAsBase64(cameraPhoto);

    const fileName = new Date().getTime() + '.jpeg';

    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    return {
      filepath: fileName,
      webviewPath: cameraPhoto.webPath
    };
  }

  // Convertir la fotografía a Base64
  public async readAsBase64(cameraPhoto: CameraPhoto) {

    const response = await fetch(cameraPhoto.webPath!);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }

  // Convertir Blob a Base64
  convertBlobToBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {

    const reader = new FileReader();

    reader.onerror = () => reject(reader.error);

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.readAsDataURL(blob);

  });

  // Recuperar las fotografías guardadas
 public async loadSaved() {
  console.log('Iniciando recuperación de fotos...');

  const listadoDeFotos = await Preferences.get({
    key: this.PHOTO_STORAGE
  });

  this.fotos = JSON.parse(listadoDeFotos.value || '[]') as Foto[];

  console.log('Fotos recuperadas:', this.fotos);

  for (const foto of this.fotos) {
    try {
      const readFile = await Filesystem.readFile({
        path: foto.filepath,
        directory: Directory.Data
      });

      foto.webviewPath = `data:image/jpeg;base64,${readFile.data}`;

      console.log('Foto cargada correctamente:', foto.filepath);

    } catch (error) {
      console.error('Error leyendo fotografía:', foto.filepath, error);
    }
  }

  console.log('Total de fotografías:', this.fotos.length);
}

}
