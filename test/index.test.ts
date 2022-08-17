import mapCache from '../src/index'

interface IData {
  data: string
}

describe('mapCache', () => {
  beforeEach(() => {
    mapCache.clear()
    jest.clearAllMocks()
  })

  const callbackReturnData: IData = { data: 'somedata' }
  const callback = jest.fn(async () => Promise.resolve(callbackReturnData))

  const key = 'KEY'

  it('should call the callback and return new data if there is no cached data', async () => {
    const data = await mapCache.fetch<IData>({ key, callback })

    expect(callback).toHaveBeenCalled()
    expect(data).toMatchObject(callbackReturnData)
  })

  it('calls the callback only once if data is cached', async () => {
    await mapCache.fetch<IData>({ key, callback })
    await mapCache.fetch<IData>({ key, callback })

    expect(callback).toHaveBeenCalledTimes(1)
    expect(mapCache.size()).toBe(1)
  })

  it('does not overwrite data if values are cached', async () => {
    const data1 = await mapCache.fetch<IData>({ key, callback })
    const data2 = await mapCache.fetch<IData>({
      key,
      callback: async () => Promise.resolve({ data: 'some other data' })
    })

    expect(data1).toMatchObject(callbackReturnData)
    expect(data1).toMatchObject(data2)
  })

  it('calls the callback if the data has expired', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2022-01-01T00:00:00.000'))

    await mapCache.fetch<IData>({ key, callback, expiresInSeconds: 10 })

    jest.useFakeTimers().setSystemTime(new Date('2022-01-01T00:00:11.000'))

    await mapCache.fetch<IData>({ key, callback, expiresInSeconds: 10 })

    jest.useFakeTimers().setSystemTime(new Date('2022-01-01T00:00:22.000'))

    expect(callback).toHaveBeenCalledTimes(2)
    expect(mapCache.size()).toBe(1)

    jest.useRealTimers()
  })

  it('re-calls the callback if the params changed', async () => {
    await mapCache.fetch<IData>({ key, params: { date: new Date('2021/10/02') }, callback })
    await mapCache.fetch<IData>({ key, params: { date: new Date('2020/10/02') }, callback })

    expect(callback).toHaveBeenCalledTimes(2)
    expect(mapCache.size()).toBe(2)
  })

  it('clears the cache', async () => {
    await mapCache.fetch<IData>({ key, callback })
    await mapCache.fetch<IData>({ key: 'ANOTHER_KEY', callback })

    expect(mapCache.size()).toBe(2)
    mapCache.clear()
    expect(mapCache.size()).toBe(0)
  })

  it('returns the number of cached values', async () => {
    await mapCache.fetch<IData>({ key, callback })
    await mapCache.fetch<IData>({ key: 'ANOTHER_KEY', callback })

    expect(mapCache.size()).toBe(2)
  })

  it('deletes cached values after expiration time when delete is true', async () => {
    await mapCache.fetch<IData>({ key, callback, expiresInSeconds: 1, deleteOnExpiry: true })

    expect(mapCache.size()).toBe(1)
    await new Promise(resolve => setTimeout(resolve, 1050)); // wait a little longer than 1s
    expect(mapCache.size()).toBe(0)
  })
  
})
