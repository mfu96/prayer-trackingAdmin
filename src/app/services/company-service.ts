import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ListResponseModel } from '../interfaces/responses/listResponseModel';
import { Company } from '../interfaces/entities/company';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  apiUrl=environment.apiUrl;

  constructor(private http: HttpClient) {}

    getCompanies(): Observable<ListResponseModel<Company>> {
    return this.http.get<ListResponseModel<Company>>(`${this.apiUrl}companies/getall`);
  }
}
