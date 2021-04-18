# Map Cache

![status](https://github.com/sickdyd/ts-map-cache/actions/workflows/ci.yml/badge.svg)

Map Cache is a singleton class that caches the data returned from any function for a specified amount of time (defaults to 5 minutes). If the data has been cached and has not expired, Map Cache will return the cached data without calling the function, if there is no cached data, it will call the function and store its returned data.

It works both on Node.JS and [browsers that support](https://caniuse.com/atob-btoa) `btoa`. Under the hood it uses the JS `Map` object to store data.

## Motivation

I often have the need to cache the data I retrieve through API calls, but most of the packages available are outdated, not fully typed or don't do exactly what I need.

## Tooling

- TypeScript
- Jest
- Babel
- Prettier
- Eslint

## Tests

`yarn test`

The code has 100% coverage (tests are run both with `node` and `jsdom` to ensure compatibility with both).

## Parameters

`mapCache` exposes the `fetch`, `clear` and `size` methods.

The `fetch` method takes as parameter an object with the following properties:

| Property         | Optional | Default     | Description                                                            |
| ---------------- | -------- | ----------- | ---------------------------------------------------------------------- |
| key              | no       |             | An arbitrary string                                                    |
| params           | yes      |             | If the calback yelds differets data based on parameters, add them here |
| callback         | no       |             | The callback used to fetch the data you want to cache                  |
| expiresInSeconds | yes      | 300 (5 min) | How long the data will last in the cache                               |

```ts
// <T> is the type of the data that will be returned from callback
mapCache.fetch<T>({
  key: 'someKey', // an arbitrary string
  params: { id: 0 }, // optional
  callback: () => 'data', // the function returned data will be stored in the cache
  expiresInSeconds: 10 // optional, defaults to 5 minutes
})
```

The `clear` method clears the cache.

```ts
mapCache.clear()
```

The `size` method returns the number of entries stored in the cache.

```ts
console.log(mapCache.size())
```

## Usage

**Basic usage**

```ts
import mapCache from 'ts-map-cache'

async function basicExample() {
  const someFunction = async () => {
    console.log('I have been called!')
    return 'some_data'
  }

  const data1 = await mapCache.fetch<string>({ key: 'basicFunction', callback: someFunction })
  console.log(`it called the function and returned the data: ${data1}`)

  const data2 = await mapCache.fetch<string>({ key: 'basicFunction', callback: someFunction })
  console.log(`it returned the cached data: ${data2}`)
}

basicExample()
```

**With expiration**

```ts
import mapCache from 'ts-map-cache'

async function basicExampleWithExpiration() {
  const someFunction = async () => {
    console.log('I have been called!')
    return 'some_data'
  }

  const data = await mapCache.fetch<string>({
    key: 'basicFunction',
    callback: someFunction,
    expiresInSeconds: 1
  })
  console.log(`it called the function and returned the data: ${data}`)

  setTimeout(async () => {
    const data = await mapCache.fetch<string>({ key: 'basicFunction', callback: someFunction })
    console.log(`it re fetched the data: ${data}`)
  }, 2000)
}

basicExampleWithExpiration()
```

**With params**

Params is useful when the same function returns different values based on the parameters it receives. Passing the parameters also to the `fetch` method will automatically build an unique id for that function/returned data. It can be useful, for example, with `GraphQL` query resolvers.

```ts
import mapCache from 'ts-map-cache'

async function basicExampleWithParams() {
  const someFunction = async (params: { id: number }) => {
    console.log(`I have been called with id ${params.id}!`)
    return `some_data for id ${params.id}`
  }

  const params1 = { id: 0 }
  const data1 = await mapCache.fetch<string>({
    key: 'basicFunction',
    callback: async () => someFunction(params1),
    params: params1
  })

  console.log(`it called the function and returned the data: ${data1}`)

  const params2 = { id: 1 }
  const data2 = await mapCache.fetch<string>({
    key: 'basicFunction',
    callback: async () => someFunction(params2),
    params: params2
  })

  console.log(`it called the function and returned the data: ${data2}`)
}

basicExampleWithParams()
```

**With a network request**

```ts
import mapCache from 'ts-map-cache'
import axios from 'axios'

interface IData {
  userId: number
  id: number
  title: string
  completed: boolean
}

async function main() {
  const getData = async () => {
    return await axios
      .get('https://jsonplaceholder.typicode.com/todos/1')
      .then(({ data }) => data)
      .catch((err) => console.log(err))
  }

  // This request will appear on the network tab of the dev tools
  let data = await mapCache.fetch<IData>({ key: 'fetch', callback: getData })

  // This will not since it's getting the cached data
  data = await mapCache.fetch<IData>({ key: 'fetch', callback: getData })
}

main()
```
