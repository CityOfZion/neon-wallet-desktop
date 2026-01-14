import * as dateFns from 'date-fns'

import type {
  TExportTransactionsHelperCalculateDateFromSelectionMaxOneYearResponse,
  TExportTransactionsHelperCalculateDateToSelectionMaxOneYearResponse,
} from '@shared/types/helpers'

export class ExportTransactionsHelper {
  static calculateDateFromSelectionMaxOneYear = (
    dateFrom: Date,
    dateTo: Date
  ): TExportTransactionsHelperCalculateDateFromSelectionMaxOneYearResponse => {
    const newDateFrom = dateFns.startOfDay(dateFrom)
    const dateSelection: TExportTransactionsHelperCalculateDateFromSelectionMaxOneYearResponse = {
      dateFrom: newDateFrom,
    }

    if (dateFns.isAfter(newDateFrom, dateTo)) {
      const dateNow = new Date()
      const newDateTo = dateFns.endOfDay(dateFns.min([dateNow, dateFns.add(newDateFrom, { weeks: 1 })]))

      dateSelection.dateTo = dateFns.isSameDay(dateNow, newDateTo) ? dateNow : newDateTo

      return dateSelection
    }

    if (dateFns.differenceInYears(dateTo, newDateFrom) > 0) {
      const dateNow = new Date()
      const newDateTo = dateFns.endOfDay(dateFns.add(newDateFrom, { years: 1, days: -1 }))

      dateSelection.dateTo = dateFns.isSameDay(dateNow, newDateTo) ? dateNow : newDateTo
    }

    return dateSelection
  }

  static calculateDateToSelectionMaxOneYear = (
    dateTo: Date,
    dateFrom: Date
  ): TExportTransactionsHelperCalculateDateToSelectionMaxOneYearResponse => {
    const dateNow = new Date()
    const newDateTo = dateFns.isSameDay(dateNow, dateTo) ? dateNow : dateFns.endOfDay(dateTo)
    const dateSelection: TExportTransactionsHelperCalculateDateToSelectionMaxOneYearResponse = { dateTo: newDateTo }

    if (dateFns.isBefore(newDateTo, dateFrom)) {
      dateSelection.dateFrom = dateFns.startOfDay(dateFns.sub(newDateTo, { weeks: 1 }))

      return dateSelection
    }

    if (dateFns.differenceInYears(newDateTo, dateFrom) > 0) {
      dateSelection.dateFrom = dateFns.startOfDay(dateFns.sub(newDateTo, { years: 1, days: -1 }))
    }

    return dateSelection
  }
}
