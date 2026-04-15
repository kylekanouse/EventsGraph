"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesService = void 0;
const constants_1 = require("../../../../constants");
const TwitterAPI_1 = require("../twitter/TwitterAPI");
/**
 * _buildAddRulesBody
 *
 * @param {StreamRule[]} rules
 * @returns
 */
const _buildAddRulesBody = (rules) => {
    return JSON.stringify({
        add: rules.map(rule => rule.getData())
    });
};
/**
 * RulesService
 *
 * @namespace
 */
var RulesService;
(function (RulesService) {
    /**
     * getRules
     *
     * @description Return a list of rules currently active on the streaming endpoint, either as a list or individually.
     * @param {string | undefined} ids
     * @returns {Promise<IStreamRuleResponse>}
     */
    async function getRules(ids) {
        const params = (ids) ? { ids: ids } : undefined;
        console.log('RulesService | getRules() | ids = ', ids, ' | params = ', params);
        return TwitterAPI_1.TwitterClient.get(constants_1.constants.TWITTER_FILTERED_STREAM_RULES_PATH_ID, params);
    }
    RulesService.getRules = getRules;
    /**
     * addRules
     *
     * @param {StreamRule[]} rules
     */
    async function addRules(rules) {
        console.log('RulesService | addRules() | rules = ', rules);
        return TwitterAPI_1.TwitterClient.post(constants_1.constants.TWITTER_FILTERED_STREAM_RULES_PATH_ID, _buildAddRulesBody(rules));
    }
    RulesService.addRules = addRules;
})(RulesService = exports.RulesService || (exports.RulesService = {}));
//# sourceMappingURL=RulesService.js.map