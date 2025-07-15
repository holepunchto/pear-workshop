const path = require('path')
const HyperDB = require('hyperdb/builder')
const Hyperschema = require('hyperschema')

const SCHEMA_DIR = path.join(__dirname, 'spec', 'hyperschema')
const DB_DIR = path.join(__dirname, 'spec', 'hyperdb')

setupSchema()
setupDb()

function setupSchema () {
  const schema = Hyperschema.from(SCHEMA_DIR)
  const registry = schema.namespace('registry')

  registry.register({
    name: 'entry',
    fields: [
      {
        name: 'name',
        type: 'string',
        required: true
      },
      {
        name: 'driveKey',
        type: 'fixed32',
        required: true
      },
      {
        name: 'type',
        type: 'string',
        required: true
      },
      {
        name: 'description',
        type: 'string',
        required: false
      },
      {
        name: 'owner',
        type: 'string',
        required: false
      }
    ]
  })

  Hyperschema.toDisk(schema)
}

function setupDb () {
  const db = HyperDB.from(SCHEMA_DIR, DB_DIR)
  const dbNs = db.namespace('registry')

  dbNs.collections.register({
    name: 'entry',
    schema: '@registry/entry',
    key: ['name']
  })

  dbNs.indexes.register({
    name: 'entry-by-drive-key',
    collection: '@registry/entry',
    key: ['driveKey'],
    unique: true
  })
  dbNs.indexes.register({
    name: 'entry-by-type',
    collection: '@registry/entry',
    key: ['type']
  })
  dbNs.indexes.register({
    name: 'entry-by-owner',
    collection: '@registry/entry',
    key: ['owner']
  })

  HyperDB.toDisk(db)
}
