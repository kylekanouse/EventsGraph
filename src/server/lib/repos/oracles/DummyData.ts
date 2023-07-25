import Oracle from './Oracle'
import { constants } from '../../../constants'
import CDummyDataBasic from './dummydata/contexts/DummyDataBasic'

/**
 * DummyData
 *
 * @description Dummy data Service
 * @type class
 */

class DummyData extends Oracle {

  /**
   * Constructor
   *
   * @constructor
   */

  constructor() {
    super(constants.DUMMY_DATA_COLLECTION_ID, [CDummyDataBasic])
  }
}

// EXPORT
export default new DummyData()