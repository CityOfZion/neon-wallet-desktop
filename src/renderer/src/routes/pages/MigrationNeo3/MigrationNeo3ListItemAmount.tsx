import { useTranslation } from 'react-i18next'

type TProps = {
  amount?: string
  symbol?: string
}

export const MigrationNeo3ListItemAmount = ({ amount, symbol }: TProps) => {
  const { t: tBlockchain } = useTranslation('common', { keyPrefix: 'blockchain' })

  if (!amount) return null

  return (
    <li className="text-white text-right uppercase">
      {amount} {symbol} <span className="text-gray-100">| {tBlockchain('neo3')}</span>
    </li>
  )
}
