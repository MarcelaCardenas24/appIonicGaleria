
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FotoService } from '../services/foto.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false
})
export class Tab1Page implements OnInit {

  public fotoService = inject(FotoService);
  private changeDetector = inject(ChangeDetectorRef);

  constructor() {}

  async addPhotoToGallery() {
    await this.fotoService.addNewToGallery();
    this.changeDetector.detectChanges();
  }

  async ngOnInit() {
    await this.fotoService.loadSaved();
    this.changeDetector.detectChanges();
  }
}