"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const constants_1 = require("../../../../constants");
const Utils_1 = require("../../../Utils");
const TwitterAPI_1 = require("./TwitterAPI");
const UserCollection_1 = __importDefault(require("./UserCollection"));
/**
 * UserService
 *
 * @description
 */
var UserService;
(function (UserService) {
    async function getUsersBy(params, request) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('Twitter => params: ', params);
                const collectionID = constants_1.constants.TWITTER_USER_COLLECTIN_ID + constants_1.constants.SEP + Date.now();
                // Make request through client
                const respJSON = await TwitterAPI_1.TwitterClient.get(constants_1.constants.TWITTER_USER_PATH_ID, params);
                console.log('Twitter RESPONSE: ', respJSON);
                // Parse tweet data into a user objects
                const userCollection = new UserCollection_1.default(collectionID).loadData((respJSON.data) ? respJSON.data : []);
                // Build context response
                const resp = Utils_1.buildResponseFromEntity(userCollection, request);
                resolve(resp);
            }
            catch (error) {
                console.error('UserService ERROR: error =', error);
                reject(error);
            }
        });
    }
    UserService.getUsersBy = getUsersBy;
})(UserService = exports.UserService || (exports.UserService = {}));
//# sourceMappingURL=UserService.js.map