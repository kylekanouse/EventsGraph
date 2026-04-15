import router from '../router'
import {Request, Response} from "express"
import {IError} from '../../domain/IError'

router.route('/graphdata')
    .get((req: Request, res: Response) => {

        console.log('ROUTE: GET | graphdata ', req.headers)
        res.json({message:'Hello from GET graphdata'})
    })

export default router