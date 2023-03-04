import express from 'express'
import { createMedicine, decreaseMedicine, getMedicine } from '../controllers/medicineController'
import { isLoggedIn } from '../middleware/isLoggedIn'

export const medicineRouter = express.Router()

medicineRouter.post('/create-medicine', isLoggedIn, createMedicine)
medicineRouter.post('/decrease-medicine', decreaseMedicine)
medicineRouter.post('/get-medicine', getMedicine)
