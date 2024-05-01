### Required tools:
- Unity Engine
- Node.js

### Game development cycle:
- In Unity build WebGL under project-root/build/game
- Run `yarn dev` (live reload) or `yarn build` to build javascript SDK for Unity TON
- Run `build/game` under server side environment e.g with `npx lr-http:server` to verify the result

### Game deployment:
- See [sst](https://sst.dev/) and read `sst.config.ts` for further details, basically run `npx sst deploy`

### Crawler development cycle:
- Run `npx ts-node libs/crawler/index.ts` to launch the crawler
- To have it bundled (for production) run `yarn build`
- Create .env file(s) under `libs/crawler` (optional) with following variables: `RPC_ENDPOINT` TON RPC endpoint, `ADMIN_WALLET` Admin walletaddress

### Mint Jetton token for testing:
- Do it at: https://minter.ton.org/
