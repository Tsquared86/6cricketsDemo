import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, importProvidersFrom } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { TimeService } from './services/time.service';
import { appConfig } from './app.config';
import { Subscription, interval } from 'rxjs';

interface Camera {
  name: string;
  distanceToTarget: number;
  lightIntensity: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'trial';
  time = '';
  secondsLeft = 300;
  timer: string = '00:00';
  private timerSubscription: Subscription | undefined;

  constructor(private timeService: TimeService) {}

  ngOnInit() {
    console.log('AppComponent ngOnInit');

    //Since I was not given an endpoint I hardcoded the totalSeconds value, but the variable would be used like this.

    this.timeService.getTime().subscribe((data) => {
      // this.secondsLeft = data.secondsLeft;
    });
    //this would be in the subscribe brackets above
    this.startTimer();

    //It was not specified which parameter was most important so my logic was to determinge which 2 cameras were closest.
    // Of those 2, whichever had the highest light intensity was the best camera
    const cameras: Camera[] = [
      { name: 'Camera A', distanceToTarget: 10, lightIntensity: 80 },
      { name: 'Camera B', distanceToTarget: 8, lightIntensity: 90 },
      { name: 'Camera C', distanceToTarget: 12, lightIntensity: 85 },
    ];

    const bestCamera = this.findBestCamera(cameras);
    if (bestCamera) {
      console.log(`This is the best camera: ${bestCamera.name}`);
    } else {
      console.log('No cameras were found found, check the connection');
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  startTimer() {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.secondsLeft > 0) {
        this.secondsLeft--;
        this.timer = this.secondsConvert(this.secondsLeft);
      } else {
        this.stopTimer();
      }
    });
  }

  stopTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  secondsConvert(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(val: number): string {
    return val < 10 ? '0' + val : val.toString();
  }

  //second function your requested.
  findBestCamera(cameras: Camera[]): Camera | undefined {
    if (cameras.length === 0) {
      return undefined;
    }

    //first we find the closest camera
    cameras.sort((a, b) => a.distanceToTarget - b.distanceToTarget);

    const closestCameras = cameras.slice(0, 2);
    //now we find which one has the highest light intensity because a close dark camera is no good
    closestCameras.sort((a, b) => b.lightIntensity - a.lightIntensity);

    return closestCameras[0];
  }
}
