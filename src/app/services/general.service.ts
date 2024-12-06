import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  test(): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}`);
  }
  initFrames(): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/test/InitAllFrames`);
  }
  deleteAllThreads(): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/test/DeleteAllThreads`);
  }
}
