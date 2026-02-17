import express from "express";
import {
  getCustomers,
  getCustomer,
  deleteCustomer,
  updateCustomerStatus,
  getCustomerStats
} from "../controllers/customerController.js";

const router = express.Router();

router.get('/', getCustomers);
router.get('/stats', getCustomerStats);
router.delete('/:id', deleteCustomer);
router.put('/:id/status', updateCustomerStatus);

export default router;
