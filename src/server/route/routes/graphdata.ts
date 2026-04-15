import router from '../router'
import {Request, Response} from "express"
import {IError} from '../../domain/IError'
import { logger } from '../../lib/logger'

router.route('/graphdata')
    .get((req: Request, res: Response) => {

        logger.info({ headers: req.headers }, 'GET graphdata')
        res.json({message:'Hello from GET graphdata'})
    })

export default router