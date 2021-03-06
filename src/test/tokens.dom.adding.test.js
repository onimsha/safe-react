// @flow
import * as TestUtils from 'react-dom/test-utils'
import { getWeb3 } from '~/logic/wallets/getWeb3'
import { type Match } from 'react-router-dom'
import { promisify } from '~/utils/promisify'
import TokenComponent from '~/routes/tokens/component/Token'
import { getFirstTokenContract, getSecondTokenContract } from '~/test/utils/tokenMovements'
import { aNewStore } from '~/store'
import { aMinedSafe } from '~/test/builder/safe.redux.builder'
import { travelToTokens } from '~/test/builder/safe.dom.utils'
import { sleep } from '~/utils/timer'
import { buildMathPropsFrom } from '~/test/utils/buildReactRouterProps'
import { tokenListSelector } from '~/routes/tokens/store/selectors'
import { testToken } from '~/test/builder/tokens.dom.utils'
import * as fetchTokensModule from '~/routes/tokens/store/actions/fetchTokens'
import * as enhancedFetchModule from '~/utils/fetch'
import { clickOnAddToken, fillAddress, fillHumanReadableInfo } from '~/test/utils/tokens/addToken.helper'

describe('DOM > Feature > Add new ERC 20 Tokens', () => {
  let web3
  let accounts
  let firstErc20Token
  let secondErc20Token

  beforeAll(async () => {
    web3 = getWeb3()
    accounts = await promisify(cb => web3.eth.getAccounts(cb))
    firstErc20Token = await getFirstTokenContract(web3, accounts[0])
    secondErc20Token = await getSecondTokenContract(web3, accounts[0])

    // $FlowFixMe
    enhancedFetchModule.enhancedFetch = jest.fn()
    enhancedFetchModule.enhancedFetch.mockImplementation(() => Promise.resolve([
      {
        address: firstErc20Token.address,
        name: 'First Token Example',
        symbol: 'FTE',
        decimals: 18,
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Earth_simple_icon.png',
      },
    ]))
  })

  it('adds a second erc 20 token filling the form', async () => {
    // GIVEN
    const store = aNewStore()
    const safeAddress = await aMinedSafe(store)
    await store.dispatch(fetchTokensModule.fetchTokens(safeAddress))
    const TokensDom = await travelToTokens(store, safeAddress)
    await sleep(400)
    const tokens = TestUtils.scryRenderedComponentsWithType(TokensDom, TokenComponent)
    expect(tokens.length).toBe(2)
    testToken(tokens[0].props.token, 'FTE', false)
    testToken(tokens[1].props.token, 'ETH', true)

    // WHEN
    await clickOnAddToken(TokensDom)
    await fillAddress(TokensDom, secondErc20Token)
    await fillHumanReadableInfo(TokensDom)

    // THEN
    const match: Match = buildMathPropsFrom(safeAddress)
    const tokenList = tokenListSelector(store.getState(), { match })
    expect(tokenList.count()).toBe(3)

    testToken(tokenList.get(0), 'FTE', false)
    testToken(tokenList.get(1), 'ETH', true)
    testToken(tokenList.get(2), 'TKN', true)
  })
})
