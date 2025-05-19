import React, { useState,useEffect, useRef } from "react";
import { Container,Modal, Button, Form, Card, Alert,ProgressBar, Image,Navbar, Nav  } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "./home2.css"; // Import custom styles
import incorrectSound from "./sounds/wrong.mp3";
import cipherKeyImage from "./images/cipherKey.jpg";
import starImage from "./images/goldenStar.jpg";
import correctSound from "./sounds/success.mp3";
import winner from "./sounds/winner.wav";
import cipherSound from './sounds/cipherKeySound.wav';
import lostStreakSound from './sounds/lostStreak.wav';


function SpellingGame() {

  const navigate = useNavigate();


  const [isDataFetched, setIsDataFetched] = useState(false);
  const [isStreakFetched , setIsStreakFetched] = useState(false)
  const [wordsIKindaKnow, setWordsIKindaKnow] = useState([]);
  const [wordsIDontKnow, setWordsIDontKnow] = useState([]);
  const [levelWords, setLevelWords] = useState([]);
  const [cipherKeys ,setCipherKeys] = useState(0);
  const [level , setLevel] = useState(0);
  const [currentDailyStars , setCurrentDailyStars ] = useState(0);
  const [highestStars , setHighestStars] = useState(0);
  const [revealedWord, setRevealedWord] = useState("");
  const [wordsIKnow, setWordsIKnow] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [message, setMessage] = useState("");
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [gameLost, setGameLost] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isSpeakingDisabled, setIsSpeakingDisabled] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // Track incorrect answer alert
  const [showCorrect, setShowCorrect] = useState(false);
  const [hintClicks, setHintClicks] = useState(0); // Track the number of hint clicks
  const [hint, setHint] = useState(""); // Store hint
  const [showModal, setShowModal] = useState(false);
  const [imageURL, setImageURL] = useState("");
  const [maxHintsBool ,setMaxHintsBool] = useState(false);
  const [cipherKeyNumber , setCipherKeyNumber] = useState(0);
  const [streak, setStreak] = useState(0);
  const [cipherStreak, setCipherStreak] = useState(0);
  const [showCipherModal, setShowCipherModal] = useState(false);
  const [showCipherAlert, setShowCipherAlert] = useState(false);
  const [guess, setGuess] = useState("");
  const [cipherMessage, setCipherMessage] = useState("");
  const [CipherKeyImage, showCipherKeyImage] = useState(false);
  const [stars , setStars] = useState(0);
  const [showStarModal , setShowStarModal] = useState(false);
  const [revealedWords, setRevealedWords] = useState([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [levelComingSoon, setLevelComingSoon] = useState(false);
  const [unavailableLevel, setUnavailableLevel] = useState(null);
 

    // Modal controls
    const [showStreakModal, setShowStreakModal] = useState(false);
    const [showStarsTotalModal, setShowStarsTotalModal] = useState(false);
    const [showHighestStarsModal, setShowHighestStarModal] = useState(false);
    const [showStreakLostModal, setShowStreakLostModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    





   // Total words count
   const totalWords =
   wordsIKindaKnow.length + wordsIDontKnow.length + levelWords.length + wordsIKnow.length;
   const completedWords = wordsIKnow.length;
   const progress = (completedWords / totalWords) * 100;


  
  



  

  


  //fetch details from backend
  const fetchGameData = async () => {
    try {
      //
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/startgame`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) throw new Error("Failed to fetch game data");
  
      const data = await response.json();
      console.log("Fetched data:", data);
      return data; // ✅ return the data instead of setting state here
    } catch (error) {
      console.error("fetchGameData error:", error);
      return null;
    }
  };
  

    
  



  //star view animation
  useEffect(() => {
    if (showStarModal) {
      const timer = setTimeout(() => {
        setShowStarModal(false);
      }, 3000); // Hide modal after 2 seconds
  
      return () => clearTimeout(timer); // Cleanup function
    }
  }, [showStarModal]);

   //cipherKey function
   const getCipherKey = () => {   
      setShowCipherModal(true); // Show modal instead of prompt
  };
  
  //random function for cipherKey
  const handleGuess = () => {
    const updatedCipherStreak = cipherStreak - 3;
    let updatedCipherKeys = cipherKeys;
    //setCipherStreaks(newCipherStreak);
    const randomKey = Math.floor(Math.random() * 5) + 1;
    if (parseInt(guess) === randomKey) {
      setCipherMessage("🎉 Correct! You've won a cipher key!");
      updatedCipherKeys += 1;
      //newCipherKeys = cipherKeys + 1;
      setCipherKeys(updatedCipherKeys);
      const soundCipher = new Audio(cipherSound);
      soundCipher.play(); 
      showCipherKeyImage(true);
      setCipherKeyNumber(randomKey);
    } else {
      
      setCipherMessage(`❌ Wrong guess!, I was thinking ${randomKey} Try again after a 5-day streak.`);
    }
  
    setCipherStreak(updatedCipherStreak);
    setShowCipherAlert(true); 
    console.log(`new cipherKeys ${updatedCipherKeys} and new cipher streak ${updatedCipherStreak}`)
     // ⬇️ Send update to backend
    // now send these correct values to backend
    updateCipherData(updatedCipherKeys, updatedCipherStreak);
  
    // Keep the modal open for 2 seconds, then close
    setTimeout(() => {
      setShowCipherModal(false);
      setShowCipherAlert(false);
    }, 4000);
  };
  


  const updateCipherData = async (newCipherKeys, newCipherStreak) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("No token found in sessionStorage");
      return;
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/updatecipher`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cipherKeys: newCipherKeys,
          cipherStreak: newCipherStreak,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update cipher data");
      }
  
      const result = await response.json();
      console.log("Cipher data updated:", result);
    } catch (error) {
      console.error("Error updating cipher data:", error);
    }
  };



  const inputRef = useRef(null);

  //update streaks
  const fetchStreak = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");
  
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/updatestreak`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error("Failed to fetch streak");
  
      const data = await response.json();
      setStreak(data.streak);
      setCipherStreak(data.cipherStreak); //🔥 you must also fix server to return cipherStreak
      return data;  // ⬅️ Return it
    } catch (error) {
      console.error("Error fetching streak:", error);
    }
  };
  

    useEffect(() => {
      if (gameWon) {
        
        const newLevel = level + 1;
        setLevel(newLevel);
        setIsDataFetched(false); 

      
        setShowStreakModal(true);
  

   
    


        
    
        
    
        //send data to backend
        const sendData = async () => {
          const token = sessionStorage.getItem("token");

          if (!token) {
            console.error("No token found in sessionStorage");
            return;
          }
          const details ={
            level: newLevel,
            stars: stars,
            wordsIknow :wordsIKnow,
            currentDailyStars : currentDailyStars
            
          }
          console.log("data level Words: "+details.wordsIknow);
        
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/senddata`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                 "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify(details),
            });
        
            if (!response.ok) {
              throw new Error("Failed to send data");
            }
        
            const result = await response.json();
            console.log("Response from server:", result);
          } catch (error) {
            console.error("Error:", error);
          }
        };
        
        // Call the function when needed
        sendData();
        

        // Reset game state for the next level
        setGameWon(false); // Reset gameWon to false after handling
        setMessage("🎉 You won the game! Moving to the next level...");
    
        // Fetch new game data for the next level
        fetchGameData();
      }
    }, [gameWon]);
  
    
  
  
  


  // Fetch image when `currentWord` changes
  useEffect(() => {
    if (!currentWord) {
      setImageURL(""); // Clear image if word is empty
      return;
    }


    const fetchImage = async () => {
      try {
        console.log("Fetching image for:", currentWord);

        const response = await fetch(
          `https://pixabay.com/api/?key=48974433-aaba9f511cdaa92f99b10bd7b&q=${encodeURIComponent(
            currentWord.trim()
          )}&image_type=photo&per_page=3`
        );

        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        if (data.hits.length > 0) {
          setImageURL(data.hits[0].webformatURL); // Set the first image found
        } else {
          setImageURL(""); // No image found, clear state
        }
      } catch (error) {
        console.error("Error fetching image:", error.message);
      }
    };

    fetchImage();
  }, [currentWord]); // Runs when `currentWord` changes
  
  

    
    
    // Check for game win condition
    useEffect(() => {
      console.log(`is data fetched ${isDataFetched} levelWords length ${levelWords.length}`)
      if (isDataFetched && levelWords.length === 0) {
        setGameWon(true);
        setMessage("🎉 You won the game!");

        const sessionStart = sessionStorage.getItem("sessionStartTime");
        if (sessionStart) {
        const duration = Math.floor((Date.now() - parseInt(sessionStart)) / 1000);
        console.log("Session Duration:", duration, "seconds");

        // Send to backend
        const token = sessionStorage.getItem("token");
        fetch(`${process.env.REACT_APP_API_URL}/api/session/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ duration }),
        });

        // Optional cleanup
        sessionStorage.removeItem("sessionStartTime");
}


      }
    }, [levelWords]);

  
const startGame = async () => {
  // Start timer when game begins
  sessionStorage.setItem("sessionStartTime", Date.now());
  console.log("🚀 Starting game...");
  setIsLoading(true);

  const data = await fetchGameData(); // Always fetch fresh game data

  if (!data) {
    setIsLoading(false);
    return;
  }
  // ✅ Check if the level is coming soon
if (data.levelAvailable === false) {
  setUnavailableLevel(data.level);
  setLevelComingSoon(true);
  setIsLoading(false);
  return;
}

  // ✅ Always update state, even if data was fetched before
  setLevelWords(data.levelWords);
  setCipherKeys(data.cipherKeys);
  setStars(data.stars);
  setStreak(data.streak);
  setLevel(data.level);
  setHighestStars(data.highestStars);
  setCipherStreak(data.cipherStreak);
  setIsDataFetched(true); // still keep for future use
  console.log("LEVEL WORDS for level", data.level, ":", data.levelWords);

  if (data.levelWords.length > 0) {
    setCurrentWord(data.levelWords[0]);
    speakWord(data.levelWords[0]);
  } else {
    setGameWon(true);
  }

  // Check streak for cipher lottery
  const freshData = await fetchStreak();
  if (freshData?.streakReset) {
    const sadSound = new Audio(lostStreakSound);
    sadSound.play();
    setShowStreakLostModal(true);
}
  else if (freshData && freshData.cipherStreak >= 3) {
    getCipherKey();
    setIsLoading(false);
    return;
  }

  // Final fallback check
  if (!currentWord && data.levelWords.length > 0) {
    setCurrentWord(data.levelWords[0]);
    speakWord(data.levelWords[0]);
  }

  // Reset state for new level
  setWordsIKnow([]);
  setIncorrectAttempts(0);
  setGameLost(false);
  setGameWon(false);
  setShowAlert(false);
  setHintClicks(0);

  setTimeout(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, 100);

  setIsLoading(false);
};

    
    
    

    const speakWord = (word) => {
      if (!word) return;
      console.log("Speaking word:", word);
    
      const synth = window.speechSynthesis;
    
      const speak = () => {
        const voices = synth.getVoices();
        console.log("Available voices:", voices.map(v => v.name));
    
        const preferredVoice =
          voices.find((v) => v.name.includes("Google US English")) ||
          voices.find((v) => v.lang === "en-US") ||
          voices[0];
    
        if (!preferredVoice) {
          //alert("No speech voices available. Try refreshing your browser.");
          return;
        }
    
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.voice = preferredVoice;
        utterance.lang = "en-US";
        utterance.rate = 0.9;
    
        synth.cancel(); // cancel any previous speech
        synth.speak(utterance);
        setIsSpeakingDisabled(true);
        setTimeout(() => setIsSpeakingDisabled(false), 2000);
      };
    
      // Make sure voices are ready
      if (synth.getVoices().length === 0) {
        // Some browsers need delay to populate voices
        synth.onvoiceschanged = () => speak();
        setTimeout(() => speak(), 200); // fallback trigger
      } else {
        speak();
      }
    };
    
    
    
    
    
    

  const checkSpelling = () => {
    if (!currentWord) return; // Prevent checking if no word is set
  
    // Check if the user input matches the current word
    if (userInput.trim().toLowerCase() === currentWord.trim().toLowerCase()) {
      const sound = new Audio(correctSound);
      sound.play();
      setMessage("✅ Correct! Well done!");
      setShowCorrect(true);
      setTimeout(() => setShowCorrect(false), 2000);

      //increase stars by 1 and show star model
      const isRevealed = revealedWords.includes(currentWord);
      if(incorrectAttempts ===0 && !isRevealed){
        setStars(prevVal => prevVal+1);
        setCurrentDailyStars(prevVal => prevVal+1);
        console.log(`current daily stars :${currentDailyStars}`);
        setShowStarModal(true);
        setTimeout(() => setShowStarModal(false), 2000);
      }
      

  
      // Move the current word to wordsIKnow
      setWordsIKnow(prev => [...prev, currentWord]);
  
      // Update levelWords by removing the current word
      let updatedLevelWords = levelWords.filter(word => word !== currentWord);
  
      // Set the updated levelWords
      setLevelWords(updatedLevelWords);
  
      // Check if there are more words in levelWords to continue the game
      let nextWord = updatedLevelWords[0] || null;
      if (nextWord) {
        setCurrentWord(nextWord);
        speakWord(nextWord);
      } else {
        setGameWon(true);  // End game when no words are left
        const sound = new Audio(winner);
        sound.play();
      }
  
      // Reset the input and hint
      setUserInput("");
      setHintClicks(0);
      setHint("");
      setIncorrectAttempts(0); // Reset incorrect attempts on success
    } else {
      const sound = new Audio(incorrectSound);
      sound.play();
      setIncorrectAttempts(prev => {
        const newAttempts = prev + 1;
  
        // Allow two attempts, after which reveal the word
        if (newAttempts === 2) {
          setMessage("❌ Incorrect! The correct word is revealed.");
          revealWord(); // Reveal the word and move to the next one
          return 0; // Reset incorrect attempts
        } else {
          setMessage("❌ Incorrect! Try again.");
        }
  
        return newAttempts;
      });
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };
  
  
  
  
  


  const getHint = () => {
    let hint = currentWord.split("").map(() => "_").join("");
    let totalHints = 4; // Default hints
  
    if (currentWord.length <= 5) {
      totalHints = 2;
    } else if (currentWord.length > 8) {
      totalHints = 5;
    }
  
    if (hintClicks >= totalHints) {
      setMaxHintsBool(true);
      return hint; // Stop revealing if max hints reached
    }
    const revealIndices = [0, currentWord.length - 1]; // Always reveal first and last
  
    if (hintClicks >= 1 && totalHints > 2) {
      revealIndices.push(1); // Second letter
    }
    if (hintClicks >= 2 && totalHints > 2) {
      revealIndices.push(currentWord.length - 2); // Second last letter
    }
    if (hintClicks >= 3 && totalHints > 4) {
      revealIndices.push(2); // Third letter for words with 5+ hints
    }
  
    hint = hint
      .split("")
      .map((char, index) =>
        revealIndices.includes(index) ? currentWord[index] : "_"
      )
      .join("");
  
    return hint;
  };
  
  const handleHintClick = () => {
    let maxHints = 4; // Default max hints
  
    if (currentWord.length <= 5) {
      maxHints = 2;
    } else if (currentWord.length > 8) {
      maxHints = 5;
    }
  
    if (hintClicks < maxHints) {
      setHintClicks(hintClicks + 1);
      setHint(getHint());
    }
       // Check if next click will exceed the max hints
       if (hintClicks + 1 >= maxHints) {
        setMaxHintsBool(true);
      }
  };
  

  const speakPhonetically = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // Set language to English (adjust if needed)
    utterance.rate = 0.1; // Adjust speed (0.5 is slower, 1 is normal, 2 is fast)
    speechSynthesis.speak(utterance);
  };

  const revealWord = () => {
    // Reveal the current word
    setRevealedWord(currentWord);
    speakPhonetically(currentWord);
    setMessage(`✅ The word is: ${currentWord}`);
    setShowModal(true);
  
    // Move the revealed word to the end of the levelWords array
    let updatedLevelWords = levelWords.filter(word => word !== currentWord); // Remove the word from its current position
    updatedLevelWords.push(currentWord); // Add it to the end of the array
  
    // Update the state with the new levelWords array
    setLevelWords(updatedLevelWords);
  
    // Move the word to the "Don't Know" list
    let updatedWordsIDontKnow = [...wordsIDontKnow, currentWord];
    setWordsIDontKnow(updatedWordsIDontKnow);

    //push word to revealedWords array
    setRevealedWords(prev => [...prev, currentWord]);

  
    // Find the next word to display
    setTimeout(() => {
      let nextWord = updatedLevelWords[0] || null; // Always pick the first word from the updated levelWords array
  
      if (nextWord) {
        setCurrentWord(nextWord);
        setHint("");
        speakWord(nextWord);
      } else {
        setGameWon(true); // If no words are left, the game is won
      }
  
      // Reset input and hints
      setUserInput("");
      setHintClicks(0);
    }, 2000); // Give time for the user to see the revealed word
  };
  
  



  return (
    <Container className="text-center mt-5">

      <Modal show={levelComingSoon} onHide={() => setLevelComingSoon(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🚧 Level {unavailableLevel} Coming Soon</Modal.Title>
        </Modal.Header>
          <Modal.Body className="text-center">
            <p>We're still working on Level {unavailableLevel}. It'll be ready soon!</p>
            <div style={{ fontSize: "3rem" }}>🏗️👷‍♂️🚧</div>
          </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setLevelComingSoon(false)}>
            Back to Home
          </Button>
        </Modal.Footer>
      </Modal>




        <Modal show={showStreakLostModal} onHide={() => setShowStreakLostModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>⏰ You Missed a Day</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p>Oops! You didn’t play yesterday 😢</p>
        <p>Your <strong>streak</strong> has started again from <strong>1</strong>.</p>
        <p>Come back tomorrow to start building it up again! 🔥</p>
        <div className="fs-1">💪🔥📆</div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => setShowStreakLostModal(false)}>
          Let's Go!
        </Button>
      </Modal.Footer>
    </Modal>










    <Modal show={showInstructions} onHide={() => setShowInstructions(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>📘 How to Play</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <ul className="text-start">
      <li>🌟 <strong>Stars</strong> – Spell a word correctly on your first try.</li>
      <li>🔥 <strong>Streak</strong> – Earned by playing every day.</li>
      <li>🎲 <strong>Cipher Lottery</strong> – Unlocks after a 3-day streak.</li>
      <li>
        <Image 
          src={cipherKeyImage} 
          alt="Cipher Key" 
          style={{ width: "24px", height: "24px", marginRight: "8px", verticalAlign: "middle" }} 
        />
          <strong>Cipher Key</strong> – Win it by guessing the lottery number right.
      </li>
    </ul>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="primary" onClick={() => setShowInstructions(false)}>
      Got it!
    </Button>
  </Modal.Footer>
</Modal>

      <Card className="p-4">
      <h1>Word Wizard</h1>

      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => setShowInstructions(true)}
        title="How to Play"
        style={{ borderRadius: "50%" }}
      >
        <i className="bi bi-info-circle"></i>
      </Button>
        


        {/* Modal for cipherLottery */}
        <Modal show={showCipherModal} onHide={() => setShowCipherModal(false)} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
        <Modal.Title>🔐 Read My Mind To Win A Chipher Key</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <p>Which number am i thinking between 1 and 5:</p>
        <input
          type="number"
          className="form-control"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          min="1"
          max="5"
        />
        {/* Show result inside modal */}
        {showCipherAlert && <Alert variant={cipherMessage.includes("Correct") ? "success" : "danger"}>{cipherMessage}</Alert>}

        {/*Show cipherKey image */}
        {CipherKeyImage && (
            <div className="text-center mt-3">
            <Image src={cipherKeyImage} alt="Cipher Key" fluid style={{ maxWidth: "100%" }}/>
              <p>You've won cipher key #{cipherKeyNumber}!</p>
            </div>
          )}





      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={handleGuess}>
          Submit Guess
        </Button>
      </Modal.Footer>

    </Modal>


            {/* Modal for star Image */}
        <Modal show={showStarModal} onHide={() => setShowStarModal(false)} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
        <Modal.Title>You've unlocked a new star!!!</Modal.Title>
        </Modal.Header>
        <Modal.Body>

        {/*Show star image */}
        {showStarModal && (
            <div className="text-center mt-3">
            <p>🌟 Boom! You just unlocked a golden star!</p>
            <p className="stars">{currentDailyStars}</p>
            <p>stars</p>
            <Image src={starImage} alt="star" fluid style={{ maxWidth: "100%" }}/>
             
            </div>
          )}
      </Modal.Body>

    </Modal>





        
        {showAlert && (
          <Alert variant="danger" className="shake">
            ❌ Oops! That's incorrect. Try again! 🧐
          </Alert>
        )}
        {showCorrect && (
          <Alert variant="success" className="shake">
          ✅ Hooray!!,You got it correct 😀
          </Alert>
        )}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static" keyboard={false}>
           <Modal.Header closeButton>
              <Modal.Title className="text-success">🎉 Word Revealed! 🎉</Modal.Title>
          </Modal.Header>
            <Modal.Body>
              <h2 className="text-center text-primary">✅ The word is: {revealedWord}</h2>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </Modal.Footer>
        </Modal>


        {gameWon ? (
          <div>

            <div>
              {/* Streak Modal */}
              <Modal show={showStreakModal} onHide={() => setShowStreakModal(false)} centered backdrop="static" keyboard={false}>
                <Modal.Header>
                  <Modal.Title className="fs-3">🔥 Streak Alert! 🔥</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                  <p className="fs-4">You’ve played <strong>{streak}</strong> days in a row! 🎉</p>
                  <p className="fs-4">Your streak = <strong>{streak}</strong></p>
                  <p className="fs-5">Play again tomorrow to keep your streak 🔥</p>
                  <p className="text-success"><strong>2 days = unlock cipher lottery! 🎁🔑</strong></p>
                  <div className="mt-3 fs-1">🔥🔥🔥</div>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="primary" onClick={() => {
                    setShowStreakModal(false);
                    setShowHighestStarModal(true);
                  }}>
                    Got it!
                  </Button>
                </Modal.Footer>
              </Modal>


                                  {/* Streak Modal */}
          <Modal show={showHighestStarsModal}  onHide={() => setShowHighestStarModal(false)} centered backdrop="static" keyboard={false}>
            <Modal.Header>
              <Modal.Title className="fs-3">Your record 🏆</Modal.Title>
            </Modal.Header>
          <Modal.Body className="text-center">
            <p className="fs-5">🏆 Your Best Ever: <strong>{highestStars} stars</strong></p>
            <p>⭐ Today’s Score: <strong>{currentDailyStars} stars</strong></p>
            <div className="mt-3 fs-1">🏆 🏆 🏆</div>
          </Modal.Body>
                <Modal.Footer>
                <Button variant="primary" onClick={() => {
                  setShowHighestStarModal(false);
                  setShowStarsTotalModal(true);
                  }}>Continue</Button>
                </Modal.Footer>
              </Modal>



                      {/* Stars Total Modal */}
        <Modal show={showStarsTotalModal} onHide={() => setShowStarsTotalModal(false)} centered backdrop="static" keyboard={false}>
          <Modal.Header>
            <Modal.Title className="fs-3">🌟 Total Stars 🌟</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <p className="fs-5">You have <strong>{stars}</strong> stars!</p>
            <p>Use them to unlock fun rewards or show off your progress.</p>
            <div className="mt-3 fs-1">🌟🌟🌟</div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={async() => {
              

              setShowStarsTotalModal(false);
               await startGame(); 
              
            }}>Play Next Level</Button>
          </Modal.Footer>
        </Modal>

            </div>

          <h2>🎉 Congratulations! You've won the game! 🎉</h2>
          <p className="austro">
          🏁 "Another level down! Fun fact: Even astronauts need good spelling!
           You wouldn’t want to mix up ‘launch’ and ‘lunch’ in space! 🚀😄"
          </p>
          {streak === 1 && <p className="color-text">🎉 Welcome! You've started your streak! Keep going!</p>}
          {streak === 0 && <p className="color-text">You missed a few days. Your streak has been reset to 0.</p>}
          {streak > 0 && <p className="color-text">Keep it up! You're on a {streak}-day streak! , Play 3 days in a row(3-day streak) to unlock a suprise</p>}
          
          
          
              {/* Only show Go To Next Level button if no cipher lottery is pending */}
          {!showCipherModal && (
            <Button onClick={startGame} variant="primary">Go To Next Level</Button>
          )}
          </div>
        ) : gameLost ? (
          <>
            <h2>😔 You've Lost! 😔</h2>
            <p>You got six incorrect attempts on a word.</p>
            <Button onClick={startGame} variant="primary">Restart Game</Button>
          </>
        ) : currentWord === "" ? (
      <Button onClick={startGame} variant="primary" disabled={isLoading}>
      {isLoading ? (
      <>
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
          Loading...
       </>
      ) : (
        "Start Game"
        )}
      </Button>

        ) :
      
       (
          <>
          <Navbar bg="light" className="sticky-top shadow-sm">
            <Container className="justify-content-center">
              <div className="d-flex gap-4 fs-5">
                <span>⭐ {stars}</span>
                <span>🗝️ {cipherKeys}</span>
                <span>🔥 {streak}</span>
                <span>Level {level}</span>
              </div>
              </Container>
            </Navbar>
            <h2>Listen carefully to the word and spell it:</h2>

            {/* Progress Bar */}
            <div className="mb-4">
                <h4>Progress: {progress.toFixed(0)}%</h4>
                <ProgressBar now={progress} label={`${Math.round(progress)}%`} className="mb-3" />
            </div>



            <Button 
              onClick={() => speakWord(currentWord)} 
              variant="info" 
              className="mb-3"
              disabled={isSpeakingDisabled}
            >
              🔊 Repeat Word {isSpeakingDisabled ? " (Wait...)" : ""}
            </Button>
          {imageURL && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", marginBottom: "20px" }}>
              <img
                src={imageURL}
                alt={currentWord}
                style={{ width: "200px", height: "200px" }}
              />
            </div>
          )}
            
            <div className="hint-section">
              <h4>Your Hint:</h4>
              <Form.Label className="hint-label">{hint}</Form.Label>
            </div>

            <Button 
              onClick={handleHintClick} 
              variant="warning" 
              className="mt-2"
              disabled={hintClicks >= 4}
            >
              Get Hint
            </Button>

            {maxHintsBool === true && (
              <Button 
                onClick={revealWord} 
                variant="success" 
                className="mt-2"
              >
                Reveal Word
              </Button>
            )}

            <Form.Control
              type="password"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="mb-3"
              ref={inputRef}
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              inputMode="text"
            />
            <Form.Label>
              You typed: <strong>{userInput}</strong>
            </Form.Label>
            <Button variant="success" onClick={checkSpelling}>Submit</Button>
            <p className="mt-3">{message}</p>
            <p>Incorrect Attempts: {incorrectAttempts} / 6</p>
          </>
        )}
      </Card>
    </Container>
  );
}

export default SpellingGame;

















