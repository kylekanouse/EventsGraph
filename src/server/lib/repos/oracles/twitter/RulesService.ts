import { constants } from "../../../../constants"
import StreamRule from "./StreamRule"
import { TwitterClient } from "../twitter/TwitterAPI"
import IStreamRuleResponse from "./domain/IStreamRuleResponse"
import { RequestParameters } from "twitter-v2"
import { logger } from '../../../logger'

/**
 * _buildAddRulesBody
 *
 * @param {StreamRule[]} rules 
 * @returns 
 */

const _buildAddRulesBody = (rules: StreamRule[]): any => {
  return JSON.stringify({
    add: rules.map( rule => rule.getData())
  })
}

/**
 * RulesService
 *
 * @namespace
 */

export namespace RulesService {

  /**
   * getRules
   *
   * @description Return a list of rules currently active on the streaming endpoint, either as a list or individually.
   * @param {string | undefined} ids
   * @returns {Promise<IStreamRuleResponse>}
   */

  export async function getRules(ids?: string): Promise<IStreamRuleResponse> {
    const params: RequestParameters | undefined = (ids) ? {ids: ids} as RequestParameters : undefined
    logger.info({ ids, params }, 'RulesService: getRules')
    return TwitterClient.get(constants.TWITTER_FILTERED_STREAM_RULES_PATH_ID, params)
  }

  /**
   * addRules
   *
   * @param {StreamRule[]} rules 
   */

  export async function addRules(rules: StreamRule[]): Promise<IStreamRuleResponse>  {
    logger.info({ rules }, 'RulesService: addRules')
    return TwitterClient.post( constants.TWITTER_FILTERED_STREAM_RULES_PATH_ID, _buildAddRulesBody(rules) )
  }
}