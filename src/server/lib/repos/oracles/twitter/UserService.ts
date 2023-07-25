import { constants } from "../../../../constants"
import IEventsGraphCollectionContextRequest from "../../../../domain/IEventsGraphCollectionContextRequest"
import IEventsGraphCollectionContextResponse from "../../../../domain/IEventsGraphCollectionContextResponse"
import { buildResponseFromEntity } from "../../../Utils"
import IUserResponse from "./domain/IUserResponse"
import { TwitterClient } from "./TwitterAPI"
import UserCollection from "./UserCollection"

/**
 * UserService
 *
 * @description 
 */

export namespace UserService {

  export async function getUsersBy(params: any, request: IEventsGraphCollectionContextRequest): Promise<IEventsGraphCollectionContextResponse> {

    return new Promise( async (resolve, reject) => {

      try {
        console.log('Twitter => params: ', params)
        const collectionID: string = constants.TWITTER_USER_COLLECTIN_ID + constants.SEP + Date.now()

        // Make request through client
        const respJSON          : IUserResponse = await TwitterClient.get( constants.TWITTER_USER_PATH_ID, params)

        console.log('Twitter RESPONSE: ', respJSON)
        // Parse tweet data into a user objects
        const userCollection    : UserCollection = new UserCollection( collectionID ).loadData( (respJSON.data) ? respJSON.data : [] )

        // Build context response
        const resp              : IEventsGraphCollectionContextResponse = buildResponseFromEntity(userCollection, request)

        resolve(resp)

      } catch (error) {
        console.error('UserService ERROR: error =', error)
        reject(error)
      }

    })
  }
}