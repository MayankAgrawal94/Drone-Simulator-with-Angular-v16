import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, interval, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy  {
  title:string = "Drone Simulation"

  G_API_KEY:string = environment.G_API_KEY

  G_MAP_API:string = `https://maps.googleapis.com/maps/api/js?key=${this.G_API_KEY}`

  MARKER_ICON:string = "assets/drone.png"

  latLngForm:FormGroup;

  private droneUpdateSubscription: Subscription = new Subscription();

  apiLoaded: Observable<boolean>;

  simulatePaused:boolean = false
  
  progressCount:number = 0;
  numSteps:number = 100 // Number of intermediate positions
  time:number = 0 // in milliseconds

  // Static start position for the Drone
  positionA: google.maps.LatLngLiteral = {
    lat: 28.522308592619723,
    lng: 77.39657243970184
  }

  positionB: google.maps.LatLngLiteral = {
    lat: 28.52387343192279,
    lng: 77.39296719927432
  }

  // Setting default map view
  mainOptions: google.maps.MapOptions = {
    center: this.positionA,
    zoom: 2
  };

  polylineOptions = {
    visible: true, //Whether this polyline is visible on the map. @defaultValue - true
    strokeColor: '#6d80b9c7',
    // strokeOpacity: 4 ,// The stroke opacity between 0.0 and 1.0.
    // strokeWeight: 4,  // The stroke width in pixels.
    // path: [
    //   {lat: 28.522308592619723, lng: 77.39657243970184},
    //   {lat: 28.52387343192279, lng: 77.39296719927432},
    // ]
    // editable: false,
    geodesic: true
  }
  polyVertices: google.maps.LatLngLiteral[] = [];

  markerPositions: google.maps.LatLngLiteral = this.positionA
  markerOption: google.maps.MarkerOptions = {
    draggable: false,
    // icon: "assets/drone.png",
    label: 'S',
    position: this.markerPositions,
    // animation: google.maps.Animation.BOUNCE,
  };
  markerOptions: google.maps.MarkerOptions [] = [
    this.markerOption
  ]

  constructor(httpClient: HttpClient,formBuilder: FormBuilder) {

    this.apiLoaded = httpClient.jsonp(`${this.G_MAP_API}`, 'callback')
        .pipe(
          map(() => true),
          catchError(() => of(false)),
        );

    this.latLngForm = formBuilder.group({
      latitude: [null, [Validators.required]],
      longitude: [null, [Validators.required]],
      time: [null, [Validators.required,Validators.min(0)]],
    });
  }

  addMarker(event: google.maps.MapMouseEvent) {
    // if(event && event.latLng)
    //   console.log( "event =>", event, event.latLng.toJSON())
  }

  onSimulate(){
    this.positionB = {
      lat: this.latLngForm.value.latitude,
      lng: this.latLngForm.value.longitude
    }
    this.time = (this.latLngForm.value.time * 1000) / 100

    this.latLngForm.disable();

    this.polyVertices = [
      this.positionA,
      this.positionB
    ]

    this.updateMarker(this.positionB.lat, this.positionB.lng, 2, false, 'E')

    this.startDroneUpdates();
  }

  startDroneUpdates() {
    this.droneUpdateSubscription = interval(this.time).subscribe(() => {
      if( this.progressCount <= this.numSteps){
        const fraction = this.progressCount / this.numSteps;
        const intermediateLat = this.positionA.lat + fraction * (this.positionB.lat - this.positionA.lat);
        const intermediateLng = this.positionA.lng + fraction * (this.positionB.lng - this.positionA.lng);
        this.updateMarker(intermediateLat, intermediateLng, 1, true)
        
        this.progressCount++;
      } else {
        this.droneUpdateSubscription.unsubscribe();
        this.progressCount--;   
      }
    });
  }

  updateMarker(
    lat:number, lng:number, index:number, 
      icon:boolean = false, lable:string = ''
    ){
      this.markerPositions = {lat,lng} 
      this.markerOptions[index] = {
          draggable: false,
          icon: icon ? this.MARKER_ICON : '',
          label: lable,
          position: this.markerPositions,
          zIndex: icon ? 1111 : 0
      }
  }

  onPause(){
    this.simulatePaused = true
    this.droneUpdateSubscription.unsubscribe();
  }

  onResume(){
    this.simulatePaused = false
    this.startDroneUpdates();
  }

  onReset(){
    this.simulatePaused = false
    this.latLngForm.reset();
    this.latLngForm.enable();
    this.markerOptions[1] = {}
    this.markerOptions[2] = {}
    this.polyVertices = []
    this.progressCount = 0
    this.droneUpdateSubscription.unsubscribe();
  }

  ngOnDestroy() {
    // Unsubscribe from the subscription when the component is destroyed
    if (this.droneUpdateSubscription) {
      this.droneUpdateSubscription.unsubscribe();
    }
  }
}
