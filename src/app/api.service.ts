import { Injectable } from '@angular/core';  
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';

import { throwError } from 'rxjs';
import { retry, catchError, tap } from 'rxjs/operators';

import { Product } from './product';


@Injectable({  
	providedIn: 'root'  
})  
export class ApiService {

	private SERVER_URL = "http://localhost:3000/products";
  first: any;
  prev: any;
  next: any;
  last: any;
  constructor(private httpClient: HttpClient) { }
  
  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      //Server-side errors
      errorMessage = `Error code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }
  
	public get(){
    // add safe, URL encoded _page and _limit parameters
		return this.httpClient.get<Product[]>(this.SERVER_URL, { params: new HttpParams({fromString: "_page=1&_limit=10"}), observe: "response"}).pipe(retry(3), catchError(this.handleError), tap(res => {
      console.log(res.headers.get('Link'));
      this.parseLinkHeader(res.headers.get('Link'));
    }));
  }

  public sendGetRequestToUrl(url:string) {
    return this.httpClient.get<Product[]>(url, {observe: "response"}).pipe(retry(3),
    catchError(this.handleError), tap(res => {
      console.log(res.headers.get('Link'));
      this.parseLinkHeader(res.headers.get('Link'));
    }));
  }

  parseLinkHeader(header) {
    if (header.length == 0) {
      return ;
    }

    let parts = header.split(',');
    var links = {};
    parts.forEach( p => {
      let section = p.split(';');
      var url = section[0].replace(/<(.*)>/, '$1').trim();
      var name = section[1].replace(/rel="(.*)"/, '$1').trim();
      links[name] = url;
    });
    
    this.first = links["first"];
    this.next = links["prev"];
    this.last = links["next"];
    this.prev = links["last"];
  }
}