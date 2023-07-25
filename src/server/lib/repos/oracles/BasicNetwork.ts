import Oracle from './Oracle'
import { constants } from '../../../constants'
import CBasicNetworkServicesOperations from './basicnetwork/contexts/BasicNetworkServicesOperations'

/**
 * TwitterOracle
 *
 * @description Main entry point to access Twitter data
 * @type class
 */

class BasicNetwork extends Oracle {

  /**
   * Constructor
   *
   * @constructor
   */

  constructor() {
    super(constants.BASICNETWORK_COLLECTION_ID, [CBasicNetworkServicesOperations])
  }
}

// EXPORT
export default new BasicNetwork()