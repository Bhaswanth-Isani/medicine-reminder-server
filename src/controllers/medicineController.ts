import Express from 'express'
import { TypedRequestBody } from '../helpers/typedRequestBody'
import { invalidInputDataError, serverError, unauthorizedError } from '../helpers/errors'
import { z } from 'zod'
import { prisma } from '../../prisma'

// @desc    Creates a new medicine for a particular user using name, compartment, number of pills and time
// @route   POST /medicine/create-medicine
// @access  Private
// @input   {name: string, compartment: string, number: int, time: string[]}
// @output  {id: string, name: string, compartment: number, number: int, time: string[], userID: string, success: boolean}
export const createMedicine = async (req: TypedRequestBody<{ name: string, compartment: number, number: number, time: string[] }>, res: Express.Response): Promise<void> => {
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
              compartment: 0
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

        res.status(200).json({ ...medicine, success: true })
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: serverError
      })
    }
  }
}

// @desc    Decreases the amount of medicine by 1
// @route   POST /medicine/decrease-medicine
// @access  Private
// @input   {userID: string, compartment: number}
// @output  {success: boolean}
export const decreaseMedicine = async (req: TypedRequestBody<{ userID: string, compartment: number }>, res: Express.Response): Promise<void> => {
  const { userID, compartment } = req.body

  try {
    if (!z.string().min(10).safeParse(userID).success || !z.number().min(1).max(3).safeParse(compartment).success) {
      res.status(401).json({
        success: false,
        error: unauthorizedError
      })
    } else {
      const previousData = await prisma.medicine.findFirst({
        where: {
          userId: userID,
          compartment
        }
      })

      await prisma.medicine.update({
        where: {
          id: previousData.id
        },
        data: {
          number: previousData.number - 1
        }
      })

      res.status(200).json({
        success: true
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: serverError
    })
  }
}