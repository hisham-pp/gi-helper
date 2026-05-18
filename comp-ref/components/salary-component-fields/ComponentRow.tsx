'use client';

import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import FormCheckBox from '@/core/components/app-checkbox/FormCheckBox';
import Translations from '@/core/components/translations';
import {
  BenefitFrequency,
  SalaryComponentCalculationMethod,
  SalaryComponentName,
} from '@/enums/salary-components';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';
import useSalaryLabels from '@/hooks/use-salary-labels';
import { calculateCTC } from '@/utils/calculator';
import { roundToDecimalPlaces } from '@/utils/numerical-utils';
import { TextFieldWithEndLabel } from './HelperComponents';
import SalaryTable from './SalaryTable';
import {
  ComponentLabel,
  CustomTextField,
  FixedAmountLabel,
  StyledTableCell,
  StyledTableCellRight,
} from './styled-components';
import { ComponentRowProps } from './types';

const { PERCENTAGE, FLAT_AMOUNT } = SalaryComponentCalculationMethod;
const { VARIABLE_DEARNESS } = SalaryComponentName;

const FREQUENCY_LABELS: Record<BenefitFrequency, string> = {
  [BenefitFrequency.MONTHLY]: 'Monthly',
  [BenefitFrequency.YEARLY]: 'Yearly',
  [BenefitFrequency.ONE_TIME]: 'One-time',
};

const ComponentRow: React.FC<ComponentRowProps> = ({
  allowMonthlyAmountEdit,
  name,
  percentage,
  percentageOfBasic,
  value,
  showCalculationTypeField,
  showPercentage,
  isYearlyCTC,
  calculationMethod,
  additionalText,
  nameCellProps,
  nameCellSx,
  onAmountChange,
  isVdaEnabled,
  isViewMode,
  isNotAffectedByCTC,
  formula,
  benefitFrequency,
  handleVdaChange,
}) => {
  const { formateCurrency } = useCurrencyFormatter();
  const { getSalaryLabel } = useSalaryLabels();
  const isCalculationMethodPercentageOfCTC = useMemo(
    () => calculationMethod === PERCENTAGE,
    [calculationMethod],
  );

  const renderCalculationType = () => {
    if (!showCalculationTypeField) return null;

    if (benefitFrequency) {
      return (
        <StyledTableCell sx={{ flex: 1, display: 'flex', justifyContent: 'start' }}>
          <FixedAmountLabel>{FREQUENCY_LABELS[benefitFrequency]}</FixedAmountLabel>
        </StyledTableCell>
      );
    }

    return (
      <StyledTableCell sx={{ flex: 1, display: 'flex', justifyContent: 'start' }}>
        {formula ? (
          <FixedAmountLabel>{formula}</FixedAmountLabel>
        ) : calculationMethod === FLAT_AMOUNT ? (
          <FixedAmountLabel>Flat Amount</FixedAmountLabel>
        ) : (
          <TextFieldWithEndLabel
            value={roundToDecimalPlaces(
              Number(isCalculationMethodPercentageOfCTC ? percentage : percentageOfBasic) || 0,
            )}
            endAdornmentLabel={
              isCalculationMethodPercentageOfCTC ? `% of ${getSalaryLabel('ctc')}` : '% of Basic'
            }
          />
        )}
      </StyledTableCell>
    );
  };

  // Compute display values based on benefit frequency
  const displayValues = useMemo(() => {
    const raw = Number(value ?? 0);
    if (!benefitFrequency) return { monthly: raw, annual: null }; // null = use default CTC calc

    switch (benefitFrequency) {
      case BenefitFrequency.YEARLY:
        return { monthly: roundToDecimalPlaces(raw / 12), annual: raw };
      case BenefitFrequency.ONE_TIME:
        return { monthly: '-', annual: raw };
      case BenefitFrequency.MONTHLY:
      default:
        return { monthly: raw, annual: roundToDecimalPlaces(raw * 12) };
    }
  }, [value, benefitFrequency]);

  // For benefits: MONTHLY edits in monthly column, YEARLY/ONE_TIME edits in annual column
  const isBenefitMonthlyEditable =
    allowMonthlyAmountEdit && benefitFrequency === BenefitFrequency.MONTHLY;
  const isBenefitAnnualEditable =
    allowMonthlyAmountEdit && benefitFrequency && benefitFrequency !== BenefitFrequency.MONTHLY;

  const renderMonthlyAmount = () => (
    <StyledTableCellRight value={value} sx={{ display: 'flex', justifyContent: 'end' }}>
      {allowMonthlyAmountEdit && !benefitFrequency ? (
        <CustomTextField
          size='small'
          value={roundToDecimalPlaces(value ?? 0)}
          onChange={onAmountChange}
        />
      ) : isBenefitMonthlyEditable ? (
        <CustomTextField
          size='small'
          value={roundToDecimalPlaces(value ?? 0)}
          onChange={onAmountChange}
        />
      ) : displayValues.monthly === '-' ? (
        '-'
      ) : (
        formateCurrency(roundToDecimalPlaces(displayValues.monthly ?? 0))
      )}
    </StyledTableCellRight>
  );

  const renderAnnualAmount = () => (
    <StyledTableCellRight value={value}>
      {isBenefitAnnualEditable ? (
        <CustomTextField
          size='small'
          value={roundToDecimalPlaces(value ?? 0)}
          onChange={onAmountChange}
        />
      ) : (
        formateCurrency(
          displayValues.annual != null ? displayValues.annual : calculateCTC(value, 0, false),
        )
      )}
    </StyledTableCellRight>
  );

  return (
    <SalaryTable>
      <StyledTableCell sx={{ flex: 1 }} {...nameCellProps}>
        <ComponentLabel sx={nameCellSx} component='div'>
          <Translations text={name} />
          {showPercentage && percentage && (
            <span className='percentage'>{`(${roundToDecimalPlaces(percentage)}% ${getSalaryLabel('ctc')})`}</span>
          )}
          {isNotAffectedByCTC && <span className='tag'>Interim</span>}
          {additionalText && <Typography className='info'>{additionalText}</Typography>}
        </ComponentLabel>
      </StyledTableCell>
      {name === VARIABLE_DEARNESS ? (
        <StyledTableCell sx={{ minWidth: 40, flex: 'none' }}>
          <FormCheckBox checked={isVdaEnabled} onChange={handleVdaChange} disabled={isViewMode} />
        </StyledTableCell>
      ) : (
        <StyledTableCell />
      )}
      {renderCalculationType()}
      {isYearlyCTC && (
        <StyledTableCellRight value={value}>
          {formateCurrency(
            displayValues.annual != null ? displayValues.annual : calculateCTC(value),
          )}
        </StyledTableCellRight>
      )}
      {renderMonthlyAmount()}
      {!isYearlyCTC && renderAnnualAmount()}
    </SalaryTable>
  );
};

export default ComponentRow;
