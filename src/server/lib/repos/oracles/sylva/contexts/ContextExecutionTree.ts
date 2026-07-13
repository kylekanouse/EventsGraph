import IEventsGraphCollectionContextResponse from '../../../../../domain/IEventsGraphCollectionContextResponse'
import IEventsGraphCollectionContextRequest from '../../../../../domain/IEventsGraphCollectionContextRequest'
import { constants } from '../../../../../constants'
import { Context } from '../../../Context'
import IUpdateGraphDataCallback from '../../../../../domain/IUpdateGraphDataCallback'
import { SylvaConnectionManager } from '../SylvaConnectionManager'
import {
  executionToNode,
  stepToNode,
  stepSequenceLink,
  executionToStepLink,
} from '../mappers/step.mapper'
import { buildResponse } from '../../../../Utils'
import { logger } from '../../../../logger'
import type { SylvaExecution, SylvaExecutionListResponse } from '../types'

class ContextExecutionTree extends Context {

  protected _id: string = constants.SYLVA_EXECUTION_TREE_CONTEXT_ID

  private _conn: SylvaConnectionManager

  constructor(conn: SylvaConnectionManager) {
    super()
    this._conn = conn
  }

  public isStreamable(): boolean {
    return false
  }

  public async getData(
    request: IEventsGraphCollectionContextRequest,
  ): Promise<IEventsGraphCollectionContextResponse> {
    const gpaId = request.params?.gpaId
    if (!gpaId) {
      throw new Error('ContextExecutionTree requires params.gpaId')
    }

    const executionId = request.params?.executionId
    let execution: SylvaExecution

    if (executionId) {
      const res = await this._conn.fetch(
        `/api/gpa/${encodeURIComponent(gpaId)}/executions/${encodeURIComponent(executionId)}`,
      )
      if (!res.ok) throw new Error(`Execution fetch failed: ${res.status}`)
      execution = (await res.json()) as SylvaExecution
    } else {
      const res = await this._conn.fetch(
        `/api/gpa/${encodeURIComponent(gpaId)}/executions?limit=1&sort=desc`,
      )
      if (!res.ok) throw new Error(`Executions list fetch failed: ${res.status}`)
      const data = (await res.json()) as SylvaExecutionListResponse
      if (!data.items || data.items.length === 0) {
        return buildResponse(request, { nodes: [], links: [] }, undefined, '')
      }
      execution = data.items[0]
    }

    const executionNode = executionToNode(execution)
    const sortedSteps = [...execution.steps].sort((a, b) => a.order - b.order)
    const stepNodes = sortedSteps.map(stepToNode)

    const links = []
    if (sortedSteps.length > 0) {
      links.push(executionToStepLink(execution.id, sortedSteps[0].id))
    }
    for (let i = 0; i < sortedSteps.length - 1; i++) {
      links.push(stepSequenceLink(sortedSteps[i].id, sortedSteps[i + 1].id))
    }

    const nodes = [executionNode, ...stepNodes]
    return buildResponse(request, { nodes, links }, undefined, execution.id)
  }

  public getDataStream(
    _request: IEventsGraphCollectionContextRequest,
    cb: IUpdateGraphDataCallback,
  ): void {
    cb(new Error('ContextExecutionTree does not support streaming'))
  }
}

export default ContextExecutionTree
