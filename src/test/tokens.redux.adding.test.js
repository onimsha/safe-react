// @flow
import { getWeb3 } from '~/logic/wallets/getWeb3'
import { type Match } from 'react-router-dom'
import { promisify } from '~/utils/promisify'
import { getFirstTokenContract, getSecondTokenContract } from '~/test/utils/tokenMovements'
import { aNewStore } from '~/store'
import { aMinedSafe } from '~/test/builder/safe.redux.builder'
import { travelToSafe } from '~/test/builder/safe.dom.utils'
import { buildMathPropsFrom } from '~/test/utils/buildReactRouterProps'
import { testToken } from '~/test/builder/tokens.dom.utils'
import * as fetchTokensModule from '~/routes/tokens/store/actions/fetchTokens'
import * as enhancedFetchModule from '~/utils/fetch'
import { TOKEN_ADRESS_PARAM } from '~/routes/tokens/component/AddToken/FirstPage'
import { TOKEN_NAME_PARAM, TOKEN_DECIMALS_PARAM, TOKEN_SYMBOL_PARAM, TOKEN_LOGO_URL_PARAM } from '~/routes/tokens/component/AddToken/SecondPage'
import addToken from '~/routes/tokens/store/actions/addToken'
import { addTokenFnc } from '~/routes/tokens/component/AddToken'
import { activeTokensSelector } from '~/routes/tokens/store/selectors'

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

  it('persist added custom ERC 20 tokens as active when reloading the page', async () => {
    // GIVEN
    const store = aNewStore()
    const safeAddress = await aMinedSafe(store)
    await store.dispatch(fetchTokensModule.fetchTokens(safeAddress))

    const values = {
      [TOKEN_ADRESS_PARAM]: secondErc20Token.address,
      [TOKEN_NAME_PARAM]: 'Custom ERC20 Token',
      [TOKEN_SYMBOL_PARAM]: 'CTS',
      [TOKEN_DECIMALS_PARAM]: '10',
      [TOKEN_LOGO_URL_PARAM]: 'https://example.com',
    }

    const customAddTokensFn: any = (...args) => store.dispatch(addToken(...args))
    await addTokenFnc(values, customAddTokensFn, safeAddress)
    travelToSafe(store, safeAddress)

    // WHEN
    const reloadedStore = aNewStore()
    await reloadedStore.dispatch(fetchTokensModule.fetchTokens(safeAddress))
    travelToSafe(reloadedStore, safeAddress) // reload

    // THEN
    const match: Match = buildMathPropsFrom(safeAddress)
    const activeTokenList = activeTokensSelector(reloadedStore.getState(), { match })
    expect(activeTokenList.count()).toBe(2)

    testToken(activeTokenList.get(0), 'CTS', true)
    testToken(activeTokenList.get(1), 'ETH', true)
  })
})
