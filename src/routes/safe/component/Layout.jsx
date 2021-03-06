// @flow
import * as React from 'react'
import NoSafe from '~/components/NoSafe'
import { type SelectorProps } from '~/routes/safe/container/selector'
import GnoSafe from './Safe'

type Props = SelectorProps

const Layout = ({
  safe, activeTokens, provider, userAddress,
}: Props) => (
  <React.Fragment>
    { safe
      ? <GnoSafe safe={safe} tokens={activeTokens} userAddress={userAddress} />
      : <NoSafe provider={provider} text="Not found safe" />
    }
  </React.Fragment>
)

export default Layout
