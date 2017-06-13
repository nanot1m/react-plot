// @flow

import React from 'react'

import type { ReactNode } from '../../types'

import styles from './Popup.css'

type Props = {
  top?: number,
  left?: number,
  bottom?: number,
  right?: number,
  children?: ReactNode
}

/**
 * It would be good if we have some portal component,
 * to render popup outside, but we will skip it for test work
 */
class Popup extends React.Component {
  props: Props

  render() {
    const { top, left, bottom, right, children } = this.props
    return (
      <div className={styles.root} style={{ top, left, bottom, right }}>
        {children}
      </div>
    )
  }
}

export default Popup
