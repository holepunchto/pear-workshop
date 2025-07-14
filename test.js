const test = require('brittle')
const Corestore = require('corestore')
const b4a = require('b4a')

const Registry = require('.')

test('put and get record', async t => {
  const { registry } = await setup(t)

  await registry.put({
    name: 'e1',
    driveKey: 'a'.repeat(64),
    type: 'type1'
  })

  const e1 = await registry.get('e1')
  t.alike(
    e1,
    {
      name: 'e1',
      driveKey: b4a.from('a'.repeat(64), 'hex'),
      type: 'type1',
      description: null
    },
    'put and get of entry without description'
  )

  await registry.put({
    name: 'e2',
    driveKey: 'b'.repeat(64),
    type: 'type1',
    description: 'I describe'
  })

  const e2 = await registry.get('e2')
  t.alike(
    e2,
    {
      name: 'e2',
      driveKey: b4a.from('b'.repeat(64), 'hex'),
      type: 'type1',
      description: 'I describe'
    },
    'put and get of entry with description'
  )
})

test('get by drive key', async t => {
  const { registry } = await setup(t)
  await addDefaultRecords(registry)

  t.is((await registry.getByDriveKey('a'.repeat(64))).name, 'e1')
  t.is((await registry.getByDriveKey('b'.repeat(64))).name, 'e2')
  t.is((await registry.getByDriveKey('f'.repeat(64))), null)
})

test('get entries of type', async t => {
  const { registry } = await setup(t)
  await addDefaultRecords(registry)

  const type1Entries = await consumeStream(
    registry.getEntriesOfType('type1'),
    e => e.name
  )
  t.alike(new Set(type1Entries), new Set(['e1', 'e2']))

  t.alike(
    await consumeStream(
      registry.getEntriesOfType('type2'),
      e => e.name
    ),
    ['e3']
  )

  t.alike(
    await consumeStream(registry.getEntriesOfType('notype')),
    []
  )
})

test.skip('get entries of owner', async t => {
  const { registry } = await setup(t)

  await registry.put({
    name: 'e1',
    driveKey: 'a'.repeat(64),
    type: 'type1',
    owner: 'John'
  })
  await registry.put({
    name: 'e2',
    driveKey: 'b'.repeat(64),
    type: 'type1',
    owner: 'Ann'
  })
  await registry.put({
    name: 'e3',
    driveKey: 'c'.repeat(64),
    type: 'type2',
    owner: 'John'
  })
  await registry.put({
    name: 'e4',
    driveKey: 'd'.repeat(64),
    type: 'type2'
    // no owner
  })

  const johnEntries = await consumeStream(
    registry.getEntriesOfOwner('John'),
    e => e.name
  )
  t.alike(new Set(johnEntries), new Set(['e1', 'e3']))

  t.alike(
    await consumeStream(
      registry.getEntriesOfOwner('Ann'),
      e => e.name
    ),
    ['e2']
  )

  t.alike(
    await consumeStream(registry.getEntriesOfOwner('notAnOwner')),
    []
  )
})

async function addDefaultRecords (registry) {
  await registry.put({
    name: 'e1',
    driveKey: 'a'.repeat(64),
    type: 'type1'
  })

  await registry.put({
    name: 'e2',
    driveKey: 'b'.repeat(64),
    type: 'type1'
  })

  await registry.put({
    name: 'e3',
    driveKey: 'c'.repeat(64),
    type: 'type2'
  })
}

async function setup (t) {
  const store = new Corestore(await t.tmp())
  const registry = new Registry(store.get({ name: 'registry' }))

  t.teardown(async () => {
    await registry.close()
    await store.close()
  })

  return { store, registry }
}

async function consumeStream (stream, mapper) {
  const res = []
  for await (const e of stream) res.push(mapper(e))
  return res
}
