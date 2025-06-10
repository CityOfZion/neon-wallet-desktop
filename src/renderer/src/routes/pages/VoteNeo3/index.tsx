import { useTranslation } from 'react-i18next'
import { TbChartBarPopular } from 'react-icons/tb'
import { Location, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@renderer/components/Button'
import { GreyAccountSelect } from '@renderer/components/GreyAccountSelect'
import { Separator } from '@renderer/components/Separator'
import { Tooltip } from '@renderer/components/Tooltip'
import { StringHelper } from '@renderer/helpers/StringHelper'
import { useAccountsByBlockchainsSelector, useAccountsSelector } from '@renderer/hooks/useAccountSelector'
import { useActions } from '@renderer/hooks/useActions'
import { ContentLayout } from '@renderer/layouts/ContentLayout'
import { IAccountState } from '@shared/@types/store'

import { VoteNeo3SideBar } from './VoteNeo3SideBar'

type TLocationState = {
  defaultNeo3Account?: IAccountState
}

type TActionsData = {
  neo3Account?: IAccountState
}

export const VoteNeo3Page = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'voteNeo3' })
  const { accounts } = useAccountsSelector()
  const { accountsByBlockchains: neo3Accounts } = useAccountsByBlockchainsSelector(['neo3'])
  const location = useLocation() as Location<TLocationState | null>
  const navigate = useNavigate()

  const defaultNeo3Account = location.state?.defaultNeo3Account

  const {
    actionData: { neo3Account },
    setData,
  } = useActions<TActionsData>({ neo3Account: defaultNeo3Account })

  const isAccountSelectionDisabled = neo3Accounts.length === 0

  const handleGoBack = () => {
    const accountId = defaultNeo3Account?.id || neo3Account?.id || neo3Accounts[0]?.id || accounts[0].id

    navigate(`/app/wallets/${accountId}/overview`)
  }

  const handleChangeNeo3Account = (neo3Account: IAccountState) => {
    setData({ neo3Account })
  }

  return (
    <ContentLayout
      title={t('title')}
      contentClassName="mt-0"
      withSeparator={false}
      titleIcon={<TbChartBarPopular aria-hidden={true} />}
      rightComponent={
        <div className="flex items-center gap-x-2">
          <p className="text-sm text-white">
            {neo3Account?.name ?? t('noAccountSelectedLabel')}
            {neo3Account && (
              <span className="text-gray-100"> | {StringHelper.truncateStringMiddle(neo3Account.address, 8)}</span>
            )}
          </p>

          <GreyAccountSelect
            selectedAccount={neo3Account}
            blockchains={['neo3']}
            disabled={isAccountSelectionDisabled}
            onSelect={handleChangeNeo3Account}
          >
            <div>
              <Tooltip
                title={isAccountSelectionDisabled ? t('createNeo3AccountLabel') : ''}
                delayDuration={0}
                contentProps={{ className: 'text-center inline-block max-w-32 break-words bg-gray-900' }}
                arrowProps={{ className: 'fill-gray-900' }}
              >
                <Button
                  label={neo3Account ? t('changeNeo3AccountLabel') : t('selectNeo3AccountLabel')}
                  type="button"
                  textClassName="text-sm"
                  variant="text-slim"
                  disabled={isAccountSelectionDisabled}
                />
              </Tooltip>
            </div>
          </GreyAccountSelect>
        </div>
      }
      onBackClick={handleGoBack}
    >
      <section className="flex h-full w-full rounded bg-gray-800">
        <VoteNeo3SideBar />

        <div className="flex h-full w-full flex-col px-4 pt-1">
          <div className="flex w-full flex-col">
            <h2 className="flex h-12 w-full items-center text-sm text-white">{t('subtitle')}</h2>

            <Separator />
          </div>

          {/* TODO: add list here  */}
        </div>
      </section>
    </ContentLayout>
  )
}
