// @flow

import React from 'react'
import addMonth from 'date-fns/add_months'
import startOfMonth from 'date-fns/start_of_month'
import isSameDay from 'date-fns/is_same_day'
import format from 'date-fns/format'
import ruLocale from 'date-fns/locale/ru'

import Plot, { Line, Axis } from '../Plot'
import Popup from '../Popup'

import type { StockInfo, PlotPoint } from '../../types'

import styles from './StockPlot.css'

type Props = {
  /**
   * Array of StockInfo for vizualization
   */
  data: Array<StockInfo[]>,

  /**
   * Plot width
   */
  width: number,

  /**
   * Plot height
   */
  height: number
}

type State = {|
  info: ?{
    id: string,
    point: PlotPoint,
    position: { clientX: number, clientY: number }
  }
|}

const DAY_MILLISECONDS = 24 * 60 * 60 * 1000

const COLORS = [
  '#3F51B5',
  '#2196F3',
  '#0097A7',
  '#F44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7'
]

/**
 * Plot wrapper for showing stock rates in some period
 */
class StockPlot extends React.Component {
  static defaultProps = {
    width: 800,
    height: 400
  }

  props: Props

  state: State = { info: null }

  render() {
    const lines = []
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const lineData of this.props.data) {
      const points = []
      lineData.forEach(x => {
        const point = {
          x: x.date.getTime() / DAY_MILLISECONDS,
          y: x.value
        }
        minX = point.x < minX ? point.x : minX
        maxX = point.x > maxX ? point.x : maxX
        minY = point.y < minY ? point.y : minY
        maxY = point.y > maxY ? point.y : maxY
        points.push({ x: point.x, y: point.y })
      })
      lines.push(points)
    }

    minX += -20
    maxX += 20

    return (
      <div className={styles.root} onMouseLeave={this._handleMouseLeave}>
        <Plot
          width={this.props.width}
          height={this.props.height}
          onPointHover={this._handlePointHover}
        >
          <Axis
            position="bottom"
            min={minX}
            max={maxX}
            tickTravaler={getNextMonth(minX)}
            renderLabel={timeToMonth(minX)}
          />
          <Axis
            position="left"
            min={minY - 5}
            max={maxY + 10}
            renderLabel={x => `$ ${x}`}
          />
          {lines.map((line, i) =>
            <Line key={i} points={line} color={COLORS[i]} />
          )}
        </Plot>
        {this._renderInfo()}
      </div>
    )
  }

  _renderInfo() {
    const { info } = this.state
    if (!info) {
      return
    }

    const { position, point } = info

    let data = null
    let previous = null
    for (const line of this.props.data) {
      line.some((pointData, i) => {
        if (pointData.date.getTime() === point.x * DAY_MILLISECONDS) {
          data = pointData
          previous = line[i - 1]
          return true
        }
        return false
      })
      if (data) {
        break
      }
    }

    if (!data) {
      return null
    }

    let delta = null
    if (previous) {
      const diff = data.value - previous.value
      delta = (
        <span
          className={
            styles.popupDelta +
            ' ' +
            (diff > 0 ? styles.popupPositive : styles.popupNegative)
          }
        >
          {diff}
        </span>
      )
    }

    return (
      <Popup top={position.clientY - 50} left={position.clientX - 56}>
        <div className={styles.popup}>
          <div className={styles.popupDate}>
            {format(data.date, 'D MMMM YYYY', {
              locale: ruLocale
            })}
          </div>
          <div>
            $ {data.value} {delta}
          </div>
        </div>
      </Popup>
    )
  }

  _handlePointHover = (
    id: string,
    point: PlotPoint,
    position: { clientX: number, clientY: number }
  ) => {
    this.setState({
      info: {
        id,
        point,
        position
      }
    })
  }

  _handleMouseLeave = () => {
    this.setState({ info: null })
  }
}

function timeToMonth(minX) {
  return time => {
    const date = new Date((time + minX) * DAY_MILLISECONDS)
    if (!isSameDay(date, startOfMonth(date))) {
      return null
    }
    const str = format(date, 'MMMM', { locale: ruLocale })
    return str.slice(0, 1).toUpperCase().concat(str.slice(1))
  }
}

function getNextMonth(minX) {
  return (days, span) => {
    const time = (minX + days) * DAY_MILLISECONDS
    const date = new Date(time)
    const nextMonth = addMonth(date, 1)
    const startOfNextMonth = startOfMonth(nextMonth)
    return startOfNextMonth.getTime() / DAY_MILLISECONDS - minX
  }
}

export default StockPlot
