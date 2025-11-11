export class Widget {
  public id: string = '';
  public name: string = '';
  public description: string = '';
  public externalUrl: string | null = null;
  public isPinned: boolean = false;
  public isInternal: boolean = false;
  public sortOrder: number = 0;
  public enabled: boolean = true;
  public active: boolean = true;

  constructor(widget: Partial<Widget> = {}) {
    Object.assign(this, widget);
  }
}
