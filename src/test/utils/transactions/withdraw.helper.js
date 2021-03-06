// @flow
import TestUtils from 'react-dom/test-utils'
import { sleep } from '~/utils/timer'
import { checkBalanceOf } from '~/test/utils/tokenMovements'
import { checkMinedTx } from '~/test/builder/safe.dom.utils'
import { whenExecuted } from '~/test/utils/logTransactions'
import Withdraw from '~/routes/safe/component/Withdraw'

export const sendWithdrawForm = async (
  SafeDom: React$Component<any, any>,
  withdrawButton: React$Component<any, any>,
  amount: string,
  destination: string,
) => {
  // load add multisig form component
  TestUtils.Simulate.click(withdrawButton)
  // give time to re-render it
  await sleep(400)

  // fill the form
  const inputs = TestUtils.scryRenderedDOMComponentsWithTag(SafeDom, 'input')
  const amountInput = inputs[0]
  const destinationInput = inputs[1]
  TestUtils.Simulate.change(amountInput, { target: { value: amount } })
  TestUtils.Simulate.change(destinationInput, { target: { value: destination } })
  // $FlowFixMe
  const form = TestUtils.findRenderedDOMComponentWithTag(SafeDom, 'form')

  // submit it
  TestUtils.Simulate.submit(form)
  TestUtils.Simulate.submit(form)

  return whenExecuted(SafeDom, Withdraw)
}

export const checkMinedWithdrawTx = async (
  Transaction: React$Component<any, any>,
  name: string,
  address: string,
  funds: string,
) => {
  await checkBalanceOf(address, funds)

  checkMinedTx(Transaction, name)
}
