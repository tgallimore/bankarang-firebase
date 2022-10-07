/**
 * Connected bank account
 */
type Account = {
  uid: string
  account_id: string
  autorised: Date
  expires: Date
  token: string
  refresh_token: string
  nickname: string
  type: 'current' | 'saving'
  balance_pots: {
    [id: string]: {
      id: string
      title: string
      saving: {
        target_date: Date
        target_amount: number
      }
    }
  }
  current: {
    budgets: {
      [title: string]: {
        max: number,
        expected: number
      }
    }
    auto_saving: {
      round_outgoing: boolean
      percent_incoming: number
      account_id: string
    }
  }
  connection_data: {
    account_id: string
    display_name: string
    account_type: string
    currency: string
    provider: {
      logo_uri: string
      display_name: string
      provider_id: string
    }
    account_number: {
      iban: string
      number: string
      sort_code: string
      swift_bic: string
    }
  }
  connection_latest_balance: {
    available: number
    currency: string
    current: number
    overdraft: number
  }
}

/**
 * One for each transaction
 * Synced with TrueLayer
 */
type BankTransaction = {
  uid: string
  title: string
  date: Date
  amount: number
  account_id: string
  receipt: string
  subscription: string
  auto_saving: {
    amount: number
    rule: {
      type: 'percent_incoming' | 'round_outgoing'
      percent_incoming: number
    }
  }
  categories: {
    report_category: string
    budget_category: string
    allocation: number
  }[]
  connection_data: {
    account: string,
    amount: number,
    currency: string,
    date: string,
    description: string,
    meta: {
      provider_category: string,
      provider_id: string,
      provider_reference: string,
      transaction_type: string,
    },
    normalised_provider_transaction_id: string,
    provider_transaction_id: string,
    running_balance: number,
    subtitle: string,
    timestamp: string,
    title: string,
    transaction_category: string,
    transaction_classification: [
      general: string,
      specific: string
    ],
    transaction_id: string,
    transaction_type: string,
  }
}

/**
 * Once for each recurring bank transaction
 */
type Subscription = {
  uid: string
  latest: BankTransaction
  recurring: string
  transactions: string[]
}

/**
 * Used for balance pot and pending transactions
 * Any transaction that hasn't actually happened
 */
type Transaction = {
  uid: string
  title: string
  date: Date
  amount: number
  account_id: string
  type: 'pending' | 'balance_pot'
  pending: {
    categories: {
      report_category: string
      budget_category: string
      allocation: number
    }[]
  }
  balance_pot: {
    id: string
    recurring: string
    start_date: string
  }
}


/**
 * These will be loaded once when the user starts to the app
 * 
 * Queried by documentID which is uid
 */
type Settings = {
  uid: string
  cycle_start: string
  primary_account: string
}

