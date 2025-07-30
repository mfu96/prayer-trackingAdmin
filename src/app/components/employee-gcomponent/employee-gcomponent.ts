import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { ColumnDefinition, GenericListComponent } from '../generic-list-component/generic-list-component';
import { EmployeeService } from 'src/app/services/employee-service';
import { EmployeeDetailDto } from 'src/app/interfaces/entities/employeeDetailDto';
import { GenericDetailModalComponent } from '../generic-detail-modal-component/generic-detail-modal-component';
import { ImageService } from 'src/app/services/image-service';
import { UserService } from 'src/app/services/user-service';
import { CompanyService } from 'src/app/services/company-service';
import { MosqueService } from 'src/app/services/mosque-service';
import { DropdownOption, SearchableDropdownComponent } from '../searchable-dropdown-component/searchable-dropdown-component';
import { ToastService } from 'src/app/services/toast-service';
import { ImageDto } from 'src/app/interfaces/entities/ImageDto';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-employee-gcomponent',
 standalone: true,
  // Yeni generic-list bileşenini ve diğer modülleri import et
  imports: [
    SharedModule,
    HttpClientModule,
    CommonModule,
    GenericListComponent,
    GenericDetailModalComponent,
    SearchableDropdownComponent
],
    templateUrl: './employee-gcomponent.html',
  styleUrl: './employee-gcomponent.scss',
    providers: [
      EmployeeService,
      ImageService, // Yeni servis    
      UserService,
      CompanyService,
      MosqueService,
      ToastrService
    ]

})
export class EmployeeGComponent implements OnInit {
  
  allEmployeeDetails: EmployeeDetailDto[] = [];
  isLoading = true;
  errorMessage: string | null = null;


    // --- MODAL İÇİN YENİ DEĞİŞKENLER ---
  isDetailModalVisible = false;
  areImagesLoading = false;
  selectedEmployee: EmployeeDetailDto | null = null;
  detailImages: string[] = [];

   dropdownData: { [key: string]: DropdownOption[] } = {
    companyId: [],
    mosqueId: []
  };

    private fullImageDetails: ImageDto[] = [];
  

  // Generic-list bileşeni için sütun tanımları
  employeeListColumns: ColumnDefinition[] = [
    { field: 'employeeId', header: '#', initialWidth: '40px' },
    { field: 'firstName', header: 'Ad', initialWidth: '120px' },
    { field: 'lastName', header: 'Soyad', initialWidth: '120px' },
    { field: 'companyName', header: 'Bağlı Olduğu Birim', initialWidth: '150px' },
    { field: 'mosqueName', header: 'Cami', initialWidth: '150px' },
  
  ];
    employeeDetailColumns: ColumnDefinition[] = [
    { field: 'employeeId', header: '#', initialWidth: '40px', editable:false },
    { field: 'firstName', header: 'Ad', initialWidth: '120px' },
    { field: 'lastName', header: 'Soyad', initialWidth: '120px' },
   // { field: 'companyName', header: 'Firma', initialWidth: '150px' },
   // { field: 'mosqueName', header: 'Cami', initialWidth: '150px' },
    { field: 'email', header: 'E-posta', initialWidth: '180px',renderAs: 'mailto', editable:false }, // E-posta için özel gösterim
    { field: 'contact', header: 'Telefon', initialWidth: '120px' ,renderAs: 'tel'}, // Telefon için özel gösterim
    { field: 'deviceName', header: 'Cihaz', initialWidth: '120px' , editable:false },
 { field: 'companyId', header: 'Firma', renderAs: 'dropdown', childField: 'mosqueId' },
    // Çocuk dropdown: Kendi seçeneklerini hangi özelliğe göre filtreleyeceğini söylüyor ('companyId')
    { field: 'mosqueId', header: 'Cami', renderAs: 'dropdown', parentIdentifier: 'companyId' },
    { field: 'registiration', header: 'Kayıt Tarihi', initialWidth: '120px' , editable:false}
  ];

  constructor(private employeeService: EmployeeService,
    private imageService: ImageService,
    private userService: UserService,
        private toastService: ToastService,
        private toastr: ToastrService,
            private companyService: CompanyService,
    private mosqueService: MosqueService,

  ) { }

  ngOnInit(): void {
   this.loadDropdownData(() => {
      this.loadEmployeeDetails();
    });
  }


  loadDropdownData(callback: () => void): void {
    let companyDataLoaded = false;
    let mosqueDataLoaded = false;
    const onDataLoaded = () => {
      if (companyDataLoaded && mosqueDataLoaded) callback();
    };

    this.companyService.getCompanies().subscribe(res => {
      if (res.success) {
        this.dropdownData['companyId'] = res.data.map(c => ({ id: c.companyId, name: c.companyName }));
      }
      companyDataLoaded = true;
      onDataLoaded();
    });
    this.mosqueService.getMosques().subscribe(res => {
      if (res.success) {
        this.dropdownData['mosqueId'] = res.data.map(m => ({ 
          id: m.mosqueId,
           name: m.mosqueName,
          companyId: m.companyId // DİKKAT: Bu, dropdown'da filtreleme için kullanılacak
         }));
      }
      mosqueDataLoaded = true;
      onDataLoaded();
    });
  }


  loadEmployeeDetails(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.employeeService.getEmployeeDetail().subscribe({
      next: (response) => {
        if (response.success) {
          this.allEmployeeDetails = response.data;
          console.log('[personel - Adım 1] Personel detayları yüklendi:', this.allEmployeeDetails);
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

  


  // Generic-list'ten gelen satır tıklama olayını yakala
  // handleEmployeeRowClick(employee: EmployeeDetailDto): void {
  //   console.log('Tıklanan Personel:', employee);
  //   // Burada personelle ilgili bir işlem yapabilirsiniz (örn: detay sayfasına yönlendirme)
  //   // alert(`Personel Adı: ${employee.firstName} ${employee.lastName}`);
  // }

   // Generic-list'ten gelen satır tıklama olayını yakala
  handleEmployeeRowClick(employee: EmployeeDetailDto): void {
   // this.selectedEmployee = employee;
  //  this.isDetailModalVisible = true;
    this.areImagesLoading = true;
    this.detailImages = []; // URL listesini temizle
    this.fullImageDetails = []; // Tam veri listesini temizle

    console.log('[PARENT - Adım 1] Tıklanan orijinal personel verisi:', employee);

    // Klonlama: Orijinal listeyi bozmamak için tıklanan personelin bir kopyasını oluşturuyoruz.
    const employeeCopy = { ...employee };

    // Veri Zenginleştirme: Kopyalanan nesneye ID'leri ekliyoruz.
    const company = this.dropdownData['companyId'].find(c => c.name === employeeCopy.companyName);
    if (company) {
      (employeeCopy as any).companyId = company.id;
    }
    console.log(`[PARENT - Adım 2] '${employeeCopy.companyName}' için bulunan Şirket ID:`, (employeeCopy as any).companyId);

    const mosque = this.dropdownData['mosqueId'].find(m => m.name === employeeCopy.mosqueName);
    if (mosque) {
      (employeeCopy as any).mosqueId = mosque.id;
    }
    console.log(`[PARENT - Adım 3] '${employeeCopy.mosqueName}' için bulunan Cami ID:`, (employeeCopy as any).mosqueId);

    // 3. Artık ID'leri içeren "zenginleştirilmiş" nesneyi modala gönder
    this.selectedEmployee = employeeCopy;
    this.isDetailModalVisible = true;
    
    // ... resim yükleme kodları aynı kalabilir ...
    this.areImagesLoading = true;


    this.imageService.getImages('getimagesbyUser', { userid: employee.userId }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // DÜZELTME: Hem tam veriyi hem de URL'leri sakla
          this.fullImageDetails = response.data;
          this.detailImages = response.data.map(img => this.imageService.getFullImagePath(img.imagePath));
        }
        this.areImagesLoading = false;
      },
      error: (err) => { /* ... */ }
    });
  }

  // Modalı kapatma fonksiyonu
  closeDetailModal(): void {
    this.isDetailModalVisible = false;
    this.selectedEmployee = null;
    this.detailImages = [];
  }

    // YENİ: Kaydetme işlemini yöneten metod
 handleSaveEmployee(employeeToSave: EmployeeDetailDto): void {
      console.log('[PARENT - Adım 3] "saveItem" olayı yakalandı. Gelen veri:', employeeToSave);

    const payload = {
      userForRegisterDto: {
        firstname: employeeToSave.firstName,
        lastname: employeeToSave.lastName,
        email: employeeToSave.email,
      },
      employee: {
        employeeid: employeeToSave.employeeId,
        companyid: employeeToSave.companyId,
        contact: employeeToSave.contact,
        registration: employeeToSave.registiration,
        mosqueId: employeeToSave.mosqueId
      }
    };
        console.log('[PARENT - Adım 4] API\'ye gönderilecek payload oluşturuldu:', payload);


    this.employeeService.updateEmployee(payload).subscribe({
      next: (res) => {
                console.log('[PARENT - Adım 5] API\'den yanıt geldi:', res);

        if (res.success) {
          this.toastr.success(res.message, 'Başarılı');
          this.loadEmployeeDetails();
          this.closeDetailModal();
        } else {
          this.toastr.error(`Güncelleme hatası: ${res.message || 'Bilinmeyen Hata'}`, 'Hata');
        }
      },
      error: (err) => {
                console.error('[PARENT - Adım 5 HATA] API isteği başarısız oldu:', err);

        this.toastr.show('Sunucu hatası! API çalışmıyor olabilir.', 'error')
      }
    });
  }

  // YENİ: Silme işlemini yöneten metod
 handleDeleteEmployee(employeeToDelete: EmployeeDetailDto): void {
      console.log('[PARENT - Adım 3] "deleteItem" olayı yakalandı. Silinecek kullanıcı ID:', employeeToDelete.userId);

   if (!window.confirm(`${employeeToDelete.firstName} ${employeeToDelete.lastName} adlı kullanıcıyı silmek istediğinizden emin misiniz?`)) {
        console.log('[PARENT] Silme işlemi kullanıcı tarafından iptal edildi.');
        return;
    }     
    console.log('[PARENT - Adım 4] API\'ye silme isteği gönderiliyor...');
 
   this.userService.deleteUser(employeeToDelete.userId).subscribe({
        next: (res) => {
            console.log('[PARENT - Adım 5] API\'den yanıt geldi:', res);
            if (res.success) {
                this.toastr.success(res.message, 'Başarılı');
                this.allEmployeeDetails = this.allEmployeeDetails.filter(e => e.userId !== employeeToDelete.userId);
                this.closeDetailModal();
            } else {
                this.toastr.error(`Silme hatası: ${res.message}`, 'Hata');
            }
        },
        error: (err) => {
            console.error('[PARENT - Adım 5 HATA] API isteği başarısız oldu:', err);
            this.toastr.error('Sunucu hatası!', 'Hata');
        }
    });
  }

  handleUploadImage(event: { itemId: any, formData: FormData }): void {

          console.log('[PARENT - Adım 3] "onFileSelected" olayı yakalandı. Gelen veri:', event);

      this.imageService.addUserImage(event.formData).subscribe({
          next: (res) => {
              if (res.success) {
                  this.toastr.success(res.message, 'Başarılı');
                  // Resmi anında galeride göstermek için resim listesini yenile
                  if(this.selectedEmployee) {
                    this.handleEmployeeRowClick(this.selectedEmployee);
                  }
                            this.closeDetailModal();

              } else {
                  this.toastService.show('Resim eklenemedi!', 'error');
              }
          },
          error: (err) => this.toastService.show('Resim yükleme hatası!', 'error')
      });
  }

   // YENİ: Resim silme fonksiyonu
  handleDeleteImage(imageUrl: string): void {
    console.log('[PARENT - Adım 3] "deleteImage" olayı yakalandı. Silinecek resim URL:', imageUrl);
    
    const imagePath = imageUrl.replace(this.imageService.baseUrl, '');
    // DÜZELTME: ID'yi sakladığımız yeni diziden buluyoruz
    const imageToDelete = this.fullImageDetails.find(img => img.imagePath === imagePath);

    if (imageToDelete) {
        console.log('[PARENT - Adım 4] Resim ID bulundu:', imageToDelete.imageId, '. API\'ye istek gönderiliyor...');
        this.imageService.deleteImageById(imageToDelete.imageId).subscribe({
            next: (res) => {
                if (res.success) {
                    this.toastr.success(res.message, 'Başarılı');
                    // Galeriyi anında güncelle
                    this.detailImages = this.detailImages.filter(imgUrl => imgUrl !== imageUrl);
                    this.fullImageDetails = this.fullImageDetails.filter(img => img.imageId !== imageToDelete.imageId);

                  } else {
                    this.toastr.error(res.message || 'Resim silinemedi!', 'error');
                }
            },
            error: (err) => this.toastService.show('Resim silme hatası!', 'error')
        });
    } else {
        console.error('[PARENT HATA] Silinecek resmin ID\'si bulunamadı!');
        this.toastService.show('Resim bilgisi bulunamadı!', 'error');
    }
  }

}
