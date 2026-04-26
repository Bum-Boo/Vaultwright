export class VaultwrightError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VaultwrightError";
  }
}

export class PathSafetyError extends VaultwrightError {
  constructor(message: string) {
    super(message);
    this.name = "PathSafetyError";
  }
}

export class LimitError extends VaultwrightError {
  constructor(message: string) {
    super(message);
    this.name = "LimitError";
  }
}
