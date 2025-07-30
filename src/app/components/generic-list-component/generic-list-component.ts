import { CommonModule } from '@angular/common';
import { AfterViewInit, booleanAttribute, Component, ElementRef, EventEmitter, Input, OnChanges, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Sütun tanımını dışarıdan alabilmek için bir arayüz (interface)
export interface ColumnDefinition {
  field: string;          // Veri nesnesindeki alan adı (örn: 'firstName')
  header: string;         // Tablo başlığında görünecek metin (örn: 'Ad')
  sortable?: boolean;     // Bu sütun sıralanabilir mi?
  initialWidth?: string;  // Başlangıç genişliği (örn: '150px')
    renderAs?: 'text' | 'tel' | 'mailto' | 'map-link'| 'dropdown' | 'image-key'; // YENİ: Özel gösterim tipleri
      editable?: boolean; // Varsayılanı true olacak

       // Dropdown için yeni alanlar

  // Ebeveyn dropdown için: Hangi çocuk alanı etkileyeceğini söyler.
  childField?: string; 
  
  // Çocuk dropdown için: Kendi seçeneklerini hangi özelliğe göre filtreleyeceğini söyler.
  parentIdentifier?: string; 
}

@Component({
  selector: 'app-generic-list-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
    templateUrl: './generic-list-component.html',
  styleUrl: './generic-list-component.scss'
})


export class GenericListComponent<T extends { [key: string]: any }> implements OnChanges {
  // --- GİRDİLER VE ÇIKTILAR ---
  @Input() data: T[] = []; // Dışarıdan gelen veri (herhangi bir tipte olabilir)
  @Input() columns: ColumnDefinition[] = []; // Sütun tanımları
  // HATA DÜZELTİLDİ: @Input.Boolean() yerine Angular v16+ ile gelen transform fonksiyonu kullanıldı.
  // Bu sayede <app-generic-list isLoading> gibi bir kullanım da doğru şekilde boolean'a çevrilir.
  @Input({ transform: booleanAttribute }) isLoading: boolean = false;   @Input() errorMessage: string | null = null; // Hata mesajı

  @Output() rowClicked = new EventEmitter<T>(); // Satıra tıklandığında veriyi dışarıya gönderir

  // --- İÇ DEĞİŞKENLER ---
  displayedData: T[] = []; // Filtrelenmiş ve sıralanmış, ekranda gösterilen veri
  searchTerm: string = '';

  // Sıralama
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // Sütun Yeniden Boyutlandırma
   // HATA DÜZELTMESİ: @ViewChild'ı bir setter ile kullanmak
  private _tableContainer!: ElementRef;
  @ViewChild('tableContainer') set tableContainer(el: ElementRef) {
    if(el) {
      // Element artık mevcut, DOM ile ilgili işlemleri burada yapabiliriz.
      this._tableContainer = el;
      this.initializeColumnWidths();
    }
  }

  columnWidths: { [key: string]: number } = {};
  private activeResizeColumn: string | null = null;
  private startX: number = 0;
  private startWidth: number = 0;
  private mouseMoveListener!: () => void;
  private mouseUpListener!: () => void;

  constructor(private renderer: Renderer2) {}

  // Dışarıdan gelen 'data' değiştiğinde tetiklenir
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.displayedData = [...this.data];
      this.search(); // Yeni veri geldiğinde mevcut arama filtresini uygula
    }
  }

  // Bileşen yüklendikten sonra başlangıç genişliklerini ayarla
  // ngAfterViewInit(): void {
  //   this.columns.forEach(col => {
  //     if (col.initialWidth) {
  //       const thElement = this.tableContainer.nativeElement.querySelector(`th[data-column='${col.field}']`);
  //       if (thElement) {
  //         thElement.style.width = col.initialWidth;
  //         this.columnWidths[col.field] = thElement.offsetWidth;
  //       }
  //     }
  //   });
  // }


   // ngAfterViewInit'i kaldırıp bu yeni metodu kullanacağız.
  initializeColumnWidths(): void {
    if (!this._tableContainer) return; // Ekstra güvenlik kontrolü

    this.columns.forEach(col => {
      if (col.initialWidth) {
        const thElement = this._tableContainer.nativeElement.querySelector(`th[data-column='${col.field}']`);
        if (thElement) {
          thElement.style.width = col.initialWidth;
          this.columnWidths[col.field] = thElement.offsetWidth;
        }
      }
    });
  }
  // Arama fonksiyonu
  search(): void {
    if (!this.searchTerm.trim()) {
      this.displayedData = [...this.data];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.displayedData = this.data.filter(item => {
        // Tanımlı tüm sütunlarda arama yap
        return this.columns.some(col => {
          const value = item[col.field];
          return value != null && value.toString().toLowerCase().includes(term);
        });
      });
    }
    // Arama sonrası sıralamayı koru
    if (this.sortColumn) {
        this.applySorting(this.sortColumn, this.sortDirection);
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.displayedData = [...this.data];
    if (this.sortColumn) {
        this.applySorting(this.sortColumn, this.sortDirection);
    }
  }

  // Sıralama mantığı
  sortData(field: string): void {
    if (this.activeResizeColumn) return; // Boyutlandırma sırasında sıralama yapma

    const direction = (this.sortColumn === field && this.sortDirection === 'asc') ? 'desc' : 'asc';
    this.applySorting(field, direction);
  }

  private applySorting(field: string, direction: 'asc' | 'desc'): void {
    this.sortColumn = field;
    this.sortDirection = direction;

    this.displayedData.sort((a, b) => {
      const valA = a[field];
      const valB = b[field];

      if (valA == null) return 1;
      if (valB == null) return -1;

      let comparison = 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB, 'tr', { sensitivity: 'base' });
      } else {
        comparison = (valA < valB) ? -1 : (valA > valB) ? 1 : 0;
      }
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  // Yeniden boyutlandırma fonksiyonları
  startResize(event: MouseEvent, columnField: string): void {
    const thElement = event.currentTarget as HTMLElement;
    const rect = thElement.getBoundingClientRect();

    if (rect.right - event.clientX < 10) { // Sadece sağ kenardan tetikle
      event.preventDefault();
      this.activeResizeColumn = columnField;
      this.startX = event.pageX;
      this.startWidth = thElement.offsetWidth;
      this.mouseMoveListener = this.renderer.listen('document', 'mousemove', this.doResize);
      this.mouseUpListener = this.renderer.listen('document', 'mouseup', this.stopResize);
    }
  }

  doResize = (event: MouseEvent): void => {
    if (!this.activeResizeColumn) return;
    const delta = event.pageX - this.startX;
    const newWidth = this.startWidth + delta;
        const table = this._tableContainer.nativeElement;

    const thToResize = this.tableContainer.nativeElement.querySelector(`th[data-column='${this.activeResizeColumn}']`);
    if (thToResize) {
      thToResize.style.width = `${Math.max(50, newWidth)}px`; // Minimum genişlik 50px
    }
  };

  stopResize = (): void => {
    if (this.activeResizeColumn) {
      const thToResize = this.tableContainer.nativeElement.querySelector(`th[data-column='${this.activeResizeColumn}']`);
            const table = this._tableContainer.nativeElement;

      if (thToResize) {
        this.columnWidths[this.activeResizeColumn] = thToResize.offsetWidth;
      }
    }
    this.activeResizeColumn = null;
    if (this.mouseMoveListener) this.mouseMoveListener();
    if (this.mouseUpListener) this.mouseUpListener();
  };

  // Satıra tıklandığında eventi tetikle
  handleRowClick(item: T): void {
    this.rowClicked.emit(item);
  }

  // Performans için TrackBy fonksiyonu
  trackByFn(index: number, item: T): any {
    // Eğer item'da 'id' varsa onu kullan, yoksa index'i kullan
    return item['id'] || index;
  }
}
