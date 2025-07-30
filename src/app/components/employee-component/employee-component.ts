import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeDetailDto } from 'src/app/interfaces/entities/employeeDetailDto';
import { EmployeeService } from 'src/app/services/employee-service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

// Sıralama yapılacak sütunların adlarını tip güvenliğiyle yönetmek için
type SortableColumn = keyof EmployeeDetailDto;
@Component({
  selector: 'app-employee-component',
    standalone: true, // Standalone component olduğunu belirtin
  imports: [SharedModule, HttpClientModule,FormsModule,CommonModule], // HttpClientModule'ü ekleyin

  templateUrl: './employee-component.html',
  styleUrl: './employee-component.scss',
  providers: [EmployeeService] // EmployeeService'i sağlayıcı olarak ekleyin
})
export class EmployeeComponent implements OnInit {
  allEmployeeDetails: EmployeeDetailDto[] = []; // Tüm verileri saklamak için
  displayedEmployeeDetails: EmployeeDetailDto[] = []; // Görüntülenecek veriler
  isLoading = true;
  errorMessage: string | null = null;
  searchTerm: string = ''; // Arama terimi

    // --- YENİDEN BOYUTLANDIRMA İÇİN GEREKLİ DEĞİŞKENLER ---
  activeResizeColumn: string | null = null; // Aktif olarak boyutlandırılan sütunun adı
  startX: number = 0; // Farenin ilk tıklandığı X konumu
  startWidth: number = 0; // Boyutlandırma başladığında sütunun başlangıç genişliği
  columnWidths: { [key: string]: number } = {}; // Sütunların son genişliklerini saklar
    private wasResizing = false; // Boyutlandırma sonrası tıklamayı engellemek için bayrak



    // --- SIRALAMA DEĞİŞKENLERİ ---
  sortColumn: SortableColumn | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';



  @ViewChild('tableContainer') tableContainer!: ElementRef;

    // Renderer2 ve event listener'ları yönetmek için
  private mouseMoveListener!: () => void;
  private mouseUpListener!: () => void;


  constructor(private employeeService: EmployeeService,
     private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.loadEmployeeDetails();
  }

  loadEmployeeDetails(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.employeeService.getEmployeeDetail().subscribe({
      next: (response) => {
        if (response.success) {
          this.allEmployeeDetails = response.data;
          this.displayedEmployeeDetails = [...this.allEmployeeDetails]; // Tüm verileri kopyala
        } else {
          this.errorMessage = response.message;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Veri yüklenirken hata oluştu: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  // Arama fonksiyonu (tüm alanlarda arama yapar)
  search(): void {
    if (!this.searchTerm.trim()) {
      this.displayedEmployeeDetails = [...this.allEmployeeDetails];
      return;
    }
    
    const term = this.searchTerm.toLowerCase().trim();
    this.displayedEmployeeDetails = this.allEmployeeDetails.filter(emp => 
      (emp.employeeId.toString().includes(term)) || 
      (emp.firstName?.toLowerCase().includes(term)) || 
      (emp.lastName?.toLowerCase().includes(term)) || 
      (emp.registiration?.toLowerCase().includes(term)) ||
      (emp.companyName?.toLowerCase().includes(term)) ||
      (emp.mosqueName?.toLowerCase().includes(term)) ||
      (emp.email?.toLowerCase().includes(term)) ||
      (emp.contact?.toLowerCase().includes(term)) ||
      (emp.deviceName?.toLowerCase().includes(term))
    );
  }

  // Temizleme fonksiyonu
  clearSearch(): void {
    this.searchTerm = '';
    this.displayedEmployeeDetails = [...this.allEmployeeDetails];
  }

  // TrackBy fonksiyonu
  trackByEmployeeId(index: number, item: EmployeeDetailDto): number {
    return item.employeeId;
  }

   // --- YENİ SIRALAMA FONKSİYONU ---
  sortData(column: SortableColumn): void {
    // Eğer bir boyutlandırma işlemi yeni bittiyse sıralama yapma
    if (this.wasResizing) {
      return;
    }

    if (this.sortColumn === column) {
      // Eğer aynı sütuna tıklanırsa sıralama yönünü değiştir
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Eğer yeni bir sütuna tıklanırsa, o sütunu sıralama sütunu yap ve A'dan Z'ye sırala
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    // Diziyi sırala
    this.displayedEmployeeDetails.sort((a, b) => {
      const valA = a[column];
      const valB = b[column];

      // Hataları önlemek ve boş değerleri en sona atmak için kontrol
      if (valA == null) return 1;
      if (valB == null) return -1;

      let comparison = 0;
      // Türkçe karakterleri doğru sıralamak için localeCompare kullan
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB, 'tr', { sensitivity: 'base' });
      } else {
        // Sayı, tarih vb. için standart karşılaştırma
        comparison = (valA < valB) ? -1 : (valA > valB) ? 1 : 0;
      }

      // Sıralama yönüne göre sonucu döndür
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  // Boyutlandırmayı başlatan fonksiyon
  // --- GÜNCELLENMİŞ SÜTUN BOYUTLANDIRMA FONKSİYONLARI ---

  // Boyutlandırmayı başlatan fonksiyon
  startResize(event: MouseEvent, column: string): void {
    // DÜZELTME: Olayın `currentTarget`'ını (yani `th` elementini) kullanıyoruz.
    const thElement = (event.currentTarget as HTMLElement);
    const rect = thElement.getBoundingClientRect();

    // Sadece sütunun sağ kenarına çok yakın (örn. 10px) tıklandığında boyutlandırmayı başlat
    // Bu, yanlışlıkla boyutlandırmayı engeller.
    if (rect.right - event.clientX < 10) {
        event.preventDefault(); // Metin seçilmesini engelle
        
        this.activeResizeColumn = column;
        this.startX = event.pageX;
        this.startWidth = thElement.offsetWidth;

        this.mouseMoveListener = this.renderer.listen('document', 'mousemove', this.doResize);
        this.mouseUpListener = this.renderer.listen('document', 'mouseup', this.stopResize);
    }
  }

  // Fare hareket ettikçe sütunu yeniden boyutlandıran fonksiyon
  doResize = (event: MouseEvent) => {
    if (!this.activeResizeColumn) return;

    const delta = event.pageX - this.startX;
    const newWidth = this.startWidth + delta;

    const table = this.tableContainer.nativeElement;
    const thToResize = table.querySelector(`th[data-column='${this.activeResizeColumn}']`);

    if (thToResize) {
      thToResize.style.width = `${Math.max(50, newWidth)}px`;
    }
  }

  // Boyutlandırmayı bitiren fonksiyon
  stopResize = () => {
    if (this.activeResizeColumn) {
      const table = this.tableContainer.nativeElement;
      const thToResize = table.querySelector(`th[data-column='${this.activeResizeColumn}']`);
      if (thToResize) {
        this.columnWidths[this.activeResizeColumn] = thToResize.offsetWidth;
      }
    }
    
    this.activeResizeColumn = null;

    if (this.mouseMoveListener) this.mouseMoveListener();
    if (this.mouseUpListener) this.mouseUpListener();
  }
}