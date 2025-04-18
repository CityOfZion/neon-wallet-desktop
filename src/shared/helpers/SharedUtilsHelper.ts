export class SharedUtilsHelper {
  static sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
