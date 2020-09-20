import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  Engine,
  HemisphericLight,
  Scene,
  SceneLoader,
  UniversalCamera,
  Vector3,
  Animation,
  AnimationGroup,
  AssetContainer,
  DynamicTexture,
  StandardMaterial,
  PointLight, GPUParticleSystem, ParticleSystem, Texture, Color4
} from '@babylonjs/core';
import { GUI3DManager } from '@babylonjs/gui';
import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import Utils from '@common/utils';
import { GuiService } from '@services/gui.service';
import { GuiModel } from '@models/GuiModel';
import { SceneService } from '@services/scene.service';
import { HighScoreModel } from '@models/HighScoreModel';

const MAX_CARDS = 10;

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss']
})
export class GameBoardComponent implements OnInit, AfterViewInit {

  public initialised = false;
  public loading = true;
  public engine: Engine;
  public scene: Scene;
  public camera: UniversalCamera;
  public manager: GUI3DManager;
  public flipCard: AnimationGroup;
  public removeCard: AnimationGroup;
  public cardContainer: AssetContainer;
  public currentCardIndex = 0;
  public score = 0;
  public highScores: HighScoreModel[] = [];
  public previousNumber = 0;
  public newNumber = 0;
  public gameOver = false;
  public won = false;
  public bLower: any;
  public bHigher: any;
  public bStart: any;
  public bReset: any;
  public tScore: any;
  public tHighScore: any;
  public tHSName: any;
  public tHSScore: any;
  public tHSTime: any;
  public tTime: any;
  public tGameOver: any;
  public tGameWon: any;
  public iName: any;
  public time = 0;
  public interval: any;
  public fileReader: FileReader;
  public lSprinkles: ParticleSystem | GPUParticleSystem;
  public rSprinkles: ParticleSystem | GPUParticleSystem;
  public playerName: string;

  @ViewChild('rCanvas', {static: true})
  canvasRef: ElementRef<HTMLCanvasElement>;

  constructor(
    private ngZone: NgZone,
    private guiService: GuiService,
    private sceneService: SceneService) {}

    public ngOnInit(): void {
      this.getHighScores();
      setTimeout(() => {
        this.initialised = true;
      }, 500);
    }

    public async ngAfterViewInit() {
    this.engine = new Engine(this.canvasRef.nativeElement, true);
    this.scene = new Scene(this.engine);
    this.createGui();
    this.createLighting();
    this.createCamera();

    this.sceneService.createSkybox(this.scene);
    this.cardContainer = await SceneLoader.LoadAssetContainerAsync('assets/models/floor/', 'floor.babylon', this.scene);
    this.cardContainer.instantiateModelsToScene(name => 'floor');
    this.cardContainer = await SceneLoader.LoadAssetContainerAsync('assets/models/card/', 'card.babylon', this.scene);
    this.cardContainer.instantiateModelsToScene(name => 'card' + this.currentCardIndex);
    this.scene.getMeshByName('floor').position = new Vector3(0, -1, 0);
    this.animateCardFlip(this.currentCardIndex);
    this.animateRemoveCard(this.currentCardIndex, true);
    this.updateNumber();
    this.addCardNumber();
    this.congratsParticles();

    // // INSPECTOR FOR DEV
    // window.addEventListener('keydown', (ev) => {
    //   if (ev.ctrlKey && ev.key === 'i') {
    //     if (this.scene.debugLayer.isVisible()) {
    //       this.scene.debugLayer.hide();
    //     } else {
    //       this.scene.debugLayer.show();
    //     }
    //   }
    // });

    this.startEngine();
    this.updateScene();

    setTimeout(() => {
      this.initialised = false;
      this.loading = false;
    }, 2000);
  }

  public startEngine(): void {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('resize', () => this.engine.resize());
      this.engine.runRenderLoop(() => {
        this.scene.render();
      });
    });
  }

  private updateScene(): void {
    this.scene.registerBeforeRender(() => {
      this.tScore.text = 'SCORE\n' + this.score;
      this.tTime.text = 'TIME\n' + this.time;
      this.tHSName.text = `NAME\n${this.highScores[0].name}\n${this.highScores[1].name}\n${this.highScores[2].name}`;
      this.tHSScore.text = `POINTS\n${this.highScores[0].score}\n${this.highScores[1].score}\n${this.highScores[2].score}`;
      this.tHSTime.text = `TIME\n${this.highScores[0].time}\n${this.highScores[1].time}\n${this.highScores[2].time}`;
    });
  }

  public createCamera(): void {
    this.camera = new UniversalCamera('camera', new Vector3(0, 0, 0), this.scene);
    this.camera.attachControl(this.canvasRef.nativeElement, true);
    this.camera.position = new Vector3(0, 2, 8);
    this.camera.lockedTarget = new Vector3(0, 1.5, 0);
  }

  public createLighting(): void {
    new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
    new PointLight('pointLight', new Vector3(0, 10, 10), this.scene);
  }

  public createGui(): void {
    this.guiService.createGui();
    const bWidth = 0.14;
    const bHeight = 0.06;
    const bLeft = '20%';
    const bTop = '40%';
    const bText = 'white';
    const bColor = '#034687';
    const bFont = 'Open Sans Bold';

    this.iName = this.guiService.createInputBlock(new GuiModel({
      name: 'enterName',
      text: 'Enter name',
      top: '10%',
      left: '0px',
      width: 0.16,
      height: 0.06,
      color: bText,
      fontFamily: 'black',
    }));

    this.tTime = this.guiService.createTextBlock(new GuiModel({
      name: 'time',
      text: 'TIME\n' + this.time,
      top: '-40%',
      left: '0px',
      width: 0.1,
      height: 0.1,
      color: 'black',
      fontFamily: bFont,
      fontSize: 30,
      textAlign: 2
    }));

    this.tScore = this.guiService.createTextBlock(new GuiModel({
      name: 'score',
      text: 'SCORE\n' + this.score,
      top: '-40%',
      left: '-40%',
      width: 0.1,
      height: 0.1,
      color: 'black',
      fontFamily: bFont,
      fontSize: 30,
      textAlign: 2
    }));

    this.tHighScore = this.guiService.createTextBlock(new GuiModel({
      name: 'highScores',
      text: 'HIGH SCORES',
      top: '-43%',
      left: '35%',
      width: 0.2,
      height: 0.1,
      color: 'black',
      fontFamily: bFont,
      fontSize: 30,
      textAlign: 2
    }));

    this.tHSName = this.guiService.createTextBlock(new GuiModel({
      name: 'hsName',
      text: `NAME\n${this.highScores[0].name}\n${this.highScores[1].name}\n${this.highScores[2].name}`,
      top: '-32%',
      left: '27%',
      width: 0.1,
      height: 0.3,
      color: 'black',
      fontFamily: bFont,
      fontSize: 20,
      textAlign: 2
    }));

    this.tHSScore = this.guiService.createTextBlock(new GuiModel({
      name: 'hsName',
      text: `POINTS\n${this.highScores[0].score}\n${this.highScores[1].score}\n${this.highScores[2].score}`,
      top: '-32%',
      left: '35%',
      width: 0.1,
      height: 0.3,
      color: 'black',
      fontFamily: bFont,
      fontSize: 20,
      textAlign: 2
    }));

    this.tHSTime = this.guiService.createTextBlock(new GuiModel({
      name: 'hsName',
      text: `TIME\n${this.highScores[0].time}\n${this.highScores[1].time}\n${this.highScores[2].time}`,
      top: '-32%',
      left: '43%',
      width: 0.1,
      height: 0.3,
      color: 'black',
      fontFamily: bFont,
      fontSize: 20,
      textAlign: 2
    }));

    this.bStart = this.guiService.createButton(new GuiModel({
      name: 'start',
      text: 'START GAME',
      top: '40%',
      left: '0px',
      width: 0.16,
      height: 0.06,
      color: bText,
      fontFamily: bFont,
      backgroundColor: bColor
    }));

    this.bReset = this.guiService.createButton(new GuiModel({
      name: 'playAgain',
      text: 'PLAY AGAIN?',
      top: '40%',
      left: '0px',
      width: 0.16,
      height: 0.06,
      color: bText,
      fontFamily: bFont,
      backgroundColor: bColor
    }));

    this.bHigher = this.guiService.createButton(new GuiModel({
      name: 'higher',
      text: 'HIGHER',
      top: bTop,
      left: bLeft,
      width: bWidth,
      height: bHeight,
      color: bText,
      fontFamily: bFont,
      backgroundColor: bColor
    }));

    this.bLower = this.guiService.createButton(new GuiModel({
      name: 'lower',
      text: 'LOWER',
      top: bTop,
      left: '-' + bLeft,
      width: bWidth,
      height: bHeight,
      color: bText,
      fontFamily: bFont,
      backgroundColor: bColor
    }));

    this.tGameOver = this.guiService.createTextBlock(new GuiModel({
      name: 'gameOver',
      text: 'GAME OVER',
      top: '-20%',
      left: '0px',
      width: 0.5,
      height: 0.2,
      color: 'black',
      fontFamily: bFont,
      fontSize: 100,
      textAlign: 2
    }));

    this.tGameWon = this.guiService.createTextBlock(new GuiModel({
      name: 'gameWon',
      text: 'CONGRATULATIONS!\nYOU WIN',
      top: '-20%',
      left: '0px',
      width: 0.6,
      height: 0.3,
      color: 'black',
      fontFamily: bFont,
      fontSize: 80,
      textAlign: 2
    }));

    this.bLower.isVisible = false;
    this.bHigher.isVisible = false;
    this.bReset.isVisible = false;
    this.tGameOver.isVisible = false;
    this.tGameWon.isVisible = false;
    this.iName.isVisible = false;

    this.bStart.onPointerUpObservable.add(() => {
      this.start();
    });

    this.bReset.onPointerUpObservable.add(() => {
      this.reset();
    });

    this.bLower.onPointerUpObservable.add(() => {
      this.goLower();
    });

    this.bHigher.onPointerUpObservable.add(() => {
      this.goHigher();
    });

    this.iName.onBlurObservable.add(() => {
      this.saveHighScore();
      this.iName.isVisible = false;
      this.bReset.isVisible = true;
      this.iName.text = 'Enter name';
    });
    this.guiService.ui.addControl(this.tHSName);
    this.guiService.ui.addControl(this.tHSScore);
    this.guiService.ui.addControl(this.tHSTime);
    this.guiService.ui.addControl(this.iName);
    this.guiService.ui.addControl(this.tTime);
    this.guiService.ui.addControl(this.tScore);
    this.guiService.ui.addControl(this.tHighScore);
    this.guiService.ui.addControl(this.tGameOver);
    this.guiService.ui.addControl(this.tGameWon);
    this.guiService.ui.addControl(this.bStart);
    this.guiService.ui.addControl(this.bLower);
    this.guiService.ui.addControl(this.bHigher);
    this.guiService.ui.addControl(this.bReset);
  }

  public animateCardFlip(index: number): void {
    this.flipCard = new AnimationGroup('flipCard');

    const cardRotX = new Animation('cardRotX', 'rotation.x', 30, Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT);

    const rotXKeys = [];

    rotXKeys.push({
        frame: 0,
        value: Utils.degreesToRads(0)
    });

    rotXKeys.push({
        frame: 60,
        value: Utils.degreesToRads(90)
    });

    cardRotX.setKeys(rotXKeys);

    const cardPosY = new Animation('cardPosY', 'position.y', 30, Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT);

    const posYKeys = [];

    posYKeys.push({
      frame: 0,
      value: 0
    });

    posYKeys.push({
      frame: 40,
      value: 1.5
    });

    cardPosY.setKeys(posYKeys);

    const cardPosZ = new Animation('cardPosZ', 'position.z', 30, Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT);

    const posZKeys = [];

    posZKeys.push({
      frame: 0,
      value: 0
    });

    posZKeys.push({
      frame: 40,
      value: 1.5
    });

    cardPosZ.setKeys(posZKeys);

    const cardRotY = new Animation('cardRotY', 'rotation.y', 30, Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT);

    const rotYKeys = [];

    rotYKeys.push({
      frame: 60,
      value: 0
    });

    rotYKeys.push({
      frame: 90,
      value: Utils.degreesToRads(180)
    });

    cardRotY.setKeys(rotYKeys);
    this.flipCard.addTargetedAnimation(cardPosY, this.scene.getMeshByName('card' + index));
    this.flipCard.addTargetedAnimation(cardPosZ, this.scene.getMeshByName('card' + index));
    this.flipCard.addTargetedAnimation(cardRotY, this.scene.getMeshByName('card' + index));
    this.flipCard.addTargetedAnimation(cardRotX, this.scene.getMeshByName('card' + index));

    this.flipCard.normalize(0, 100);
    this.flipCard.speedRatio = 5;
  }

  public animateRemoveCard(index: number, higher: boolean): void {
    this.removeCard = new AnimationGroup('removeCard');

    const cardPosX = new Animation('cardPosX', 'position.x', 30, Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT);

    const posXKeys = [];

    posXKeys.push({
        frame: 0,
        value: 0
    });

    posXKeys.push({
        frame: 60,
        value: higher ? -10 : 10
    });

    cardPosX.setKeys(posXKeys);
    this.removeCard.addTargetedAnimation(cardPosX, this.scene.getMeshByName('card' + index));

    this.removeCard.normalize(0, 100);
    this.removeCard.speedRatio = 5;
  }

  public newCard(higher: boolean): void {
    this.animateRemoveCard(this.currentCardIndex, higher);
    this.removeCard.play(true);
    setTimeout(() => {
      this.scene.getMeshByName('card' + this.currentCardIndex).dispose();
      this.currentCardIndex++;
      this.cardContainer.instantiateModelsToScene(name => 'card' + this.currentCardIndex);
      this.addCardNumber();
      this.animateCardFlip(this.currentCardIndex);
      this.flipCard.play();
    }, 1000);
  }

  public updateNumber(): void {
    this.previousNumber = this.newNumber;
    this.newNumber = Utils.uniqueRandNumInRange(this.previousNumber, 1, 100);
  }

  public start(): void {
    this.newNumber = Utils.uniqueRandNumInRange(this.previousNumber, 1, 100);
    this.flipCard.play(true);
    this.bStart.isVisible = false;
    this.bLower.isVisible = true;
    this.bHigher.isVisible = true;
    this.startTimer();
  }

  public reset(): void {
    this.bReset.isVisible = false;
    setTimeout(() => {
      this.startTimer();
      this.updateNumber();
      this.scene.getMeshByName('card' + this.currentCardIndex).dispose();
      this.currentCardIndex = 0;
      this.cardContainer.instantiateModelsToScene(name => 'card' + this.currentCardIndex);
      this.addCardNumber();
      this.animateCardFlip(this.currentCardIndex);
      this.flipCard.play();
      this.score = 0;
      this.time = 0;
      this.lSprinkles.stop();
      this.rSprinkles.stop();
      this.bStart.isVisible = false;
      this.bLower.isVisible = true;
      this.bHigher.isVisible = true;
      this.tGameOver.isVisible = false;
      this.tGameWon.isVisible = false;
      this.getHighScores();
    }, 1000);
  }

  public goHigher(): void{
      this.updateNumber();
      this.newCard(true);
      setTimeout(() => {
        if (this.newNumber > this.previousNumber) {
          this.score++;
        } else {
          this.gameLost(true);
        }

        if (this.score >= MAX_CARDS) {
          this.gameWon(true);
        }
      }, 1000);
  }

  public goLower(): void {
      this.updateNumber();
      this.newCard(false);
      setTimeout(() => {
        if (this.newNumber < this.previousNumber) {
          this.score++;
        } else {
          this.gameLost(false);
        }

        if (this.score >= MAX_CARDS) {
          this.gameWon(false);
        }
      }, 1000);
  }

  public gameLost(higher: boolean): void {
    this.stopTimer();
    this.bLower.isVisible = false;
    this.bHigher.isVisible = false;
    setTimeout(() => {
      this.tGameOver.isVisible = true;
      this.iName.isVisible = true;
      this.animateRemoveCard(this.currentCardIndex, higher);
      this.removeCard.play(true);
    }, 1500);
  }

  public gameWon(higher: boolean): void {
    this.stopTimer();
    this.bLower.isVisible = false;
    this.bHigher.isVisible = false;
    setTimeout(() => {
      this.tGameWon.isVisible = true;
      this.bReset.isVisible = true;
      this.iName.isVisible = true;
      this.lSprinkles.start();
      this.rSprinkles.start();
      this.animateRemoveCard(this.currentCardIndex, higher);
      this.removeCard.play(true);
    }, 1500);
  }

  public startTimer(): void {
    this.interval = setInterval(() => {
      this.time++;
    }, 1000);
  }

  public stopTimer(): void {
    clearInterval(this.interval);
  }

  public addCardNumber(): void {
    const fontType = 'Open Sans Bold';
    const size = 5;

    const planeWidth = 8;
    const planeHeight = 12;

    const DTWidth = planeWidth * 60;
    const DTHeight = planeHeight * 60;

    const text = '' + this.newNumber;

    const dynamicTexture = new DynamicTexture('DynamicTexture', {width: DTWidth, height: DTHeight}, this.scene, false);

    const ctx = dynamicTexture.getContext();
    ctx.font = size + 'px ' + fontType;
    const textWidth = ctx.measureText(text).width;

    const ratio = textWidth / size;

    const fontSize = Math.floor(DTWidth / (ratio * 4));
    const font = fontSize + 'px ' + fontType;

    dynamicTexture.drawText(text, null, null, font, 'white', '#034687', true);

    const mat = new StandardMaterial('mat', this.scene);
    mat.diffuseTexture = dynamicTexture;
    this.scene.getMeshByID('Clone of face.face').material = mat;
  }

  public congratsParticles(): void {
    this.lSprinkles = GPUParticleSystem.IsSupported
      ? new GPUParticleSystem('congrats', {capacity: 2000}, this.scene)
      : new ParticleSystem('congrats', 500, this.scene);

    this.lSprinkles.minEmitBox = new Vector3(0, 0, 0);
    this.lSprinkles.maxEmitBox = new Vector3(0, 0, 0);
    this.lSprinkles.particleTexture = new Texture('assets/textures/sprinkles/sprinkles.jpg', this.scene);
    this.lSprinkles.direction1 = new Vector3(-0.1, 0.5, 0);
    this.lSprinkles.direction2 = new Vector3(0.1, 0.5, 0);
    this.lSprinkles.color1 = new Color4(1, 0, 0, 1.0);
    this.lSprinkles.color2 = new Color4(0, 0, 1, 1.0);
    this.lSprinkles.colorDead = new Color4(0, 1, 0, 1.0);
    this.lSprinkles.emitRate = 80;
    this.lSprinkles.minLifeTime = 1;
    this.lSprinkles.maxLifeTime = 1.5;
    this.lSprinkles.minEmitPower = 12;
    this.lSprinkles.maxEmitPower = 20;
    this.lSprinkles.minSize = 0.1;
    this.lSprinkles.maxSize = 0.3;
    this.lSprinkles.updateSpeed = 0.005;
    this.lSprinkles.emitter = new Vector3(5, -1, 0);
    this.lSprinkles.gravity = new Vector3(0, -9.81, 0);

    this.rSprinkles = GPUParticleSystem.IsSupported
      ? new GPUParticleSystem('congrats', {capacity: 2000}, this.scene)
      : new ParticleSystem('congrats', 500, this.scene);

    this.rSprinkles.minEmitBox = new Vector3(0, 0, 0);
    this.rSprinkles.maxEmitBox = new Vector3(0, 0, 0);
    this.rSprinkles.particleTexture = new Texture('assets/textures/sprinkles/sprinkles.jpg', this.scene);
    this.rSprinkles.direction1 = new Vector3(-0.1, 0.5, 0);
    this.rSprinkles.direction2 = new Vector3(0.1, 0.5, 0);
    this.rSprinkles.color1 = new Color4(1, 0, 0, 1.0);
    this.rSprinkles.color2 = new Color4(0, 0, 1, 1.0);
    this.rSprinkles.colorDead = new Color4(0, 1, 0, 1.0);
    this.rSprinkles.emitRate = 80;
    this.rSprinkles.minLifeTime = 1;
    this.rSprinkles.maxLifeTime = 1.5;
    this.rSprinkles.minEmitPower = 12;
    this.rSprinkles.maxEmitPower = 20;
    this.rSprinkles.minSize = 0.1;
    this.rSprinkles.maxSize = 0.3;
    this.rSprinkles.updateSpeed = 0.005;
    this.rSprinkles.emitter = new Vector3(-5, -1, 0);
    this.rSprinkles.gravity = new Vector3(0, -9.81, 0);
  }

  public saveHighScore(): void {
    this.playerName = this.iName.text;
    this.highScores.push({
      name: this.playerName,
      score: this.score,
      time: this.time
    } as HighScoreModel);

    this.highScores = this.highScores.sort((a, b) => {
      return b.score - a.score  ||  a.time - b.time;
    });

    const fileString = JSON.stringify(this.highScores);
    localStorage.setItem('highScores', fileString);
  }

  public getHighScores(): void {
    const initHS = [];
    for(let i = 0; i < 3; i++) {
      initHS.push({
        name: 'AAA',
        score: 0,
        time: 0
      });
    }
    this.highScores = JSON.parse(localStorage.getItem('highScores')) || initHS;
  }
}
