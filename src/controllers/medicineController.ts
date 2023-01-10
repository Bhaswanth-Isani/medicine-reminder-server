import Express from 'express'
import { TypedRequestBody } from '../helpers/typedRequestBody'

export const createMedicine = async (req: TypedRequestBody<{}>, res: Express.Response): Promise<void> => {
  console.log(req)
  res.status(200).json({
    success: true
  })
}
