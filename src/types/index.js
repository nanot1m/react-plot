// @flow

export type StockInfo = {
  date: Date,
  value: number
}

export type PlotPoint = {
  x: number,
  y: number
}

export type ReactNode = number | string | React$Element<*>
