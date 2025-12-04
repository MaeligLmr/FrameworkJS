import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Le nom d\'utilisateur est obligatoire'],
            unique: true,
            trim: true,
            maxlength: [50, 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères']
        },
        email: {
            type: String,
            required: [true, 'L\'email est obligatoire'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
        },
        password: {
            type: String,
            required: [true, 'Le mot de passe est obligatoire'],
            minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('articles', {
    ref: 'Article',
    localField: '_id',
    foreignField: 'author'
});

const User = mongoose.model('User', userSchema);
export default User;