import React from 'react'
import { Outlet } from 'react-router-dom'

const WorkArea = () => {
  return (
    <div className="workArea-container">
      <Outlet />
    </div>
  )
}

export default WorkArea