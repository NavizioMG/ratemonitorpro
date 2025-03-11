/**
 * Calculates the monthly payment for a mortgage loan.
 * Uses the standard amortization formula: PMT = P * (r(1+r)^n) / ((1+r)^n - 1)
 * where:
 * - PMT = Monthly Payment
 * - P = Principal (loan amount)
 * - r = Monthly interest rate (annual rate / 12)
 * - n = Total number of payments (years * 12)
 * 
 * @param principal The loan amount
 * @param annualRate The annual interest rate as a percentage (e.g., 6.5 for 6.5%)
 * @param years The loan term in years
 * @returns The monthly payment amount rounded to 2 decimal places
 * @throws Error if inputs are invalid
 */
export function calculateMonthlyPayment(principal: number, annualRate: number, years: number): number {
  // Input validation
  if (!Number.isFinite(principal) || principal <= 0) {
    throw new Error('Principal must be a positive number');
  }
  
  if (!Number.isFinite(annualRate) || annualRate < 0) {
    throw new Error('Annual rate must be a non-negative number');
  }
  
  if (!Number.isInteger(years) || years <= 0) {
    throw new Error('Years must be a positive integer');
  }

  // Convert annual rate to monthly decimal rate
  const monthlyRate = (annualRate / 100) / 12;
  const numberOfPayments = years * 12;

  // Handle special case of 0% interest
  if (monthlyRate === 0) {
    return Number((principal / numberOfPayments).toFixed(2));
  }

  try {
    // Use high precision calculation
    const payment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    // Round to 2 decimal places and ensure valid number
    const roundedPayment = Number(payment.toFixed(2));
    
    if (!Number.isFinite(roundedPayment)) {
      throw new Error('Payment calculation resulted in invalid number');
    }

    return roundedPayment;
  } catch (error) {
    throw new Error('Failed to calculate monthly payment: ' + error.message);
  }
}

/**
 * Calculates the total interest paid over the life of the loan.
 * 
 * @param principal The loan amount
 * @param annualRate The annual interest rate as a percentage
 * @param years The loan term in years
 * @returns The total interest paid rounded to 2 decimal places
 */
export function calculateTotalInterest(principal: number, annualRate: number, years: number): number {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, years);
  const totalPayments = monthlyPayment * years * 12;
  return Number((totalPayments - principal).toFixed(2));
}

/**
 * Calculates the annual percentage rate (APR) including fees.
 * 
 * @param principal The loan amount
 * @param annualRate The annual interest rate as a percentage
 * @param years The loan term in years
 * @param fees Total loan fees
 * @returns The APR as a percentage rounded to 3 decimal places
 */
export function calculateAPR(
  principal: number, 
  annualRate: number, 
  years: number,
  fees: number
): number {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, years);
  const adjustedPrincipal = principal - fees;
  const numberOfPayments = years * 12;
  
  // Use Newton's method to find APR
  let apr = annualRate;
  const tolerance = 0.0001;
  const maxIterations = 100;
  
  for (let i = 0; i < maxIterations; i++) {
    const monthlyRate = apr / 1200;
    const presentValue = monthlyPayment * 
      (1 - Math.pow(1 + monthlyRate, -numberOfPayments)) / 
      monthlyRate;
      
    if (Math.abs(presentValue - adjustedPrincipal) < tolerance) {
      break;
    }
    
    apr = apr - (presentValue - adjustedPrincipal) / 
      ((-monthlyPayment * numberOfPayments * 
        Math.pow(1 + monthlyRate, -numberOfPayments - 1)) / 1200);
  }
  
  return Number(apr.toFixed(3));
}

/**
 * Calculates the amortization schedule for a mortgage loan.
 * 
 * @param principal The loan amount
 * @param annualRate The annual interest rate as a percentage
 * @param years The loan term in years
 * @returns Array of monthly payment details including principal, interest and remaining balance
 */
export function calculateAmortizationSchedule(
  principal: number,
  annualRate: number,
  years: number
): Array<{
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}> {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, years);
  const monthlyRate = (annualRate / 100) / 12;
  const numberOfPayments = years * 12;
  const schedule = [];
  
  let remainingBalance = principal;
  
  for (let i = 0; i < numberOfPayments; i++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;
    
    schedule.push({
      payment: Number(monthlyPayment.toFixed(2)),
      principal: Number(principalPayment.toFixed(2)),
      interest: Number(interestPayment.toFixed(2)),
      balance: Number(Math.max(0, remainingBalance).toFixed(2))
    });
  }
  
  return schedule;
}