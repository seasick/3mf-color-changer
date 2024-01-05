class ProgressPromise<T> extends Promise<T> {
  progress: number;

  constructor(executor) {
    super((resolve, reject) => {
      executor(resolve, reject, (progress) => {
        this.progress = progress;
      });
    });

    this.progress = 0;
  }
}

export default ProgressPromise;
