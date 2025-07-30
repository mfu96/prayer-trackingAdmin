import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListResponseModel } from '../interfaces/responses/listResponseModel';
import {  ImageDto } from '../interfaces/entities/ImageDto';
import { environment } from 'src/environments/environment';
import { ResponseModel } from '../interfaces/responses/responseModel';

@Injectable({
  providedIn: 'root' // Servisin her yerden erişilebilir olmasını sağlar
})
export class ImageService {
  // API'nizin ana URL'si. Bu, ortam değişkenlerinden (environment) gelmelidir.

baseUrl= environment.baseUrl;
  apiUrl= environment.apiUrl + 'images';




  constructor(private http: HttpClient) { }

  /**
   * Belirtilen endpoint ve parametrelerle resimleri getirir.
   * @param endpoint 'getimagesbyUser', 'getimagesbyMosque' gibi API endpoint'i.
   * @param params { userid: 15 } veya { mosqueid: 3 } gibi bir nesne.
   * @returns Resim verilerini içeren bir Observable.
   */
  getImages(endpoint: string, params: { [key: string]: any }): Observable<ListResponseModel<ImageDto>> {
    let httpParams = new HttpParams();
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }

    return this.http.get<ListResponseModel<ImageDto>>(`${this.apiUrl}/${endpoint}`, { params: httpParams });
  }

  /**
   * Resim yolunu tam URL'ye çevirir.
   * @param imagePath API'den gelen '/uploads/...' şeklindeki yol.
   * @returns Tam resim URL'si.
   */
  getFullImagePath(imagePath: string): string {
    return `${this.baseUrl}${imagePath}`;
  }

  addUserImage(formData: FormData): Observable<ResponseModel> { // Dönen tipi ResponseModel olarak güncelledim
    return this.http.post<ResponseModel>(`${this.apiUrl}/adduser`, formData);
  }
  
  updateUserImage(formData: FormData): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${this.apiUrl}/update`, formData);
  }

  // YENİ: Resim ID'si ile silme metodu
  deleteImageById(imageId: number): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${this.apiUrl}/delete`, { imageId: imageId });
  }
}
