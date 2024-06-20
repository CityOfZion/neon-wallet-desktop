import { useTranslation } from 'react-i18next'
import { MdContentCopy } from 'react-icons/md'
import { Button } from '@renderer/components/Button'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { UtilsHelper } from '@renderer/helpers/UtilsHelper'

type TProps = {
  result: string
}

export const SuccessModalContent = ({ result }: TProps) => {
  const { t } = useTranslation('modals', { keyPrefix: 'dappPermission.requests.neo3.invokeFunction' })
  return (
    <div className="flex flex-grow flex-col min-w-0 w-full items-center">
      <p className="text-center text-sm mt-4 px-9">{t('successModal.text')}</p>

      <Button
        className="mt-8 w-fit"
        variant="text"
        label={StringHelper.truncateStringMiddle(result, 40)}
        flat
        iconsOnEdge={false}
        rightIcon={<MdContentCopy />}
        onClick={UtilsHelper.copyToClipboard.bind(null, result)}
      />
    </div>
  )
}
