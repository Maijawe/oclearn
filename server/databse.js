const mongoose = require('mongoose');
const StreamTransport = require('nodemailer/lib/stream-transport');

const { Schema } = mongoose;


//schema for registered users
const learnerSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true,
      unique: true, 
    },
    parentEmail: {
      type: String,
      required: true,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiration: Date,
    pin: {
      type: String,
      required: true
    },
    streak: 
    { 
      type: Number,
      default: 1
    },
    highestStars: 
    { 
      type: Number,
      default: 0
    },
    cipherStreak: 
    { 
      type: Number,
      default: 1 
    },
    
    lastLoginDate:
    { type: Date,
      default: Date.now 
    },

    contacts: {
      type: String,
      required: true
    },
    level: 
    { 
      type: Number,
      default: 1
    },
    cipherKeys: 
    { 
      type: Number,
      default: 0
    },
    stars: 
    { 
      type: Number,
      default: 0
    },
    wordsIKnow : [{
      type :String ,
      required : false
    }],
    
   
    isAuthenticated :Boolean 
    
    });
    const Learner = mongoose.model('learner', learnerSchema);



    const myWords = new mongoose.Schema({
      know :[{
        type: String,
        required:false
      }],
      kindaKnow : [{
        type:String,
        required: false
      }],

      dontKnow : [{
        type:String,
        required : false
      }]
    })



    const levelWordsSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true,
    unique: true,
  },
  words: [{
    type: String,
    required: true,
  }],
});

const LevelWords = mongoose.model('level_words', levelWordsSchema);

    module.exports = {
        Learner,
        LevelWords

      };