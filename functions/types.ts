/**
 * Connected bank account
 * Part of BankConnections
 */
type Account = {
  account_id: string
  registered: string
  authorised: string
  primary: boolean
}
/**
 * Load all at once durring middleware for:
 * Transactions
 * Accounts
 * Balances
 * 
 * Queried by: { uid }
 */
type BankConnection = {
  accounts: Account[]
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
  bankAccountId: string
  transactionId: string
  date: Date
  amount: number
  budgetTitle?: string
  saving?: {
    savingPotId: string,
    rule: SavingPotRule,
    amount: number
  }
}

/**
 * We assume most of these will be recurring
 * These will be loaded per time period
 * Annual overview will load them all for the upcoming year
 * 
 * Queried by: { uid, account_id, date? }
 */
type Transaction = {
  uid: string
  transaction_id?: string
  account: string
  type: 'pending' | 'saving'
  amount: number
  date: string
  title: string | null
  subtitle: string | null
  recurring?: string | null
  savingPot?: string | null
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
  target?: number
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

