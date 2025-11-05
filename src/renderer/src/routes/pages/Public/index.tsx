import { Outlet } from 'react-router'

export const PublicPage = () => {
  return (
    <div className="bg-asphalt flex h-full w-full items-center justify-center">
      <div className="relative flex h-full max-h-153.5 min-w-lg flex-col items-center overflow-hidden rounded-sm bg-gray-800">
        <Outlet />
      </div>
    </div>
  )
}

export default PublicPage
