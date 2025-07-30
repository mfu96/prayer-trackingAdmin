import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ListResponseModel } from '../interfaces/responses/listResponseModel';
import { Observable } from 'rxjs';
import { Employee } from '../interfaces/entities/employee';
import { EmployeeDetailDto } from '../interfaces/entities/employeeDetailDto';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  getEmployees(): Observable<ListResponseModel<Employee>> {
    let newPath = this.apiUrl + 'employees/getall';
    return this.httpClient.get<ListResponseModel<Employee>>(newPath);
  }

  getEmployeeDetail3(): Observable<ListResponseModel<EmployeeDetailDto>> {
    let newPath = this.apiUrl + 'employees/getdetails';
    return this.httpClient.get<ListResponseModel<EmployeeDetailDto>>(newPath);
  }

  getEmployeeDetail2(employeeId?: number): Observable<ListResponseModel<EmployeeDetailDto>> {
    let newPath = this.apiUrl + 'employees/getdetails?employeeId=' + employeeId;
    return this.httpClient.get<ListResponseModel<EmployeeDetailDto>>(newPath);
  }

  getEmployeeDetail(employeeId?: number): Observable<ListResponseModel<EmployeeDetailDto>> {
    let params = new HttpParams();
    if (employeeId != null) {
      params = params.set('employeeId', employeeId.toString());
    }

    return this.httpClient.get<ListResponseModel<EmployeeDetailDto>>(`${this.apiUrl}employees/getdetails`, { params });
  }


    updateEmployee(payload: any): Observable<ListResponseModel<EmployeeDetailDto>> {
    // API isteği senin örneğine göre düzenlendi.
    return this.httpClient.post<ListResponseModel<EmployeeDetailDto>>(`${this.apiUrl}employees/update`, payload);
  }
}
