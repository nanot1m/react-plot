// @flow

import React from 'react'
import PropTypes from 'prop-types'
import { equals, zip } from 'ramda'

import withPlotParams from './withPlotParams'

type Props = {|
  max: number,
  min: number,
  padding: { left: number, bottom: number },
  position: 'bottom' | 'left',
  renderLabel: (value: number) => string,
  scale: { x: number, y: number },
  sizes: { height: number, width: number },
  range: { x: [number, number], y: [number, number] },
  tickSpan: number,
  tickTravaler: (current: number, tickSpan: number) => number
|}

const KEYS_FOR_UPDATES = ['sizes', 'max', 'min', 'position', 'padding', 'range']

const getProps = props => KEYS_FOR_UPDATES.map(x => props[x])

const checkPropsUpdate = (propsA: Props, propsB: Props) =>
  zip(getProps(propsA), getProps(propsB)).some(x => !equals(...x))

class Axis extends React.Component {
  static defaultProps = {
    renderLabel: value => value,
    tickSpan: 10,
    tickTravaler: (current = 0, tickSpan = 10) => current + tickSpan
  }

  props: Props

  componentWillMount() {
    this._setScale()
  }

  componentDidUpdate(prevProps) {
    this._setScale()
  }

  shouldComponentUpdate(nextProp) {
    return checkPropsUpdate(nextProp, this.props)
  }

  render() {
    return this._renderAxis()
  }

  _renderAxis() {
    const { position } = this.props
    switch (position) {
      case 'bottom':
        return this._renderBottomAxis()
      case 'left':
        return this._renderLeftAxis()
      default:
        ;(position: empty)
        return null
    }
  }

  _renderBottomAxis() {
    const {
      sizes: { height },
      scale,
      max,
      min,
      tickSpan,
      tickTravaler,
      padding
    } = this.props
    const ticks = []
    let pos = 0
    while (pos < max - min) {
      ticks.push(
        <text
          key={pos}
          x={pos * scale.x + padding.left}
          y={height - padding.bottom + 25}
          textAnchor="middle"
          fontFamily="Helvetica, Arial"
          fill="#8b8b8b"
        >
          {this.props.renderLabel(pos)}
        </text>
      )
      pos = tickTravaler(pos, tickSpan)
    }
    return (
      <g>
        {ticks}
      </g>
    )
  }

  _renderLeftAxis() {
    const {
      sizes: { height, width },
      scale,
      max,
      min,
      tickSpan,
      tickTravaler,
      padding
    } = this.props
    const ticks = []
    let pos = 0
    while (pos < max - min) {
      let y = height - padding.bottom - pos * scale.y
      ticks.push(
        <g key={pos}>
          <text
            x={padding.left - 10}
            y={y}
            textAnchor="end"
            fontFamily="Helvetica, Arial"
            fill="#8b8b8b"
          >
            {this.props.renderLabel(pos)}
          </text>
          <path
            stroke="#b8b8b8"
            fill="none"
            d={`M${padding.left}, ${y} L${width} ${y}`}
          />
        </g>
      )
      pos = tickTravaler(pos, tickSpan)
    }
    return (
      <g>
        {ticks}
      </g>
    )
  }

  _setScale() {
    const { sizes: { height, width }, max, min, position, padding } = this.props
    switch (position) {
      case 'bottom':
        this.context.setXScale((width - padding.left) / (max - min))
        this.context.setXRange([min, max])
        break
      case 'left':
        this.context.setYScale((height - padding.bottom) / (max - min))
        this.context.setYRange([min, max])
        break
      default:
        ;(position: empty)
        return
    }
  }
}

Axis.contextTypes = {
  setXScale: PropTypes.func.isRequired,
  setYScale: PropTypes.func.isRequired,
  setXRange: PropTypes.func.isRequired,
  setYRange: PropTypes.func.isRequired
}

export default withPlotParams(Axis)
