import mongoose from 'mongoose';

const donationSchema= new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
  },
  amount:{
    type:Number,
    required: true,
    min: 1
  },
  razorpayOrderId:{
    type: String,
    required:true
  },
  razorpayPaymentId:{
    type:String,
    default:null
  },
  razorpaySignature: {
    type:String,
    default:null
  },
  status:{
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  donationDate: {
    type: Date,
    default: Date.now
  },
  completedAt:{
    type:Date,
    default: null
  }
},{
  timestamps:true
});

export default mongoose.models.Donation || mongoose.model('Donation', donationSchema);