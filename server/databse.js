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
    cipherStreak: 
    { 
      type: Number,
      default: 0 
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

    const level1WordsSchema = new mongoose.Schema({
      words : [{
        type :String ,
        required : false
      }]
    });

    const Level1Words = mongoose.model('level1_words' ,level1WordsSchema )

    const level2WordsSchema = new mongoose.Schema({
      words : [{
        type :String ,
        required : false
      }]
    });

    const Level2Words = mongoose.model('level2_words' ,level2WordsSchema );

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

    const level3WordsSchema = new mongoose.Schema({
      words : [{
        type :String ,
        required : false
      }]
    });

    const Level3Words = mongoose.model('level3_words' ,level3WordsSchema );

    const level4WordsSchema = new mongoose.Schema({
      words : [{
        type :String ,
        required : false
      }]
    });

    const Level4Words = mongoose.model('level4_words' ,level4WordsSchema );

    const level5WordsSchema = new mongoose.Schema({
      words : [{
        type :String ,
        required : false
      }]
    });

    const Level5Words = mongoose.model('level5_words' ,level5WordsSchema )

    module.exports = {
        Learner,
        Level1Words,
        Level2Words,
        Level3Words,
        Level4Words,
        Level5Words

      };