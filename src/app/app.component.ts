import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Drone-Simulator-with-Angular-v16';

  G_API_KEY:string = "YOUR_KEY_HERE"

  G_MAP_API:string = `https://maps.googleapis.com/maps/api/js?key=${this.G_API_KEY}`

  apiLoaded: Observable<boolean>;

  center: google.maps.LatLngLiteral = {lat: 24, lng: 12};
  zoom = 4;

  vertices: google.maps.LatLngLiteral[] = [
    {lat: 13, lng: 13},
    {lat: -13, lng: 0},
    {lat: 13, lng: -13},
  ];

  constructor(httpClient: HttpClient) {

    this.apiLoaded = httpClient.jsonp(this.G_MAP_API, 'callback')
        .pipe(
          map(() => true),
          catchError(() => of(false)),
        );
  }
}
