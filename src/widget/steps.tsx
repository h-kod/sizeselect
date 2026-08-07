import { useMemo, useState } from 'react'
import { Gender, SizeSystem, formatSize, readSystemValue } from '../data/sizeSystem'
import { brandNames, getBrandProfile, getBrandTable } from '../data/brandProfiles'
import { getModelsByBrand, ShoeModel } from '../data/models'
import { FitFeedback, FootWidth, RecommendationResult } from '../utils/recommendationEngine'
import { InventorySnapshot } from '../utils/inventory'
import { ShoeFitProfile } from '../utils/profile'
import { Translator } from './i18n'
import { BrandLogo, ConfidenceMeter, Segmented, StockBadge } from './ui'

type Lang = 'tr' | 'en'

/* -------------------------------------------------------------------------- */
/* 1 — Yöntem seçimi                                                           */
/* -------------------------------------------------------------------------- */

interface MethodStepProps {
  t: Translator
  gender: Gender
  onGenderChange: (gender: Gender) => void
  profile: ShoeFitProfile | null
  profileSummary: string | null
  onSelect: (method: 'reference' | 'measure' | 'profile') => void
}

export function MethodStep({
  t,
  gender,
  onGenderChange,
  profile,
  profileSummary,
  onSelect
}: MethodStepProps) {
  return (
    <div className="sf-step">
      <Segmented
        label={t('whoFor')}
        value={gender}
        onChange={onGenderChange}
        options={[
          { value: 'men' as Gender, label: t('genderMen') },
          { value: 'women' as Gender, label: t('genderWomen') },
          { value: 'kids' as Gender, label: t('genderKids') }
        ]}
      />

      <p className="sf-field__label">{t('methodTitle')}</p>
      <div className="sf-choices">
        {profile && profileSummary && (
          <button type="button" className="sf-choice sf-choice--accent" onClick={() => onSelect('profile')}>
            <span className="sf-choice__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <span className="sf-choice__text">
              <strong>{t('methodProfileTitle')}</strong>
              <small>{profileSummary}</small>
            </span>
            <span className="sf-choice__arrow" aria-hidden="true">→</span>
          </button>
        )}

        <button type="button" className="sf-choice" onClick={() => onSelect('reference')}>
          <span className="sf-choice__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M3 17h18M5 17l1.5-6h11L19 17M8 11V7h8v4" />
            </svg>
          </span>
          <span className="sf-choice__text">
            <strong>{t('methodReferenceTitle')}</strong>
            <small>{t('methodReferenceDesc')}</small>
          </span>
          <span className="sf-choice__arrow" aria-hidden="true">→</span>
        </button>

        <button type="button" className="sf-choice" onClick={() => onSelect('measure')}>
          <span className="sf-choice__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M3 8h18v8H3zM7 8v4M11 8v4M15 8v4M19 8v4" />
            </svg>
          </span>
          <span className="sf-choice__text">
            <strong>{t('methodMeasureTitle')}</strong>
            <small>{t('methodMeasureDesc')}</small>
          </span>
          <span className="sf-choice__arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 2 — Referans marka                                                          */
/* -------------------------------------------------------------------------- */

interface BrandStepProps {
  t: Translator
  lang: Lang
  selected: string
  recentBrands: string[]
  onSelect: (brand: string) => void
}

export function BrandStep({ t, lang, selected, recentBrands, onSelect }: BrandStepProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return brandNames
    return brandNames.filter(brand => brand.toLowerCase().includes(needle))
  }, [query])

  const trimmedQuery = query.trim()

  return (
    <div className="sf-step">
      <p className="sf-field__label">{t('brandTitle')}</p>

      <div className="sf-search">
        <svg className="sf-search__icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          className="sf-input"
          type="search"
          value={query}
          placeholder={t('brandSearch')}
          aria-label={t('brandSearch')}
          onChange={event => setQuery(event.target.value)}
        />
      </div>

      {recentBrands.length > 0 && !trimmedQuery && (
        <div className="sf-chips">
          {recentBrands.map(brand => (
            <button key={brand} type="button" className="sf-chip" onClick={() => onSelect(brand)}>
              <BrandLogo brand={brand} size={18} />
              {brand}
            </button>
          ))}
        </div>
      )}

      <div className="sf-list" role="listbox" aria-label={t('brandTitle')}>
        {filtered.map(brand => {
          const profile = getBrandProfile(brand)
          return (
            <button
              key={brand}
              type="button"
              role="option"
              aria-selected={selected === brand}
              className={`sf-row${selected === brand ? ' is-active' : ''}`}
              onClick={() => onSelect(brand)}
            >
              <BrandLogo brand={brand} size={34} />
              <span className="sf-row__text">
                <strong>{profile.display}</strong>
                <small>{lang === 'tr' ? profile.captionTr : profile.captionEn}</small>
              </span>
              {profile.dataQuality === 'calibrated' && (
                <span className="sf-tag" title={lang === 'tr' ? 'Kalibre edilmiş tablo' : 'Calibrated chart'}>
                  ✓
                </span>
              )}
            </button>
          )
        })}

        {filtered.length === 0 && (
          <div className="sf-empty">
            <p>{t('brandNotFound')}</p>
            {trimmedQuery.length > 1 && (
              <button type="button" className="sf-btn sf-btn--ghost" onClick={() => onSelect(trimmedQuery)}>
                {t('brandUseAnyway', { query: trimmedQuery })}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 3 — Model, numara ve uyum                                                   */
/* -------------------------------------------------------------------------- */

interface DetailStepProps {
  t: Translator
  lang: Lang
  gender: Gender
  refBrand: string
  refModelId: string
  onModelChange: (id: string) => void
  system: SizeSystem
  onSystemChange: (system: SizeSystem) => void
  size: string
  onSizeChange: (size: string) => void
  fit: FitFeedback
  onFitChange: (fit: FitFeedback) => void
  width: FootWidth
  onWidthChange: (width: FootWidth) => void
}

export function DetailStep({
  t,
  lang,
  gender,
  refBrand,
  refModelId,
  onModelChange,
  system,
  onSystemChange,
  size,
  onSizeChange,
  fit,
  onFitChange,
  width,
  onWidthChange
}: DetailStepProps) {
  const models: ShoeModel[] = getModelsByBrand(refBrand)
  const table = getBrandTable(refBrand, gender)

  const sizeValues = useMemo(
    () => table.map(row => readSystemValue(row, system)),
    [table, system]
  )

  return (
    <div className="sf-step">
      <div className="sf-brandline">
        <BrandLogo brand={refBrand} size={26} />
        <strong>{refBrand}</strong>
      </div>

      {models.length > 0 && (
        <div className="sf-field">
          <span className="sf-field__label">{t('modelTitle')}</span>
          <p className="sf-hint">{t('modelHelp')}</p>
          <div className="sf-chips">
            <button
              type="button"
              className={`sf-chip${refModelId === '' ? ' is-active' : ''}`}
              onClick={() => onModelChange('')}
            >
              {t('modelNone')}
            </button>
            {models.map(model => (
              <button
                key={model.id}
                type="button"
                className={`sf-chip${refModelId === model.id ? ' is-active' : ''}`}
                onClick={() => onModelChange(model.id)}
              >
                {model.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="sf-field">
        <span className="sf-field__label">{t('sizeTitle')}</span>
        <Segmented
          size="sm"
          label={t('sizeSystem')}
          value={system}
          onChange={onSystemChange}
          options={[
            { value: 'EU' as SizeSystem, label: 'EU' },
            { value: 'US' as SizeSystem, label: 'US' },
            { value: 'UK' as SizeSystem, label: 'UK' },
            { value: 'CM' as SizeSystem, label: 'CM' }
          ]}
        />
        <div className="sf-grid" role="radiogroup" aria-label={t('sizeTitle')}>
          {sizeValues.map(value => {
            const label = formatSize(value, lang)
            return (
              <button
                key={`${system}-${value}`}
                type="button"
                role="radio"
                aria-checked={size === String(value)}
                className={`sf-grid__cell${size === String(value) ? ' is-active' : ''}`}
                onClick={() => onSizeChange(String(value))}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="sf-field">
        <span className="sf-field__label">{t('fitTitle')}</span>
        <div className="sf-options" role="radiogroup" aria-label={t('fitTitle')}>
          {(
            [
              { value: 'tight', label: t('fitTight'), icon: '↧' },
              { value: 'perfect', label: t('fitPerfect'), icon: '✓' },
              { value: 'loose', label: t('fitLoose'), icon: '↥' }
            ] as Array<{ value: FitFeedback; label: string; icon: string }>
          ).map(option => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={fit === option.value}
              className={`sf-option${fit === option.value ? ' is-active' : ''}`}
              onClick={() => onFitChange(option.value)}
            >
              <span className="sf-option__icon" aria-hidden="true">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Segmented
        label={t('widthTitle')}
        value={width}
        onChange={onWidthChange}
        options={[
          { value: 'narrow' as FootWidth, label: t('widthNarrow') },
          { value: 'normal' as FootWidth, label: t('widthNormal') },
          { value: 'wide' as FootWidth, label: t('widthWide') }
        ]}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 3b — Ölçüm                                                                  */
/* -------------------------------------------------------------------------- */

interface MeasureStepProps {
  t: Translator
  value: string
  onChange: (value: string) => void
  width: FootWidth
  onWidthChange: (width: FootWidth) => void
  invalid: boolean
}

export function MeasureStep({ t, value, onChange, width, onWidthChange, invalid }: MeasureStepProps) {
  return (
    <div className="sf-step">
      <div className="sf-field">
        <span className="sf-field__label">{t('measureTitle')}</span>

        <div className="sf-measure">
          <svg className="sf-measure__art" viewBox="0 0 220 90" aria-hidden="true">
            <path className="sf-measure__foot" d="M40 62c0-16 8-30 24-34 14-3 22 4 34 8 12 4 30 6 48 6 14 0 22 6 22 12 0 8-8 12-22 12H62c-14 0-22-2-22-4z" />
            <path className="sf-measure__rule" d="M28 78h164M28 72v12M192 72v12M70 74v8M112 74v8M154 74v8" />
          </svg>

          <div className="sf-measure__input">
            <input
              className={`sf-input sf-input--number${invalid ? ' is-invalid' : ''}`}
              type="number"
              inputMode="decimal"
              min={18}
              max={35}
              step={0.1}
              value={value}
              placeholder="26,5"
              aria-label={t('measureTitle')}
              aria-invalid={invalid}
              onChange={event => onChange(event.target.value)}
            />
            <span className="sf-measure__unit">{t('measureUnit')}</span>
          </div>
        </div>

        {invalid ? (
          <p className="sf-hint sf-hint--error">{t('measureInvalid')}</p>
        ) : (
          <p className="sf-hint">{t('measureHelp')}</p>
        )}
      </div>

      <Segmented
        label={t('widthTitle')}
        value={width}
        onChange={onWidthChange}
        options={[
          { value: 'narrow' as FootWidth, label: t('widthNarrow') },
          { value: 'normal' as FootWidth, label: t('widthNormal') },
          { value: 'wide' as FootWidth, label: t('widthWide') }
        ]}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 4 — Sonuç                                                                   */
/* -------------------------------------------------------------------------- */

interface ResultStepProps {
  t: Translator
  lang: Lang
  result: RecommendationResult
  targetBrand: string
  gender: Gender
  inventory: InventorySnapshot
  onPickAlternative: (eu: number) => void
}

export function ResultStep({
  t,
  lang,
  result,
  targetBrand,
  gender,
  inventory,
  onPickAlternative
}: ResultStepProps) {
  const [showWhy, setShowWhy] = useState(false)

  const stockLabels = {
    inStock: t('inStock'),
    outOfStock: t('outOfStock'),
    notOffered: t('notOffered')
  }

  const bandLabel =
    result.riskLevel === 'low' ? t('confidenceHigh') : result.riskLevel === 'medium' ? t('confidenceMedium') : t('confidenceLow')

  const notes = lang === 'tr' ? result.notesTr : result.notesEn
  const table = getBrandTable(targetBrand, gender)
  const row = table.find(item => Math.abs(item.eu - result.recommendedEu) < 0.01)

  return (
    <div className="sf-step">
      {result.substituted && (
        <div className="sf-alert" role="status">
          <strong>{t('substitutedTitle', { ideal: formatSize(result.idealEu, lang) })}</strong>
        </div>
      )}

      <div className="sf-result">
        <div className="sf-result__main">
          <p className="sf-result__label">{t('resultTitle')}</p>
          <p className="sf-result__size">
            <span className="sf-result__system">EU</span>
            {formatSize(result.recommendedEu, lang)}
          </p>
          <StockBadge availability={result.availability} labels={stockLabels} />
        </div>

        <ConfidenceMeter
          value={result.confidence}
          risk={result.riskLevel}
          label={t('confidence')}
          bandLabel={bandLabel}
        />
      </div>

      {row && (
        <div className="sf-conversions">
          <span>US {formatSize(row.us, lang)}</span>
          <span>UK {formatSize(row.uk, lang)}</span>
          <span>{formatSize(row.cm, lang)} cm</span>
        </div>
      )}

      <p className="sf-explain">{lang === 'tr' ? result.explanationTr : result.explanationEn}</p>

      <button
        type="button"
        className="sf-disclosure"
        aria-expanded={showWhy}
        onClick={() => setShowWhy(prev => !prev)}
      >
        {showWhy ? t('whyHide') : t('whyShow')}
        <span className={`sf-disclosure__arrow${showWhy ? ' is-open' : ''}`} aria-hidden="true">▾</span>
      </button>

      {showWhy && (
        <div className="sf-why">
          <p className="sf-why__title">{t('whyTitle')}</p>
          <ul className="sf-why__list">
            <li>
              <span>{t('whyBase', { cm: formatSize(result.footCm, lang) })}</span>
            </li>
            {result.factors.map((factor, index) => (
              <li key={index}>
                <span>{lang === 'tr' ? factor.labelTr : factor.labelEn}</span>
                <em data-sign={factor.deltaEu >= 0 ? 'plus' : 'minus'}>
                  {factor.deltaEu > 0 ? '+' : ''}
                  {formatSize(factor.deltaEu, lang)}
                </em>
              </li>
            ))}
          </ul>

          {notes.length > 0 && (
            <ul className="sf-notes">
              {notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          )}

          {result.dataQuality === 'generic' && <p className="sf-hint sf-hint--warn">{t('dataQualityGeneric')}</p>}
        </div>
      )}

      {result.alternative && (
        <button
          type="button"
          className="sf-alt"
          onClick={() => onPickAlternative(result.alternative!.eu)}
          disabled={result.alternative.availability === 'not_offered'}
        >
          <span className="sf-alt__text">
            <small>{t('alternativeTitle')}</small>
            <strong>EU {formatSize(result.alternative.eu, lang)}</strong>
            <small>{lang === 'tr' ? result.alternative.reasonTr : result.alternative.reasonEn}</small>
          </span>
          <StockBadge availability={result.alternative.availability} labels={stockLabels} />
        </button>
      )}

      {inventory.source !== 'none' && (
        <p className="sf-hint sf-hint--muted">
          {lang === 'tr'
            ? `Bu üründe ${inventory.offeredEuSizes.length} numara satılıyor, ${inventory.inStockEuSizes.length} tanesi stokta.`
            : `${inventory.offeredEuSizes.length} sizes offered here, ${inventory.inStockEuSizes.length} in stock.`}
        </p>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Geri bildirim şeridi                                                        */
/* -------------------------------------------------------------------------- */

interface FeedbackPromptProps {
  t: Translator
  lang: Lang
  brand: string
  eu: number
  onAnswer: (outcome: 'too_small' | 'perfect' | 'too_large') => void
  onDismiss: () => void
}

export function FeedbackPrompt({ t, lang, brand, eu, onAnswer, onDismiss }: FeedbackPromptProps) {
  return (
    <div className="sf-feedback" role="region" aria-label={t('feedbackQuestion', { brand, size: formatSize(eu, lang) })}>
      <p className="sf-feedback__question">
        {t('feedbackQuestion', { brand, size: formatSize(eu, lang) })}
      </p>
      <div className="sf-feedback__actions">
        <button type="button" className="sf-btn sf-btn--tiny" onClick={() => onAnswer('too_small')}>
          {t('feedbackSmall')}
        </button>
        <button type="button" className="sf-btn sf-btn--tiny" onClick={() => onAnswer('perfect')}>
          {t('feedbackPerfect')}
        </button>
        <button type="button" className="sf-btn sf-btn--tiny" onClick={() => onAnswer('too_large')}>
          {t('feedbackLarge')}
        </button>
      </div>
      <button type="button" className="sf-feedback__dismiss" onClick={onDismiss}>
        {t('feedbackDismiss')}
      </button>
    </div>
  )
}
