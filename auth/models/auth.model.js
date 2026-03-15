const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,   
      trim: true,
      unique: true      
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      validate: {
        validator: function (value) {
          
            
          return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/.test(value);
        },
        message: "Password must contain at least 1 letter and 1 number"
      }
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"   
    }
  },
  {
    timestamps: true   
  }
);



userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);           
  this.password = await bcrypt.hash(this.password, salt);

  next();
});


userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model("User", userSchema);