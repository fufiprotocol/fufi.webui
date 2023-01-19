import React, { memo, useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import './index.scss'

/**
* @ 弹窗组件使用参数
* @visible 是否显示
* @closeOnClickOverlay 是否在点击遮罩层后关闭
* @title 标题
* @width 弹窗宽度
* @onClose 遮罩层点击关闭
* @onDismiss 弹窗关闭后回调
*/
export interface IDialogProps {
  visible: boolean
  closeOnClickOverlay?: boolean
  className?: string
  title?: string | React.ReactElement<any> | React.ReactElement[]
  width?: string
  children?: React.ReactElement<any> | React.ReactElement[]
  onClose?: () => void
  onDismiss?: () => void
}

const Dialog: React.FunctionComponent<IDialogProps> = (props) => {
  const { visible, closeOnClickOverlay = true, className, title, width = '', onClose, onDismiss } = props
  const [active, setActive] = useState<boolean>(false)
  const [aniClassName, setAniClassName] = useState<string>('')

  const contentStyle: React.CSSProperties = {
    width: width
  }

  const clickFunc = useCallback(
    (): void => onClose?.(),
    [onClose]
  )

  const clickOverlay = useCallback(
    () => {
      if (closeOnClickOverlay) {
        onClose?.()
      }
    },
    [closeOnClickOverlay, onClose]
  )

  const onAnimationEnd = () => {
    if (visible) {
      setAniClassName('')
    } else {
      setActive(false)
      onDismiss?.()
    }
  }

  useEffect(() => {
    if (visible) {
      setActive(true)
      setAniClassName('dialog-fade-in')
      document.querySelector('body')?.classList.add('overflow-hidden')
    } else {
      setAniClassName('dialog-fade-out')
      document.querySelector('body')?.classList.remove('overflow-hidden')
    }
    return () => {
      document.querySelector('body')?.classList.remove('overflow-hidden')
    }
  }, [visible])

  return createPortal(
    <>
      {
        active ? <div className={`public-dialog ${aniClassName} ${className}`} onAnimationEnd={onAnimationEnd}>
          <div className="public-dialog-overlay" onClick={clickOverlay}></div>
          <div className="public-modal-content flex-col-center-stretch" style={contentStyle}>
            <div className="content-title flex-row-between-center c-222 fs-24 bold">
              <b>{title ?? ''}</b>
              <div className="icon-close" onClick={clickFunc}></div>
            </div>
            <div className="scroll-center p-b-30">
              {props.children}
            </div>

          </div>

        </div> : null
      }
    </>, document.body
  )
}

export default memo(Dialog)
