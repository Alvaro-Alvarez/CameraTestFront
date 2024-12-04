import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  private apiUrl: string = 'https://localhost:7296/api/Test';

  constructor(private http: HttpClient) { }

  test(): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}`);
  }
}
