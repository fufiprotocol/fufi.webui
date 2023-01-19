import React, { FC, memo } from 'react'
import classNames from 'classnames'
import './index.scss'
/**
* @Loading 组件使用参数
* @dark 是否白色
* @show 是否显示
*/
export interface ILoadingProps {
  dark?: boolean
  show?: boolean
}

const Loading: FC<ILoadingProps> = ({ show = false, dark = false }) => {
  if (!show) return null
  return (
    <div className={classNames('m-common-loading', { dark })}>
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  )
}

export default memo(Loading)
