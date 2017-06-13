// @flow

import React from 'react'
import { shape, number, arrayOf } from 'prop-types'

type FunctionComponent<P> = (props: P) => ?React$Element<any>
type ClassComponent<D, P, S> = Class<React$Component<D, P, S>>
type WrapperProps = {
  sizes: { height: number, width: number },
  scale: { x: number, y: number },
  padding: { left: number, bottom: number },
  range: { x: [number, number], y: [number, number] }
}

/**
 * High order component to pass Plot context params
 * to Component
 */
const withPlotParams = function<P, S, D>(
  Component: ClassComponent<D, P, S> | FunctionComponent<P>
): ClassComponent<D, $Diff<P, WrapperProps>, S> {
  class WrapperClass extends React.Component {
    static defaultProps: D

    static displayName = `withPlotParams(${Component.displayName})`

    static contextTypes = {
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
      })
    }

    props: *
    state: *

    constructor(props, context) {
      super(props, context)

      if (!context.sizes) {
        throw Error(
          `Component ${Component.displayName} must be inside Plot component`
        )
      }
    }

    render() {
      return (
        <Component
          sizes={this.context.sizes}
          scale={this.context.scale}
          padding={this.context.padding}
          range={this.context.range}
          {...this.props}
        />
      )
    }
  }

  return WrapperClass
}

export default withPlotParams
