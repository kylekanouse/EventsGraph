import IEventsGraphCollectionContextResponse from '../../../../../domain/IEventsGraphCollectionContextResponse'
import IEventsGraphCollectionContextRequest from '../../../../../domain/IEventsGraphCollectionContextRequest'
import { constants } from '../../../../../constants'
import { Context } from '../../../Context'
import IUpdateGraphDataCallback from '../../../../../domain/IUpdateGraphDataCallback'
import { SylvaConnectionManager } from '../SylvaConnectionManager'
import { SylvaEventBridge } from '../SylvaEventBridge'
import { gpaToNode, gpaDelegationLink, gpaChannelLink } from '../mappers/gpa.mapper'
import { buildResponse } from '../../../../Utils'
import { logger } from '../../../../logger'
import type { SylvaGPA, SylvaGPAListResponse } from '../types'

class ContextAgentTopology extends Context {

  protected _id: string = constants.SYLVA_AGENT_TOPOLOGY_CONTEXT_ID

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
    const wsId = request.params?.workspaceId || ''
    const queryParam = wsId ? `?workspaceId=${encodeURIComponent(wsId)}` : ''
    const res = await this._conn.fetch(`/api/gpa${queryParam}`)

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Sylva GPA fetch failed: ${res.status} ${body}`)
    }

    const data = (await res.json()) as SylvaGPAListResponse
    const gpas: SylvaGPA[] = data.items || []

    // Build nodes from GPAs
    const nodes = gpas.map(gpaToNode)

    // Build links: delegation chains + channel assignments
    const delegationLinks = gpas
      .filter((g) => g.parentGpaId)
      .map((g) => gpaDelegationLink(g.parentGpaId!, g.id))

    const channelLinks = gpas
      .filter((g) => g.channelId)
      .map((g) => gpaChannelLink(g.id, g.channelId!))

    const links = [...delegationLinks, ...channelLinks]

    // Root node: the GPA with no parent
    const rootId = gpas.find((g) => !g.parentGpaId)?.id || ''

    return buildResponse(request, { nodes, links }, undefined, rootId)
  }

  /**
   * getDataStream
   *
   * 1. Fetch initial graph snapshot via REST
   * 2. Send snapshot to client via callback with closeStream
   * 3. Subscribe to SSE events relevant to agent topology
   * 4. On each event, send IEventData via callback
   */
  public getDataStream(
    request: IEventsGraphCollectionContextRequest,
    cb: IUpdateGraphDataCallback,
  ): void {
    this.getData(request)
      .then((snapshot) => {
        const relevantEvents = [
          'governance.lifecycle',
          'gpa.execution.started',
          'gpa.execution.completed',
        ]

        const unsubscribe = this._bridge.subscribe(relevantEvents, (eventData) => {
          cb(null, buildResponse(request, undefined, eventData), closeStream)
        })

        const closeStream = () => {
          logger.info('ContextAgentTopology: stream closed')
          unsubscribe()
        }

        // Send initial snapshot with closeStream
        cb(null, snapshot, closeStream)
      })
      .catch((err) => {
        logger.error({ err }, 'ContextAgentTopology: stream initialization error')
        cb(err instanceof Error ? err : new Error(String(err)))
      })
  }
}

export default ContextAgentTopology
