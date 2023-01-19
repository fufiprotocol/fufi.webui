import React, { memo } from 'react'

/**
* @Icon 图标组件使用参数
* @src 图标地址
* @height 展示高度
* @width 展示宽度
* @borderRadius 圆角属性
* @className 自定义className
* @onChange 遮罩层点击关闭回调
*/
export interface IIconProps {
  src: string
  height?: string
  width?: string
  borderRadius?: string
  className?: string
  opacity?: string
  onClick?: () => void
}

const Icon: React.FunctionComponent<IIconProps> = (props) => {
  const { src, height = 'auto', width = 'auto', borderRadius = '0px', className, opacity = 1, onClick } = props
  const iconStyle: React.CSSProperties = {
    height: height,
    width: width,
    borderRadius: borderRadius,
    opacity: opacity
  }
  return (
    <img className={className} src={src} style={iconStyle} onClick={onClick} alt="" />
  )
}

export default memo(Icon)
