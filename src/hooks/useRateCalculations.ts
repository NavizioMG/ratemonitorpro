import { useMemo } from 'react';
import { Client } from '../types/database';
import { debug, Category } from '../lib/debug';
import { createNotification } from '../services/notifications';
import { useAuth } from '../contexts/AuthContext';

const COMPONENT_ID = 'RateCalculations';

interface RateCalculations {
  clientsAtTargetRate: number;
  clientsAboveRate: number;
  totalSavings: number;
  rateStatuses: Map<string, {
    isTargetMet: boolean;
    savingsAmount: number;
    percentageToTarget: number;
  }>;
}

function compareRates(currentRate: number, targetRate: number): boolean {
  try {
    const current = Number(currentRate.toFixed(3));
    const target = Number(targetRate.toFixed(3));
    return current <= target;
  } catch (err) {
    debug.logError(Category.RATES, 'Error comparing rates', { currentRate, targetRate }, err);
    return false;
  }
}

function calculateMonthlyPayment(principal: number, annualRate: number, years: number): number {
  try {
    const monthlyRate = (annualRate / 100) / 12;
    const numberOfPayments = years * 12;
    
    if (monthlyRate === 0) return principal / numberOfPayments;
    
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  } catch (err) {
    debug.logError(Category.RATES, 'Error calculating monthly payment', { principal, annualRate, years }, err);
    return 0;
  }
}

export function useRateCalculations(clients: Client[], currentMarketRate: number): RateCalculations {
  const { session } = useAuth();

  return useMemo(() => {
    try {
      const rateStatuses = new Map();
      let clientsAtTargetRate = 0;
      let clientsAboveRate = 0;
      let totalSavings = 0;

      // Use a default market rate if none is available
      const effectiveMarketRate = currentMarketRate || 6.5; // Default to 6.5% if no rate available
      debug.logInfo(Category.RATES, 'Using market rate', { 
        currentMarketRate,
        effectiveMarketRate,
        clientCount: clients.length
      }, COMPONENT_ID);

      clients.forEach(client => {
        const mortgage = client.mortgages?.[0];
        if (!mortgage) {
          debug.logWarning(Category.RATES, 'Client missing mortgage data', { clientId: client.id });
          return;
        }

        try {
          const isTargetMet = compareRates(effectiveMarketRate, mortgage.target_rate);
          const wasTargetMet = compareRates(mortgage.current_rate, mortgage.target_rate);
          
          // Create notification if target is newly met
          if (isTargetMet && !wasTargetMet && session?.user?.id) {
            createNotification({
              userId: session.user.id,
              title: 'Rate Target Met',
              message: `Current market rate (${effectiveMarketRate.toFixed(3)}%) has met the target rate for ${client.first_name} ${client.last_name}`,
              type: 'rate'
            }).catch(error => {
              debug.logError(Category.API, 'Failed to create rate notification', {}, error, COMPONENT_ID);
            });
          }
          
          const currentPayment = calculateMonthlyPayment(
            mortgage.loan_amount,
            mortgage.current_rate,
            mortgage.term_years
          );
          
          const newPayment = calculateMonthlyPayment(
            mortgage.loan_amount,
            effectiveMarketRate,
            mortgage.term_years
          );
          
          const savingsAmount = Math.max(0, currentPayment - newPayment);

          if (isTargetMet) {
            clientsAtTargetRate++;
          }
          
          if (mortgage.current_rate > effectiveMarketRate) {
            clientsAboveRate++;
            totalSavings += savingsAmount;
          }

          const totalRateSpread = mortgage.current_rate - mortgage.target_rate;
          const currentProgress = mortgage.current_rate - effectiveMarketRate;
          const percentageToTarget = totalRateSpread > 0 
            ? Math.min(100, Math.max(0, (currentProgress / totalRateSpread) * 100))
            : isTargetMet ? 100 : 0;

          rateStatuses.set(client.id, {
            isTargetMet,
            savingsAmount,
            percentageToTarget
          });

          debug.logInfo(Category.RATES, 'Rate status calculated', {
            clientId: client.id,
            currentRate: mortgage.current_rate,
            targetRate: mortgage.target_rate,
            marketRate: effectiveMarketRate,
            isTargetMet,
            percentageToTarget,
            savingsAmount
          }, COMPONENT_ID);
        } catch (err) {
          debug.logError(Category.RATES, 'Error calculating rate status for client', {
            clientId: client.id
          }, err, COMPONENT_ID);
        }
      });

      return {
        clientsAtTargetRate,
        clientsAboveRate,
        totalSavings,
        rateStatuses
      };
    } catch (error) {
      debug.logError(Category.RATES, 'Error in rate calculations', {}, error, COMPONENT_ID);
      return {
        clientsAtTargetRate: 0,
        clientsAboveRate: 0,
        totalSavings: 0,
        rateStatuses: new Map()
      };
    }
  }, [clients, currentMarketRate, session?.user?.id]);
}