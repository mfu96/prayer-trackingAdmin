import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ListResponseModel } from '../interfaces/responses/listResponseModel';
import { User } from '../interfaces/entities/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
 apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}


    deleteUser(userId: number): Observable<ListResponseModel<User>> {
    return this.httpClient.post<ListResponseModel<User>>(`${this.apiUrl}users/delete`, { userid: userId });
  }
}
