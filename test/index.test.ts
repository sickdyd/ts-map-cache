import memCache from '../src/index'

interface IData {
  data: string
}

describe('memCache', () => {
  beforeEach(() => {
    memCache.clear()
    jest.clearAllMocks()
  })

  const callbackReturnData: IData = { data: 'somedata' }
  const callback = jest.fn(async () => Promise.resolve(callbackReturnData))

  const key = 'KEY'

  it('should call the callback and return new data if there is no cached data', async () => {
    const data = await memCache.fetch<IData>({ key, callback })

    expect(callback).toHaveBeenCalled()
    expect(data).toMatchObject(callbackReturnData)
  })

  it('calls the callback only once if data is cached', async () => {
    await memCache.fetch<IData>({ key, callback })
    await memCache.fetch<IData>({ key, callback })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(memCache.size()).toBe(1)
  })

  it('does not overwrite data if values are cached', async () => {
    const data1 = await memCache.fetch<IData>({ key, callback })
    const data2 = await memCache.fetch<IData>({
      key,
      callback: async () => Promise.resolve({ data: 'some other data' })
    })

    expect(data1).toMatchObject(callbackReturnData)
    expect(data1).toMatchObject(data2)
  })

  it('calls the callback if the data has expired', async () => {
    await memCache.fetch<IData>({ key, callback, expiresInSeconds: -1 })
    await memCache.fetch<IData>({ key, callback, expiresInSeconds: -1 })

    expect(callback).toHaveBeenCalledTimes(2)
    expect(memCache.size()).toBe(1)
  })

  it('re-calls the callback if the params changed', async () => {
    await memCache.fetch<IData>({ key, params: { date: new Date('2021/10/02') }, callback })
    await memCache.fetch<IData>({ key, params: { date: new Date('2020/10/02') }, callback })

    expect(callback).toHaveBeenCalledTimes(2)
    expect(memCache.size()).toBe(2)
  })

  it('clears the cache', async () => {
    await memCache.fetch<IData>({ key, callback })
    await memCache.fetch<IData>({ key: 'ANOTHER_KEY', callback })

    expect(memCache.size()).toBe(2)
    memCache.clear()
    expect(memCache.size()).toBe(0)
  })

  it('returns the number of cached values', async () => {
    await memCache.fetch<IData>({ key, callback })
    await memCache.fetch<IData>({ key: 'ANOTHER_KEY', callback })

    expect(memCache.size()).toBe(2)
  })
})
