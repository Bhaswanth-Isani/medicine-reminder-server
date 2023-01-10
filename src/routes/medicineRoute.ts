import express from 'express'
import { createMedicine } from '../controllers/medicineController'
import { isLoggedIn } from '../middleware/isLoggedIn'

export const medicineRouter = express.Router()

medicineRouter.post('/create-medicine', isLoggedIn, createMedicine)
