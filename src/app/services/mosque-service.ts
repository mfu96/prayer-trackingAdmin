import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ListResponseModel } from '../interfaces/responses/listResponseModel';
import { Mosque } from '../interfaces/entities/mosque';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MosqueService {
  apiUrl=environment.apiUrl;

  constructor(private http: HttpClient) {}

    getMosques(): Observable<ListResponseModel<Mosque>> {
    return this.http.get<ListResponseModel<Mosque>>(`${this.apiUrl}mosques/getall`);
  }
}
