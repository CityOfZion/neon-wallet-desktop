import { Fragment, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'

import { IconButton } from '@renderer/components/IconButton'
import { Loader } from '@renderer/components/Loader'
import { NftGallery } from '@renderer/components/NftGallery'
import { NftList } from '@renderer/components/NftList'

import { useInfiniteScroll } from '@renderer/hooks/useInfiniteScroll'
import { useNfts } from '@renderer/hooks/useNfts'

import { AccountDetailsLayout } from '@renderer/layouts/AccountDetailsLayout'

import MdFormatListBulleted from '@renderer/assets/images/md-format-list-bulleted.svg?react'
import MdGridView from '@renderer/assets/images/md-grid-view.svg?react'

import { IAccountState } from '@shared/types/store'

enum ENftViewOption {
  LIST,
  GALLERY,
}

type TOutletContext = {
  account: IAccountState
}

const AccountNftList = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'wallets.accountNftList' })

  const { account } = useOutletContext<TOutletContext>()

  const { aggregatedData, isLoading, fetchNextPage } = useNfts(account)

  const { handleScroll, ref } = useInfiniteScroll<HTMLDivElement>(() => {
    fetchNextPage()
  })

  const [selectedViewOption, setSelectedViewOption] = useState(ENftViewOption.LIST)

  return (
    <AccountDetailsLayout heading={t('title')}>
      <div className="flex min-h-0 w-full grow flex-col gap-2 text-xs">
        {isLoading ? (
          <div className="flex grow items-center">
            <Loader className="mt-5" />
          </div>
        ) : (
          <Fragment>
            <div className="my-5 flex items-center justify-start gap-1">
              <IconButton
                aria-selected={selectedViewOption === ENftViewOption.LIST}
                aria-label={t('listLabel')}
                icon={<MdFormatListBulleted aria-hidden />}
                colorSchema={selectedViewOption === ENftViewOption.LIST ? 'neon' : 'gray'}
                onClick={() => setSelectedViewOption(ENftViewOption.LIST)}
                size="md"
              />

              <IconButton
                aria-selected={selectedViewOption === ENftViewOption.GALLERY}
                aria-label={t('gridLabel')}
                icon={<MdGridView aria-hidden />}
                colorSchema={selectedViewOption === ENftViewOption.GALLERY ? 'neon' : 'gray'}
                onClick={() => setSelectedViewOption(ENftViewOption.GALLERY)}
                size="md"
              />

              <p className="ml-2 text-sm text-gray-300">{t('total', { length: aggregatedData.length })}</p>
            </div>

            <div className="flex min-h-0 w-full grow flex-col overflow-y-auto" onScroll={handleScroll} ref={ref}>
              {aggregatedData.length === 0 ? (
                <div className="mt-4 flex justify-center">
                  <p className="text-gray-300">{t('empty')}</p>
                </div>
              ) : selectedViewOption === ENftViewOption.LIST ? (
                <NftList nfts={aggregatedData} account={account} />
              ) : (
                <NftGallery nfts={aggregatedData} account={account} />
              )}
            </div>
          </Fragment>
        )}
      </div>
    </AccountDetailsLayout>
  )
}

export default AccountNftList
