import IEventsGraphCollectionContextResponse from '../../../../../domain/IEventsGraphCollectionContextResponse'
import IEventsGraphCollectionContextRequest from '../../../../../domain/IEventsGraphCollectionContextRequest'
import { constants } from '../../../../../constants'
import { Context } from '../../../Context'
import IUpdateGraphDataCallback from '../../../../../domain/IUpdateGraphDataCallback'
import { SylvaConnectionManager } from '../SylvaConnectionManager'
import { SylvaEventBridge } from '../SylvaEventBridge'
import {
  receiptToNode,
  receiptToGpaLink,
  receiptToChannelLink,
  receiptChainLink,
} from '../mappers/receipt.mapper'
import { gpaToNode } from '../mappers/gpa.mapper'
import { channelToNode } from '../mappers/channel.mapper'
import { buildResponse } from '../../../../Utils'
import { logger } from '../../../../logger'
import type {
  SylvaReceiptListResponse,
  SylvaGovernanceReceipt,
  SylvaGPA,
  SylvaChannel,
} from '../types'

class ContextGovernanceReceiptChain extends Context {

  protected _id: string = constants.SYLVA_RECEIPT_CHAIN_CONTEXT_ID

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
    const params = new URLSearchParams()
    if (request.params?.gpaId) {
      params.set('gpaId', request.params.gpaId)
    }
    if (request.params?.channelId) {
      params.set('channelId', request.params.channelId)
    }
    if (request.params?.limit) {
      params.set('limit', String(request.params.limit))
    }

    const queryString = params.toString()
    const path = `/api/governance/receipts${queryString ? `?${queryString}` : ''}`
    const res = await this._conn.fetch(path)

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Sylva receipts fetch failed: ${res.status} ${body}`)
    }

    const data = (await res.json()) as SylvaReceiptListResponse
    const receipts: SylvaGovernanceReceipt[] = data.items || []

    // Sort receipts by timestamp for chain ordering
    receipts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    // Build receipt nodes
    const receiptNodes = receipts.map(receiptToNode)

    // Build links
    const links = [
      ...receipts.map(receiptToGpaLink),
      ...receipts.map(receiptToChannelLink),
    ]

    // Receipt chain links (parent → child)
    for (const receipt of receipts) {
      if (receipt.parentReceiptId) {
        links.push(receiptChainLink(receipt.parentReceiptId, receipt.id))
      }
    }

    // Fetch GPA and channel nodes for context anchors
    const gpaIds = [...new Set(receipts.map((r) => r.gpaId))]
    const channelIds = [...new Set(receipts.map((r) => r.channelId))]
    const anchorNodes = await this._fetchAnchorNodes(gpaIds, channelIds)

    const nodes = [...anchorNodes, ...receiptNodes]
    const rootId = receipts[0]?.id || ''

    return buildResponse(request, { nodes, links }, undefined, rootId)
  }

  public getDataStream(
    request: IEventsGraphCollectionContextRequest,
    cb: IUpdateGraphDataCallback,
  ): void {
    this.getData(request)
      .then((snapshot) => {
        const relevantEvents = [
          'governance.receipt',
          'governance.coherence',
          'governance.verification',
        ]

        const unsubscribe = this._bridge.subscribe(relevantEvents, (eventData) => {
          cb(null, buildResponse(request, undefined, eventData))
        })

        const closeStream = () => {
          logger.info('ContextGovernanceReceiptChain: stream closed')
          unsubscribe()
        }

        cb(null, snapshot, closeStream)
      })
      .catch((err) => {
        logger.error({ err }, 'ContextGovernanceReceiptChain: stream error')
        cb(err instanceof Error ? err : new Error(String(err)))
      })
  }

  private async _fetchAnchorNodes(gpaIds: string[], channelIds: string[]) {
    const nodes = []

    for (const gpaId of gpaIds) {
      try {
        const res = await this._conn.fetch(`/api/gpa/${encodeURIComponent(gpaId)}`)
        if (res.ok) {
          const gpa = (await res.json()) as SylvaGPA
          nodes.push(gpaToNode(gpa))
        }
      } catch { /* anchor node is optional */ }
    }

    for (const channelId of channelIds) {
      try {
        const res = await this._conn.fetch(`/api/channels/${encodeURIComponent(channelId)}`)
        if (res.ok) {
          const channel = (await res.json()) as SylvaChannel
          nodes.push(channelToNode(channel))
        }
      } catch { /* anchor node is optional */ }
    }

    return nodes
  }
}

export default ContextGovernanceReceiptChain
