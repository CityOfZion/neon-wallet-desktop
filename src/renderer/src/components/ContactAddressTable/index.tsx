import { useMemo, useRef, useState } from 'react'
import { FiSend } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { BlockchainIcon } from '@renderer/components/BlockchainIcon'
import { TestHelper } from '@renderer/helpers/TestHelper'
import { getI18next } from '@renderer/libs/i18next'
import { TContactAddress } from '@shared/@types/store'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'

import { Button } from '../Button'
import { Table } from '../Table'

import { AddressCell } from './AddressCell'

type TProps = {
  contactAddresses: TContactAddress[]
}

const { t } = getI18next()

const columnHelper = createColumnHelper<TContactAddress>()

export const ContactAddressTable = ({ contactAddresses }: TProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const columns = useMemo(
    () => [
      columnHelper.accessor('blockchain', {
        cell: info => {
          return (
            <div className="flex flex-row items-center" {...TestHelper.buildTestObject('blockchain-column-cell')}>
              <div className="mr-2 bg-gray-700 p-2 rounded-full">
                <BlockchainIcon blockchain={info.row.original.blockchain} type="white" />
              </div>
              <span className="uppercase">{t(`common:blockchain.${info.row.original.blockchain}`)}</span>
            </div>
          )
        },
        header: t('components:contactAddressTable.blockchain'),
      }),
      columnHelper.accessor('address', {
        cell: info => (
          <AddressCell
            key={info.row.original.address}
            address={info.row.original.address}
            blockchain={info.row.original.blockchain}
          />
        ),
        enableSorting: false,
        header: t('components:contactAddressTable.address'),
      }),
      columnHelper.display({
        id: 'actions',
        cell: info => {
          return (
            <div className="w-full flex justify-end">
              <Button
                variant="text"
                label={t('components:contactAddressTable.sendAssets')}
                leftIcon={<FiSend />}
                onClick={() => navigate('/app/send', { state: { recipient: info.row.original.address } })}
                flat
                {...TestHelper.buildTestObject('send-assets-button')}
              />
            </div>
          )
        },
        enableSorting: false,
      }),
    ],
    [navigate]
  )

  const table = useReactTable({
    data: contactAddresses,
    columns,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: newSorting => {
      setSorting(newSorting)
      scrollRef.current?.scrollTo(0, 0)
    },
  })

  return (
    <section className="overflow-auto flex flex-col min-h-0 w-full flex-grow mt-4 pr-1 min-w-0" ref={scrollRef}>
      <Table.Root>
        <Table.Header className="sticky top-0 bg-gray-800">
          {table.getHeaderGroups().map(headerGroup => (
            <Table.HeaderRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <Table.Head
                  key={header.id}
                  sortable={header.column.getCanSort()}
                  sortedBy={header.column.getIsSorted()}
                  onClick={header.column.getToggleSortingHandler()}
                  className="font-semibold"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </Table.Head>
              ))}
            </Table.HeaderRow>
          ))}
        </Table.Header>

        <Table.Body>
          {table.getRowModel().rows.map(row => (
            <Table.BodyRow key={row.id} hoverable={false}>
              {row.getVisibleCells().map(cell => (
                <Table.Cell className="truncate" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.BodyRow>
          ))}
        </Table.Body>
      </Table.Root>
    </section>
  )
}
