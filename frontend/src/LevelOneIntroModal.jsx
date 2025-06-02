import React, { useState, useEffect } from "react";
import { Modal, Button, Image } from "react-bootstrap";
import AlienCommander from "./images/alienCommander.png";
import GuardianLeader from "./images/GuardiansOfLight.png";
import alienVoice from "./sounds/alienVoice.mp3";
import guardianVoice from "./sounds/GuardiansOfLightVoice.mp3";
import narratorVoice from "./sounds/NarratorVoice.mp3";
import scaryhitSound from "./sounds/ScaryHit.mp3";

function LevelOneIntroModal({ show, onClose, reset }) {
  const [step, setStep] = useState(1);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    if (!show) {
      setStep(1); // Reset step when modal is closed
      if (reset) reset(); // If parent wants to force reset
    }
  }, [show]);

  // Play voice on each step
  useEffect(() => {
    if (!show) return;

    let voice;
    let bgSound;

    if (step === 1) {
      voice = new Audio(alienVoice);
      bgSound = new Audio(scaryhitSound);
      bgSound.volume = 0.4; // Lower volume to not overpower
      bgSound.play();
    } else if (step === 2) {
      voice = new Audio(guardianVoice);
    } else if (step === 3) {
      voice = new Audio(narratorVoice);
    }

    if (voice) {
      voice.play();
      setAudio(voice);
    }

    return () => {
      if (voice) {
        voice.pause();
        voice.currentTime = 0;
      }
      if (bgSound) {
        bgSound.pause();
        bgSound.currentTime = 0;
      }
    };
  }, [step, show]);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Image
              src={AlienCommander}
              alt="Alien Commander"
              fluid
              style={{ maxHeight: "180px" }}
            />
            <p className="fs-4 mt-3">
              <strong>👽 Alien Commander:</strong> <br />
              "Earth is perfect for our new home. <br />
              But the humans won’t let us in. <br />
              Let’s make a purple fog that puts them to sleep… forever!"
            </p>
          </>
        );
      case 2:
        return (
          <>
            <Image
              src={GuardianLeader}
              alt="Guardian Leader"
              fluid
              style={{ maxHeight: "180px" }}
            />
            <p className="fs-4 mt-3">
              <strong>🌟 Guardian Leader:</strong> <br />
              "The fog is coming, and it's dangerous. <br />
              But there's hope. <br />
              You are the chosen one. <br />
              Lead 500 villagers to the Shiny Land!"
            </p>
          </>
        );
      case 3:
        return (
          <>
            <p className="fs-4">
              <strong>🎙️ Narrator:</strong> <br />
              "Each door is locked with a secret code. <br />
              Solve the codes. Save your people. <br />
              Are you ready, brave one?"
            </p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => {}}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header className="border-0 justify-content-center">
        <Modal.Title className="text-warning fs-2">
          🌫️ Fog Fighters Story
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">{renderContent()}</Modal.Body>

      <Modal.Footer className="justify-content-center border-0">
        {step < 3 ? (
          <Button variant="primary" size="lg" onClick={handleNext}>
            ➡️ Next
          </Button>
        ) : (
          <Button variant="success" size="lg" onClick={onClose}>
            🚪 Start Journey
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default LevelOneIntroModal;
