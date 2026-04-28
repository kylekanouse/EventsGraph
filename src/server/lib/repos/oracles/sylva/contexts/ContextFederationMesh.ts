import IEventsGraphCollectionContextResponse from '../../../../../domain/IEventsGraphCollectionContextResponse'
import IEventsGraphCollectionContextRequest from '../../../../../domain/IEventsGraphCollectionContextRequest'
import { constants } from '../../../../../constants'
import { Context } from '../../../Context'
import IUpdateGraphDataCallback from '../../../../../domain/IUpdateGraphDataCallback'
import IGraphNode from '../../../../../domain/IGraphNode'
import { SylvaConnectionManager } from '../SylvaConnectionManager'
import { SylvaEventBridge } from '../SylvaEventBridge'
import { federationPeerToNode, federationPeerLink } from '../mappers/federation.mapper'
import { buildResponse } from '../../../../Utils'
import { logger } from '../../../../logger'
import type { SylvaFederationPeerListResponse } from '../types'

class ContextFederationMesh extends Context {

  protected _id: string = constants.SYLVA_FEDERATION_MESH_CONTEXT_ID

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
    const res = await this._conn.fetch('/api/federation/peers')
    if (!res.ok) throw new Error(`Federation peers fetch failed: ${res.status}`)

    const data = (await res.json()) as SylvaFederationPeerListResponse
    const peers = data.items || []

    const localNodeId = 'local-instance'
    const localNode: IGraphNode = {
      id: localNodeId,
      group: 0,
      label: 'Local Instance',
      val: 60,
      desc: `Federation peers: ${peers.length}`,
      icon: '',
      type: 'instance',
      url: '',
      color: '#FFFFFF',
    }

    const peerNodes = peers.map(federationPeerToNode)
    const peerLinks = peers.map((p) => federationPeerLink(localNodeId, p.id, p.sharedChannels))

    return buildResponse(
      request,
      { nodes: [localNode, ...peerNodes], links: peerLinks },
      undefined,
      localNodeId,
    )
  }

  public getDataStream(
    request: IEventsGraphCollectionContextRequest,
    cb: IUpdateGraphDataCallback,
  ): void {
    this.getData(request)
      .then((snapshot) => {
        const relevantEvents = ['governance.lifecycle']

        const unsubscribe = this._bridge.subscribe(relevantEvents, (eventData) => {
          cb(null, buildResponse(request, undefined, eventData))
        })

        const closeStream = () => {
          logger.info('ContextFederationMesh: stream closed')
          unsubscribe()
        }

        cb(null, snapshot, closeStream)
      })
      .catch((err) => {
        logger.error({ err }, 'ContextFederationMesh: stream error')
        cb(err instanceof Error ? err : new Error(String(err)))
      })
  }
}

export default ContextFederationMesh
