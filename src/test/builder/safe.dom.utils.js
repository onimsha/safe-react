// @flow
import * as React from 'react'
import TestUtils from 'react-dom/test-utils'
import ListItemText from '~/components/List/ListItemText/index'
import { SEE_MULTISIG_BUTTON_TEXT } from '~/routes/safe/component/Safe/MultisigTx'
import fetchTransactions from '~/routes/safe/store/actions/fetchTransactions'
import { sleep } from '~/utils/timer'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import AppRoutes from '~/routes'
import { SAFELIST_ADDRESS, SETTINS_ADDRESS } from '~/routes/routes'
import { history, type GlobalState } from '~/store'
import { EMPTY_DATA } from '~/logic/wallets/ethTransactions'

export const EXPAND_BALANCE_INDEX = 0
export const EXPAND_OWNERS_INDEX = 1
export const ADD_OWNERS_INDEX = 2
export const EDIT_THRESHOLD_INDEX = 3
export const EDIT_INDEX = 4
export const WITHDRAW_INDEX = 5
export const LIST_TXS_INDEX = 6

export const listTxsClickingOn = async (store: Store, seeTxsButton: Element, safeAddress: string) => {
  await store.dispatch(fetchTransactions(safeAddress))
  await sleep(1200)
  expect(seeTxsButton.getElementsByTagName('span')[0].innerHTML).toEqual(SEE_MULTISIG_BUTTON_TEXT)
  TestUtils.Simulate.click(seeTxsButton)

  // give some time to expand the transactions
  await sleep(800)
}

export const checkMinedTx = (Transaction: React$Component<any, any>, name: string) => {
  const paragraphs = TestUtils.scryRenderedDOMComponentsWithTag(Transaction, 'p')

  const status = 'Already executed'
  const nameParagraph = paragraphs[0].innerHTML
  const statusParagraph = paragraphs[2].innerHTML
  const hashParagraph = paragraphs[3].innerHTML

  expect(nameParagraph).toContain(name)
  expect(statusParagraph).toContain(status)
  expect(hashParagraph).not.toBe('')
  expect(hashParagraph).not.toBe(undefined)
  expect(hashParagraph).not.toBe(null)
  expect(hashParagraph).toContain(EMPTY_DATA)
}

export const getListItemsFrom = (Transaction: React$Component<any, any>) =>
  TestUtils.scryRenderedComponentsWithType(Transaction, ListItemText)

export const expand = async (Transaction: React$Component<any, any>) => {
  const listItems = getListItemsFrom(Transaction)
  if (listItems.length > 4) {
    return
  }

  TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithTag(listItems[2], 'p')[0])
  await sleep(1000)

  const listItemsExpanded = getListItemsFrom(Transaction)
  const threshold = listItemsExpanded[5]

  TestUtils.Simulate.click(TestUtils.scryRenderedDOMComponentsWithTag(threshold, 'p')[0])
  await sleep(1000)
}

export const checkPendingTx = async (
  Transaction: React$Component<any, any>,
  safeThreshold: number,
  name: string,
  statusses: string[],
) => {
  await expand(Transaction)
  const listItems = getListItemsFrom(Transaction)

  const txName = listItems[0]
  expect(txName.props.secondary).toContain(name)

  const thresholdItem = listItems[5]
  expect(thresholdItem.props.secondary).toContain(`confirmation${safeThreshold === 1 ? '' : 's'} needed`)

  for (let i = 0; i < statusses.length; i += 1) {
    const ownerIndex = i + 6
    const ownerParagraph = listItems[ownerIndex].props.primary

    expect(statusses[i]).toEqual(ownerParagraph)
  }
}

export const refreshTransactions = async (store: Store<GlobalState>, safeAddress: string) => {
  await store.dispatch(fetchTransactions(safeAddress))
  await sleep(1500)
}

const createDom = (store: Store): React$Component<{}> => (
  TestUtils.renderIntoDocument((
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <AppRoutes />
      </ConnectedRouter>
    </Provider>
  ))
)

export const travelToSafe = (store: Store, address: string): React$Component<{}> => {
  history.push(`${SAFELIST_ADDRESS}/${address}`)

  return createDom(store)
}

export const travelToTokens = (store: Store, address: string): React$Component<{}> => {
  const url = `${SAFELIST_ADDRESS}/${address}${SETTINS_ADDRESS}`
  history.push(url)

  return createDom(store)
}
