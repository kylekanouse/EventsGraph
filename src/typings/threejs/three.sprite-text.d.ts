declare class SpriteText extends THREE.Sprite {
  constructor(
    text?: string,
    textHeight?:number,
    color?: string
  );
  

  get text(): string;
  set text(text: string);
  get textHeight(): number;
  set textHeight(height: number);
  get color(): string;
  set color(color:string);
  get backgroundColor(): string;
  set backgroundColor(color:string);
  get fontFace(): string;
  set fontFace(fontFace: string);
  get fontSize(): number;
  set fontSize(fontSize: number);
  get fontWeight(): string;
  set fontWeight(fontWeight: string);
  get padding(): number;
  set padding(fontSize: number);
  get borderWidth(): number;
  set borderWidth(fontSize: number);
  get borderColor(): string;
  set borderColor(color:string);
  get strokeWidth(): number;
  set strokeWidth(strokeWidth: number);
  get strokeColor(): string;
  set strokeColor(strokeColor: string);
};