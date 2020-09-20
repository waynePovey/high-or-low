import { Injectable } from '@angular/core';
import { AdvancedDynamicTexture, Button, InputText, TextBlock } from '@babylonjs/gui';
import { GuiModel } from '../models/GuiModel';

@Injectable({
  providedIn: 'root'
})
export class GuiService {
  public ui: AdvancedDynamicTexture;

  constructor() {}

  public createGui(): void {
    this.ui = AdvancedDynamicTexture.CreateFullscreenUI('UI');
  }

  public createButton(model: GuiModel): Button {
    const button = Button.CreateSimpleButton(model.name, model.text);
    button.top = model.top;
    button.left = model.left;
    button.width = model.width;
    button.height = model.height;
    button.color = model.color;
    button.fontFamily = model.fontFamily;
    button.background = model.backgroundColor;
    return button;
  }

  public createTextBlock(model: GuiModel): TextBlock {
    const textBlock = new TextBlock();
    textBlock.name = model.name;
    textBlock.text = model.text;
    textBlock.top = model.top;
    textBlock.left = model.left;
    textBlock.width = model.width;
    textBlock.height = model.height;
    textBlock.color = model.color;
    textBlock.fontFamily = model.fontFamily;
    textBlock.fontSize = model.fontSize;
    textBlock.textHorizontalAlignment = model.textAlign;
    return textBlock;
  }

  public createInputBlock(model: GuiModel): InputText {
    const inputBlock = new InputText();
    inputBlock.name = model.name;
    inputBlock.text = model.text;
    inputBlock.top = model.top;
    inputBlock.left = model.left;
    inputBlock.width = model.width;
    inputBlock.height = model.height;
    inputBlock.color = model.color;
    inputBlock.fontFamily = model.fontFamily;
    inputBlock.onFocusSelectAll = true;
    return inputBlock;
  }
}
