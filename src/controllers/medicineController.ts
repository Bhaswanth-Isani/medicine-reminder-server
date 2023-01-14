import Express from 'express'
import { TypedRequestBody } from '../helpers/typedRequestBody'
import { invalidInputDataError, serverError, unauthorizedError } from '../helpers/errors'
import { z } from 'zod'
import { prisma } from '../../prisma'

// @desc    Creates a new medicine for a particular user using name, compartment, number of pills and time   POST /user/create-account
// @access  Private
// @input   {name: string, compartment: string, number: int, time: string[]}
// @output  {id: string, name: string, compartment: string, number: int, time: string[], userID: string}
export const createMedicine = async (req: TypedRequestBody<{ name: string, compartment: string, number: number, time: string[] }>, res: Express.Response): Promise<void> => {
  const { name, compartment, number, time } = req.body
  const userID = req.user?.id

  if (userID === undefined) {
    res.status(401).json({
      success: false,
      error: unauthorizedError
    })
  } else {
    try {
      if (!z.string().min(3).safeParse(name).success || !z.string().min(1).safeParse(compartment).success || !z.number().min(0).max(30).safeParse(number).success || !z.string().array().min(1).max(3).safeParse(time).success) {
        res.status(400).json({
          success: false,
          error: invalidInputDataError
        })
      } else {
        const previousMedicineInCompartment = await prisma.medicine.findFirst({
          where: {
            userId: userID,
            compartment
          }
        })

        if (previousMedicineInCompartment !== null) {
          await prisma.medicine.update({
            where: {
              id: previousMedicineInCompartment.id
            },
            data: {
              compartment: '0'
            }
          })
        }

        const medicine = await prisma.medicine.create({
          data: {
            name,
            compartment,
            number,
            time,
            userId: userID
          }
        })

        res.status(200).json({ ...medicine })
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: serverError
      })
    }
  }
}
