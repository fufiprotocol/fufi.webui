import React, { FC, lazy } from 'react'
const WebEmpty = lazy(async () => await import('@/views/web/Home/index'))
const MpEmpty = lazy(async () => await import('@/views/mobile/Home/index'))

const NotFound: FC = () => {
  const { isMobile } = (window as any)._global || {}
  return (
    <>
      { isMobile ? <MpEmpty /> : <WebEmpty /> }
    </>
  )
}

export default NotFound
