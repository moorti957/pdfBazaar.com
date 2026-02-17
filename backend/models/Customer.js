import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    unique: true 
  },
  phone: { 
    type: String 
  },
  address: { 
    type: String 
  },
  city: { 
    type: String 
  },
  country: { 
    type: String 
  },
  zipCode: { 
    type: String 
  },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active'
  },
  totalOrders: { 
    type: Number, 
    default: 0 
  },
  totalSpent: { 
    type: Number, 
    default: 0 
  },
  lastActive: { 
    type: Date 
  },
  notes: { 
    type: String 
  }
}, { 
  timestamps: true 
});

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;