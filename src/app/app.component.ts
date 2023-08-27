import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment.development';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Drone-Simulator-with-Angular-v16';

  G_API_KEY:string = environment.G_API_KEY

  G_MAP_API:string = `https://maps.googleapis.com/maps/api/js?key=${this.G_API_KEY}`

  apiLoaded: Observable<boolean>;

  center: google.maps.LatLngLiteral = {lat: 24, lng: 12};
  zoom = 1;

  vertices: google.maps.LatLngLiteral[] = [
    {lat: 13, lng: 13},
    {lat: -13, lng: 0},
    {lat: 13, lng: -13},
  ];

  markerOptions: google.maps.MarkerOptions = {draggable: false};
  markerPositions: google.maps.LatLngLiteral[] = [];

  constructor(httpClient: HttpClient) {

    this.apiLoaded = httpClient.jsonp(this.G_MAP_API, 'callback')
        .pipe(
          map(() => true),
          catchError(() => of(false)),
        );
  }

  addMarker(event: google.maps.MapMouseEvent) {
    if(event && event.latLng)
      this.markerPositions.push(event.latLng.toJSON());
  }
}
