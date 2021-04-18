# Map Cache

![status](https://github.com/sickdyd/ts-map-cache/actions/workflows/ci.yml/badge.svg)

Map Cache is a singleton class that caches the data returned from any function for a specified amount of time (defaults to 5 minutes). If the data has been cached and has not expired, Map Cache will return the cached data without calling the function, if there is no cached data, it will call the function and store its returned data.

It works both on Node.JS and [browsers that support](https://caniuse.com/atob-btoa) `btoa`. Under the hood it uses the JS `Map` object to store data.

## Motivation

I often have the need to cache the data I retrieve through API calls, but most of the packages available are outdated, not fully typed or don't do exactly what I need.

## Usage

Basic usage

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

With Expiration

```ts
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

With Params

```ts
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

With network request

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

## Tech

- TypeScript

## Tests

`yarn test`
