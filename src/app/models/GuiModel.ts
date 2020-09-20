export class GuiModel {
    public name: string;
    public text: string;
    public top: string;
    public left: string;
    public width: number;
    public height: number;
    public color: string;
    public fontFamily: string;
    public backgroundColor: string;
    public fontSize: number;
    public textAlign: number;

    constructor(init?: Partial<GuiModel>) {
        Object.assign(this, init);
    }
}