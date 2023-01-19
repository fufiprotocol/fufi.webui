import React, { memo, useCallback } from 'react'
import './index.scss'
import Dialog from "@/components/Dialog";
import Icon from "@/components/Icon";
import connect_anchor from '@/assets/images/common/connect_anchor.svg'
import connect_scatter from '@/assets/images/common/connect_scatter.svg'
/**
* @ConnectModal 连接模式组件使用参数
* @className 自定义className
* @closeChange 遮罩层点击关闭回调
*/
export interface IConnectModalProps {
  visible: boolean
  login: (connectorType: any) => void
  className?: string
  onDismiss?: () => void
}

const userList = [
  {
    title: 'Anchor',
    logo: connect_anchor,
    id: 1
  },
  {
    title: 'Scatter',
    logo: connect_scatter,
    id: 2
  }
]
const ConnectModal: React.FunctionComponent<IConnectModalProps> = (props) => {
  const { className, visible, onDismiss,login } = props
  const { isMobile } = (window as any)._global || {}
  const confirmLogin = useCallback(
    (title) => {
      login(title)
      if (onDismiss) {
        onDismiss()
      }
    },
    [onDismiss,login]
  )

  const dialogWidth = isMobile ? '6.7rem' : '420px'
  const iconHeight = isMobile ? '0.64rem' : '32px'

  return (
    <Dialog visible={visible} onClose={onDismiss} title="Connect to a wallet" width={dialogWidth}>
      <ul className={`wallet-category-dialog p-0-24 fs-16 c-222 ${className}`}>
        {
          userList.map(item => {
            return (
              <li className="role-list flex-row-between-center m-b-16 pointer" key={item.id} onClick={() => confirmLogin(item.title)}>
                <span>{item.title}</span>
                <Icon src={item.logo} height={iconHeight}></Icon>
              </li>
            )
          })
        }
      </ul>
    </Dialog>
  )
}

export default memo(ConnectModal)
