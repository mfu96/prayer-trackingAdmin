import { CommonModule } from '@angular/common';
import { booleanAttribute, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ColumnDefinition } from '../generic-list-component/generic-list-component';
import { FormsModule } from '@angular/forms';
import { DropdownOption } from '../searchable-dropdown-component/searchable-dropdown-component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-generic-detail-modal-component',
    standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule], // FormsModule ve yeni dropdown eklendi

  templateUrl: './generic-detail-modal-component.html',
  styleUrl: './generic-detail-modal-component.scss'
})
export class GenericDetailModalComponent<T extends { [key: string]: any }> implements OnChanges{
  // --- GİRDİLER VE ÇIKTILAR ---
  @Input({ transform: booleanAttribute }) isVisible: boolean = false;
  @Input({ transform: booleanAttribute }) isLoadingImages: boolean = false;
  @Input() item: T | null = null;
  @Input() columns: ColumnDefinition[] = [];
  @Input() images: string[] = []; // Tam resim URL'lerinin listesi
    @Input() dropdownData: { [key: string]: DropdownOption[] } = {}; // Örn: { 'companyId': [{id:1, name:'Firma A'}] }


  @Output() closeModal = new EventEmitter<void>();

    // YENİ: Kaydetme ve Silme olayları
  @Output() saveItem = new EventEmitter<T>();
  @Output() deleteItem = new EventEmitter<T>();
    @Output() uploadImage = new EventEmitter<{itemId: any, formData: FormData}>();
      @Output() deleteImage = new EventEmitter<string>(); // YENİ: Resim silme olayı



  // --- İÇ DEĞİŞKENLER ---
  currentImageIndex = 0;
    isEditMode = false;
  editableItem: T | null = null; // Düzenleme için orijinal verinin bir kopyası
    selectedFile: File | null = null;
      filteredDropdownOptions: { [key: string]: DropdownOption[] } = {};



      ngOnChanges(changes: SimpleChanges) {
    if (changes['item'] && this.item) {
      // DÜZELTME: Düzenleme moduna girildiğinde kopyası oluşturulur, bu sayede orijinal veri bozulmaz.
      this.editableItem = JSON.parse(JSON.stringify(this.item)); // Derin kopya
      this.isEditMode = false;
      this.selectedFile = null;
      this.initializeDependentDropdowns();
    }
  }

    // YENİ: Tamamen generic hale getirilmiş filtreleme mantığı
  initializeDependentDropdowns(): void {
    this.columns.forEach(col => {
      // Eğer bir sütun 'çocuk' ise (yani bir ebeveyne bağımlıysa)
      if (col.renderAs === 'dropdown' && col.parentIdentifier && this.editableItem) {
        const parentField = this.columns.find(p => p.childField === col.field)?.field;
        if (parentField) {
          const parentId = this.editableItem[parentField];
          this.filterDependentOptions(col.field, col.parentIdentifier, parentId);
        }
      }
    });
  }


  // Modalı kapat
  close(): void {
    this.closeModal.emit();
    // Modal kapandığında slider'ı sıfırla
    setTimeout(() => {
        this.currentImageIndex = 0;
    }, 300); // Animasyon süresi kadar bekle
  }

  // Önceki resme git
  prevImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    } else {
      this.currentImageIndex = this.images.length - 1; // Başa dön
    }
  }

  // Sonraki resme git
  nextImage(): void {
    if (this.currentImageIndex < this.images.length - 1) {
      this.currentImageIndex++;
    } else {
      this.currentImageIndex = 0; // Sona gelince başa dön
    }
  }

  // Dışarıya tıklayınca kapat (isteğe bağlı)
  onBackdropClick(event: MouseEvent): void {
      if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
          this.close();
      }
  }
 



  
  // Düzenleme modunu aç/kapat
  toggleEditMode(): void { this.isEditMode = !this.isEditMode; }
  cancelEdit(): void {
    this.isEditMode = false;
    // İptal edince orijinal veriyi geri yükle
    if (this.item) {
      this.editableItem = JSON.parse(JSON.stringify(this.item));
    }
  }
  
  // Değişiklikleri kaydetmek için olayı yayınla
  // DÜZELTME: Kaydetme
  onSave(): void {
        console.log('[MODAL - Adım 1] Kaydet butonuna tıklandı. Veri:', this.editableItem);

    if (this.editableItem) {
            console.log('[MODAL - Adım 2] "saveItem" olayı dışarıya yayınlanıyor (emit).');

      this.saveItem.emit(this.editableItem);
      // Kaydetme başarılı olunca edit moddan çıkmak daha mantıklı, bu yüzden bu satırı ana componente taşıyacağız.
      // this.isEditMode = false; 
    }
  }
  // Silmek için olayı yayınla
  // DÜZELTME: Silme
  onDelete(): void {
        console.log('[MODAL - Adım 1] Sil butonuna tıklandı. Silinecek öğe:', this.item);

    if (this.item) {
            console.log('[MODAL - Adım 2] "deleteItem" olayı dışarıya yayınlanıyor (emit).');

      this.deleteItem.emit(this.item);
    }
  }

   // YENİ: Dropdown'dan seçilen ID'yi güncelle

  onDropdownSelection(field: string, id: any): void {
    if (this.editableItem) {
      // HATA DÜZELTMESİ: TypeScript'in generic tip hatasını aşmak için 'any' kullanıyoruz.
      (this.editableItem as any)[field] = id;
    }
  }
  
  // YENİ: Resim Yükleme
  onFileSelected(event: Event): void {
            console.log('[MODAL - Adım 1] Resim yükle butonuna tıklandı. Yüklenecek öğe:', this.item);

    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
                  console.log('[MODAL - Adım 2] dışarı yayaınlanıyor (event).');

      this.selectedFile = file;
    }
  }
  
  onUploadImage(): void {
    if (this.selectedFile && this.item) {
      const formData = new FormData();
      // API isteğinize göre anahtarları ayarlayın (userId, mosqueId vb.)
      const idField = this.columns.find(c => c.renderAs === 'image-key')?.field || 'userId';
      formData.append(idField, this.item[idField]);
      formData.append('Image', this.selectedFile, this.selectedFile.name);
      
      this.uploadImage.emit({ itemId: this.item['id'] || this.item['userId'], formData });
      this.selectedFile = null;
    }
  }

    onDeleteImage(imageUrl: string): void {
    if (confirm('Bu resmi silmek istediğinizden emin misiniz?')) {
      this.deleteImage.emit(imageUrl);
    }
  }

  

  getDropdownDisplayValue2(field: string, id: any): string {
    const options = this.dropdownData[field];
    console.log('[MODAL - Adım 1] Dropdown için seçenekler:', options);

    console.log('[MODAL - Adım 2] Seçilen ID:', id);
    if (!options) {
      return 'Veri Yok';
    }
    const selectedOption = options.find(opt => opt.id == id);
    return selectedOption ? selectedOption.name : 'Belirtilmemiş';
  }
 // DÜZELTME: Dropdown için daha sağlam bir fonksiyon
  getDropdownDisplayValue(field: string, id: any): string {
    // 1. Gerekli verilerin gelip gelmediğini kontrol et
    if (!this.dropdownData || !this.dropdownData[field] || id === undefined || id === null) {
      // Henüz veri yoksa veya ID tanımsızsa, 'Belirtilmemiş' döndür.
      // Bu, loglardaki 'undefined' ID sorununu açıklar.
      return 'Belirtilmemiş';
    }
    
    const options = this.dropdownData[field];
    console.log('[MODAL - Adım 1] Dropdown için seçenekler:', options); 
    console.log('[MODAL - Adım 2] Seçilen ID:', id);
    
    // 2. Karşılaştırmayı yap
    // DİKKAT: `opt.id == id` kullanıyoruz çünkü birisi sayı (number), diğeri metin (string) olabilir.
    // `===` kullanırsak tip uyuşmazlığından dolayı eşleşme bulamayabilir.
    const selectedOption = options.find(opt => opt.id == id); 
    console.log('[MODAL - Adım 3] Seçilen seçenek:', selectedOption);
    console.log('[MODAL - Adım 4] Seçilen seçenek adı:', selectedOption ? selectedOption.name : 'Eşleşme Yok');
    
    // 3. Sonucu döndür
    return selectedOption ? selectedOption.name : 'Eşleşme Yok';
  }


  
  // YENİ: Tamamen generic hale getirilmiş olay yöneticisi
  onParentDropdownChange(parentCol: ColumnDefinition, selectedParentId: any): void {
    if (this.editableItem && parentCol.childField) {
      const childCol = this.columns.find(c => c.field === parentCol.childField);
      if (childCol && childCol.parentIdentifier) {
        // Bağımlı olanın seçimini sıfırla
        (this.editableItem as any)[childCol.field] = null;
        // Yeni seçenekleri filtrele
        this.filterDependentOptions(childCol.field, childCol.parentIdentifier, selectedParentId);
      }
    }
  }

  // YENİ: Tamamen generic hale getirilmiş filtreleme fonksiyonu
  private filterDependentOptions(childField: string, parentIdentifier: string, parentId: any): void {
    if (parentId !== null && parentId !== undefined) {
      // Artık 'companyId' gibi hardcoded bir değer yok. Dışarıdan gelen 'parentIdentifier' kullanılıyor.
      this.filteredDropdownOptions[childField] = (this.dropdownData[childField] || []).filter(
        option => option[parentIdentifier] === parentId
      );
    } else {
      this.filteredDropdownOptions[childField] = [];
    }
  }


  
}
