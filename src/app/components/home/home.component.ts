import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoutePath } from '@common/routes';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public initialised = false;

  constructor(private router: Router) { }

  public ngOnInit(): void {
    setTimeout(() => {
      this.initialised = true;
    }, 500);
  }

  public play(): void {
    this.initialised = false;
    setTimeout(() => {
      this.router.navigateByUrl(RoutePath.GAME_BOARD);
    }, 500);
  }
}
