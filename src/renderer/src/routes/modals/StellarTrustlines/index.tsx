import { useTranslation } from 'react-i18next'
import { match, P } from 'ts-pattern'

import { Button } from '@renderer/components/Button'
import { Loader } from '@renderer/components/Loader'
import { TokenItem } from '@renderer/components/TokenItem'

import { useModalNavigate, useModalState } from '@renderer/hooks/useModalRouter'
import { useStellarTrustlinesQuery } from '@renderer/hooks/useStellarTruslines'

import { SideModalLayout } from '@renderer/layouts/SideModal'

import TbPencil from '@renderer/assets/images/tb-pencil.svg?react'
import TbShieldCheck from '@renderer/assets/images/tb-shield-check.svg?react'

import type { TModalState } from '@shared/types/modal'

const StellarTrustlines = () => {
  const { t } = useTranslation('modals', { keyPrefix: 'stellarTrustlines' })
  const { t: tCommonGeneral } = useTranslation('common', { keyPrefix: 'general' })
  const { stellarAccount } = useModalState<TModalState<'stellar-trustlines'>>()
  const { modalNavigateWrapper } = useModalNavigate()
  const trustlinesQuery = useStellarTrustlinesQuery(stellarAccount)

  return (
    <SideModalLayout
      heading={t('title')}
      contentClassName="flex flex-col text-gray-100"
      headingIcon={<TbShieldCheck aria-hidden />}
    >
      <div className="flex min-h-0 grow flex-col">
        {match(trustlinesQuery)
          .with({ isLoading: true }, () => <Loader />)
          .with({ data: P.when(data => !data || data.length === 0) }, () => (
            <p className="text-center text-gray-300">{t('emptyMessage')}</p>
          ))
          .otherwise(() => (
            <ul className="mb-6 flex flex-col gap-2 overflow-auto">
              {trustlinesQuery.data?.map(trustline => (
                <li key={`${trustline.token.symbol || trustline.token.name}-${trustline.token.hash}`}>
                  <button
                    aria-label={tCommonGeneral('edit')}
                    className="bg-asphalt hover:bg-asphalt/60 focus:bg-asphalt/60 active:bg-asphalt/40 flex w-full min-w-0 cursor-pointer items-center gap-2 rounded p-2"
                    onClick={modalNavigateWrapper('stellar-persist-trustlines', {
                      state: { stellarAccount, token: trustline.token, limit: trustline.limit },
                    })}
                  >
                    <TokenItem blockchain={stellarAccount.blockchain} token={trustline.token} />

                    <TbPencil aria-hidden className="size-5" />
                  </button>
                </li>
              ))}
            </ul>
          ))}
      </div>

      <Button
        label={t('addTrustlineButtonLabel')}
        flat
        onClick={modalNavigateWrapper('stellar-persist-trustlines', { state: { stellarAccount } })}
      />
    </SideModalLayout>
  )
}

export default StellarTrustlines
