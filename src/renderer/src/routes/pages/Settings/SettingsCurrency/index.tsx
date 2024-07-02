import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RadioGroup } from '@renderer/components/RadioGroup'
import { availableCurrencies } from '@renderer/constants/currency'
import { useAppDispatch } from '@renderer/hooks/useRedux'
import { useCurrencySelector } from '@renderer/hooks/useSettingsSelector'
import { SettingsLayout } from '@renderer/layouts/Settings'
import { settingsReducerActions } from '@renderer/store/reducers/SettingsReducer'
import { TCurrency } from '@shared/@types/store'

export const SettingsCurrency = () => {
  const { t } = useTranslation('pages', { keyPrefix: 'settings.settingsCurrency' })
  const { currency } = useCurrencySelector()
  const dispatch = useAppDispatch()

  const [selectedCurrency, setSelectedCurrency] = useState<TCurrency>(currency)

  const onSelectRadioItem = (selectedValue: string) => {
    const selectedCurrency = availableCurrencies.find(currency => currency.symbol === selectedValue)

    if (!selectedCurrency) return

    setSelectedCurrency(selectedCurrency)
    dispatch(settingsReducerActions.setCurrency(selectedCurrency))
  }

  return (
    <SettingsLayout title={t('title')}>
      <RadioGroup.Group value={selectedCurrency.symbol} onValueChange={onSelectRadioItem}>
        {availableCurrencies.map(currency => (
          <RadioGroup.Item key={currency.label} value={currency.symbol}>
            <div className="flex gap-x-2">
              <div>{currency.symbol}</div>
              <label>{currency.label}</label>
            </div>
            <RadioGroup.Indicator />
          </RadioGroup.Item>
        ))}
      </RadioGroup.Group>
    </SettingsLayout>
  )
}
