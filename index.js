const ReadyResource = require('ready-resource')
const IdEnc = require('hypercore-id-encoding')
const HyperDB = require('hyperdb')

const spec = require('./spec/hyperdb')

class Registry extends ReadyResource {
  constructor (core) {
    super()
    this.db = HyperDB.bee(core, spec, { autoUpdate: true })
  }

  get publicKey () {
    console.log(this.db.core.key)
    return this.db.core.key
  }

  get discoveryKey () {
    return this.db.core.discoveryKey
  }

  async _open () {
    await this.db.ready()
  }

  async _close () {
    await this.db.close()
  }

  async put ({ name, driveKey, type, description = null, owner = null }) {
    driveKey = IdEnc.decode(driveKey)
    if (!this.opened) await this.ready()

    const tx = this.db.transaction()
    await tx.insert('@registry/entry', { name, driveKey, type, description, owner })
    await tx.flush()
  }

  async get (name) {
    if (!this.opened) await this.ready()

    const entry = await this.db.get('@registry/entry', { name })
    if (!entry) {
      throw new Error(`Entry with name "${name}" does not exist.`)
    }
    return entry
  }

  async getByDriveKey (driveKey) {
    driveKey = IdEnc.decode(driveKey)
    if (!this.opened) await this.ready()

    const entry = await this.db.findOne(
      '@registry/entry-by-drive-key',
      { gte: { driveKey }, lte: { driveKey } }
    )

    return entry
  }

  getEntriesOfType (type) {
    return this.db.find(
      '@registry/entry-by-type',
      { gte: { type }, lte: { type } }
    )
  }

  // Deletes an entry from '@registry/entry' collection by its name.
  async delete (name) {
    // Ensure the database is ready before performing any operations.
    if (!this.opened) await this.ready()

    // Create a transaction to perform the delete operation.
    const tx = this.db.transaction()

    // Delete the entry
    await tx.delete('@registry/entry', { name })

    // Flush the transaction to persist the changes to the database.
    await tx.flush()
  }
}

module.exports = Registry
