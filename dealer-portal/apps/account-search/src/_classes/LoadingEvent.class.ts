export class LoadingEvent {
  public resultCount: number;
  public resultLoaded: boolean;
  public recentSource: boolean;

  constructor(resultCount: number = 0, resultLoaded: boolean = false, source: boolean = true) {
    this.resultCount = resultCount;
    this.resultLoaded = resultLoaded;
    this.recentSource = source;
  }
}
