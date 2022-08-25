/**
 * Load all at once durring middleware for:
 * Transactions
 * Accounts
 * Balances
 * 
 * Queried by: { uid }
 */
type BankConnection = {
  accounts: string[]
  token: string
  refreshToken: string
  expires: Date
}

/**
 * Seems to be only used for budgets right now
 * Will be used for annual overview also
 * A budget will load some of these during a time period
 * Anual overview will load them all for a single or multiple budgets
 * 
 * Queried by: { uid, account_id, date }
 */
type BankTransaction = {
  transaction_id: string
  title: string
  amount: number
  subtitle: number
  date: Date
  category: string
}

/**
 * We assume most of these will be recurring
 * These will be loaded per time period
 * Annual overview will load them all for the upcoming year
 * 
 * Queried by: { uid, account_id, date? }
 */
type Transaction = {
  account: string
  type: 'pending' | 'saving'
  amount: number
  date: Date
  title: string
  subtitle?: string
  recurring?: string | null
  savingAccount?: string
}

/**
 * These will only ever be used by saving pots
 * They will load with a saving pot details
 * 
 * Queried by: Never
 */
type SavingPotRule = {
  type: 'roundOutgoing' | 'percentageIncoming'
  percentage?: number
}

/**
 * These will need to be loaded and given to the 
 * FinancialPeriodProvider, we'll load multiple of them for a single account
 * 
 * Queried by: { uid, account_id }
 */
type SavingPot = {
  title: string
  bankAccountId: string
  start?: Date
  rules?: SavingPotRule[]
}

/**
 * These will need to be loaded and given to the 
 * FinancialPeriodProvider, we'll load multiple of them for a single account
 * 
 * Queried by: { uid, account_id }
 */
type Budget = {
  title: string
  bankAccountId: string
  budget?: number
}

/**
 * These will be loaded once when the user starts to the app
 * 
 * Queried by documentID which is uid
 */
type UserSettings = {
  financialPeriod?: string
}

