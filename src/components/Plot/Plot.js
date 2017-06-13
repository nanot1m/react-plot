// @flow

import React from 'react'
import PropTypes from 'prop-types'

import type { ReactNode, PlotPoint } from '../../types'

type Props = {|
  /**
   * Plot components
   */
  children?: ReactNode[],

  height: number,

  width: number,

  paddingLeft: number,

  paddingBottom: number,

  onPointHover?: (
    id: string,
    point: PlotPoint,
    position: { clientX: number, clientY: number }
  ) => void,

  onMouseLeave?: (event: SyntheticMouseEvent) => void
|}

type State = {|
  scaleX: number,
  scaleY: number,
  activePointInfo: ?{ id: string, point: PlotPoint },
  rangeX: [number, number],
  rangeY: [number, number]
|}

class Plot extends React.Component {
  static defaultProps = {
    height: 400,
    width: 600,
    paddingLeft: 50,
    paddingBottom: 35
  }

  props: Props

  state: State = {
    scaleX: 1,
    scaleY: 1,
    activePointInfo: null,
    rangeX: [0, 0],
    rangeY: [0, 0]
  }

  _points: Map<string, PlotPoint[]> = new Map()
  _colors: Map<string, string> = new Map()
  _node: ?HTMLElement = null

  getChildContext() {
    const { height, width, paddingBottom, paddingLeft } = this.props
    const { scaleX: x, scaleY: y, rangeX, rangeY } = this.state
    return {
      sizes: { height: height, width: width },
      scale: { x, y },
      padding: { left: paddingLeft, bottom: paddingBottom },
      registerPoints: this._registerPoints,
      range: {
        x: rangeX,
        y: rangeY
      },
      setXScale: (scaleX: number) => this.setState({ scaleX }),
      setYScale: (scaleY: number) => this.setState({ scaleY }),
      setXRange: (rangeX: [number, number]) => this.setState({ rangeX }),
      setYRange: (rangeY: [number, number]) => this.setState({ rangeY })
    }
  }

  render() {
    return (
      <svg
        ref={node => (this._node = node)}
        width={this.props.width}
        height={this.props.height}
        onMouseMove={this._handleMouseMove}
        onMouseLeave={this._handleMouseLeave}
      >
        {this.props.children}
        {this._renderPointer()}
      </svg>
    )
  }

  _renderPointer = () => {
    const { activePointInfo } = this.state
    if (!activePointInfo) {
      return null
    }
    const { height, paddingBottom, paddingLeft } = this.props
    const { scaleX, scaleY, rangeX, rangeY } = this.state
    const { id, point } = activePointInfo
    const start = {
      x: (point.x - rangeX[0]) * scaleX + paddingLeft,
      y: height - paddingBottom
    }
    const end = {
      x: (point.x - rangeX[0]) * scaleX + paddingLeft,
      y: height - paddingBottom - (point.y - rangeY[0]) * scaleY
    }
    const line = (
      <path
        d={`M${start.x}, ${start.y} L${end.x}, ${end.y}`}
        fill="none"
        strokeDasharray="5, 5"
        stroke="gray"
        style={{ transition: 'all 0.1s linear' }}
      />
    )

    const circle = (
      <circle
        style={{ transition: 'all 0.1s linear' }}
        cx={end.x}
        cy={end.y}
        r={3}
        fill={this._colors.get(id)}
      />
    )

    return (
      <g>
        {line}
        {circle}
      </g>
    )
  }

  _registerPoints = (id: string, points: PlotPoint[], color: string) => {
    this._points.set(id, points)
    this._colors.set(id, color)
    return () => {
      this._points.delete(id)
      this._colors.delete(id)
    }
  }

  _handleMouseMove = ({ clientX, clientY }: SyntheticMouseEvent) => {
    if (!this._node) {
      return
    }

    const { onPointHover, paddingLeft, paddingBottom } = this.props

    if (!onPointHover) {
      return
    }

    const rect = this._node.getBoundingClientRect()
    const x = Math.round(
      (clientX - rect.left - paddingLeft) / this.state.scaleX +
        this.state.rangeX[0]
    )
    const y = Math.round(
      (rect.bottom - clientY - paddingBottom) / this.state.scaleY +
        this.state.rangeY[0]
    )

    const closestPointInfo = getClosestPoint({ x, y }, this._points)

    this.setState({ activePointInfo: closestPointInfo }, () => {
      if (closestPointInfo) {
        const { point, id } = closestPointInfo
        const { scaleX, scaleY, rangeX, rangeY } = this.state

        const pointClientOffset = {
          x: rect.left + paddingLeft + (point.x - rangeX[0]) * scaleX,
          y: rect.bottom - paddingBottom - (point.y - rangeY[0]) * scaleY
        }

        onPointHover(id, point, {
          clientX: pointClientOffset.x,
          clientY: pointClientOffset.y
        })
      }
    })
  }

  _handleMouseLeave = (event: SyntheticMouseEvent) => {
    const { clientX, clientY } = event
    if (this._node) {
      const rect = this._node.getBoundingClientRect()
      if (
        clientX > rect.left &&
        clientX < rect.right &&
        clientY > rect.top &&
        clientY < rect.bottom
      ) {
        return
      }
    }
    this.setState({ activePointInfo: null }, () => {
      if (this.props.onMouseLeave) {
        this.props.onMouseLeave(event)
      }
    })
  }
}

function getClosestPoint(
  target: PlotPoint,
  pointsMap: Map<string, PlotPoint[]>
) {
  let result: ?{ id: string, point: PlotPoint } = null
  let minDistance = Infinity
  pointsMap.forEach((points, id) => {
    points.forEach(point => {
      const distance = getDistanceBetweenPoints(target, point)
      if (!result || distance < minDistance) {
        minDistance = distance
        result = { id, point }
      }
    })
  })
  return result
}

function getDistanceBetweenPoints(p1: PlotPoint, p2: PlotPoint) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

const { shape, number, func, arrayOf } = PropTypes

Plot.childContextTypes = {
  sizes: shape({
    height: number,
    width: number
  }).isRequired,
  scale: shape({
    x: number,
    y: number
  }).isRequired,
  padding: shape({
    left: number,
    bottom: number
  }),
  range: shape({
    x: arrayOf(number),
    y: arrayOf(number)
  }),
  setXScale: func.isRequired,
  setYScale: func.isRequired,
  registerPoints: func.isRequired,
  setXRange: func.isRequired,
  setYRange: func.isRequired
}

export default Plot
