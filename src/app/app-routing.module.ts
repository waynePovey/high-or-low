import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoutePath } from './common/routes';
import { HomeComponent } from '@components/home/home.component';
import { GameBoardComponent } from '@scenes/game-board/game-board.component';

const routes: Routes = [
  { path: RoutePath.HOME, component: HomeComponent },
  { path: RoutePath.GAME_BOARD, component: GameBoardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
