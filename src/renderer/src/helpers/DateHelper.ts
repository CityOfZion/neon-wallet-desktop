export class DateHelper {
  static timeToDate = (unixTime: number): string => {
    const date = new Date(unixTime * 1000)
    return date.toLocaleDateString()
  }

  static timeToHour = (unixTime: number): string => {
    const date = new Date(unixTime * 1000)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  static unixToDateHour = (unixTime: number): string => {
    return `${this.timeToDate(unixTime)} ${this.timeToHour(unixTime)}`
  }

  static getNowUnix = (): number => {
    return Date.now()
  }

  static getCurrentFullDateString = () => {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
    const day = currentDate.getDate().toString().padStart(2, '0')
    return `${year}${month}${day}`
  }
}
