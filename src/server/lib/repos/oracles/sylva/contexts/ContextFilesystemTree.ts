import IEventsGraphCollectionContextResponse from '../../../../../domain/IEventsGraphCollectionContextResponse'
import IEventsGraphCollectionContextRequest from '../../../../../domain/IEventsGraphCollectionContextRequest'
import { constants } from '../../../../../constants'
import { Context } from '../../../Context'
import IUpdateGraphDataCallback from '../../../../../domain/IUpdateGraphDataCallback'
import { SylvaConnectionManager } from '../SylvaConnectionManager'
import { SylvaEventBridge } from '../SylvaEventBridge'
import { flattenFsTree } from '../mappers/filesystem.mapper'
import { buildResponse } from '../../../../Utils'
import { logger } from '../../../../logger'
import type { SylvaFilesystemTreeResponse } from '../types'

class ContextFilesystemTree extends Context {

  protected _id: string = constants.SYLVA_FILESYSTEM_TREE_CONTEXT_ID

  private _conn: SylvaConnectionManager
  private _bridge: SylvaEventBridge

  constructor(conn: SylvaConnectionManager, bridge: SylvaEventBridge) {
    super()
    this._conn = conn
    this._bridge = bridge
  }

  public isStreamable(): boolean {
    return true
  }

  public async getData(
    request: IEventsGraphCollectionContextRequest,
  ): Promise<IEventsGraphCollectionContextResponse> {
    const channelId = request.params?.channelId
    const path = channelId
      ? `/api/filesystem/tree?channelId=${encodeURIComponent(channelId)}`
      : '/api/filesystem/tree'

    const res = await this._conn.fetch(path)
    if (!res.ok) throw new Error(`Filesystem tree fetch failed: ${res.status}`)

    const data = (await res.json()) as SylvaFilesystemTreeResponse
    const { nodes, links } = flattenFsTree(data.root)

    return buildResponse(request, { nodes, links }, undefined, data.root.id)
  }

  public getDataStream(
    request: IEventsGraphCollectionContextRequest,
    cb: IUpdateGraphDataCallback,
  ): void {
    this.getData(request)
      .then((snapshot) => {
        const relevantEvents = ['governance.receipt']

        const unsubscribe = this._bridge.subscribe(relevantEvents, (eventData) => {
          cb(null, buildResponse(request, undefined, eventData))
        })

        const closeStream = () => {
          logger.info('ContextFilesystemTree: stream closed')
          unsubscribe()
        }

        cb(null, snapshot, closeStream)
      })
      .catch((err) => {
        logger.error({ err }, 'ContextFilesystemTree: stream error')
        cb(err instanceof Error ? err : new Error(String(err)))
      })
  }
}

export default ContextFilesystemTree
