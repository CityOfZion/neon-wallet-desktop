import { cloneElement } from 'react'

import { LayoutGroup } from 'motion/react'
import { motion } from 'motion/react'
import { useMatch, useOutlet } from 'react-router'

let hasAnimatedOnce = false

export const PublicPage = () => {
  const outlet = useOutlet()

  const match = useMatch(':rootPath/*')

  return (
    <div className="bg-asphalt flex h-full w-full items-center justify-center">
      <LayoutGroup>
        <motion.div
          className="relative flex h-full max-h-156 min-w-lg flex-col items-center overflow-hidden rounded-sm bg-gray-800"
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: !hasAnimatedOnce ? 0.5 : 0, layout: { duration: 0.1, delay: 0 } }}
          onAnimationComplete={() => (hasAnimatedOnce = true)}
        >
          {outlet && cloneElement(outlet, { key: match?.params.rootPath })}
        </motion.div>
      </LayoutGroup>
    </div>
  )
}

export default PublicPage
