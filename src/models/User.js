import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema= new mongoose.Schema({
  name:{
    type:String,
    required:true,
    trim: true
  },
  email:{
    type:String,
    required:true,
    unique: true,
    trim:true
  },
  address:{
    type: String,
    required:true,
    trim:true
  },
  phone:{
    type: String,
    required:true,
    unique:true,
    trim: true
  },
  password:{
    type: String,
    required: true
  },
  registrationDate:{
    type: Date,
    default:Date.now
  },
  role:{
    type: String,
    enum: ['user','admin'],
    default: 'user'
  },
}, {
  timestamps: true
});
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
export default mongoose.models.User || mongoose.model('User', userSchema);