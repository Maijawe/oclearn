import React, { useEffect } from "react";
import { Modal, Button, Image } from "react-bootstrap";
import QueenImage from "./images/ProudQueen.png"; // Replace with actual queen image
import DissapointedQueenImage from "./images/sadQueen.png"; // Fix: was pointing to mp3
import queenVoice from "./sounds/QueenOfTheGuardians.mp3";
import dissapointedQueenVoice from "./sounds/DissapointedQueen.mp3";
import happyBg from "./sounds/happyQueenSound.wav";

function LevelFourModal({ show, onClose, villagerCount }) {
  const hasManyVillagers = villagerCount >= 400;

  useEffect(() => {
    if (!show) return;

    const voice = new Audio(
      hasManyVillagers ? queenVoice : dissapointedQueenVoice
    );
    const bgSound = hasManyVillagers ? new Audio(happyBg) : null;
    // Loop background sound
    if (bgSound) {
      bgSound.volume = 0.4;
      bgSound.loop = false;
      bgSound.play();
    }
    voice.play();

    return () => {
      voice.pause();
      voice.currentTime = 0;

      if (bgSound) {
        bgSound.pause();
        bgSound.currentTime = 0;
      }
    };
  }, [show, villagerCount]);

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
        <Modal.Title className="text-info fs-2">
          👑 Message from the Queen
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">
        <Image
          src={hasManyVillagers ? QueenImage : DissapointedQueenImage}
          alt="Queen"
          fluid
          style={{ maxHeight: "200px" }}
        />
        <p className="fs-4 mt-4">
          <strong>Queen of the Guardians:</strong>
          <br />
          {hasManyVillagers ? (
            <>
              "Oh my hero! 💖 We are so <strong>proud of you</strong> for saving
              many villagers!
              <br />
              You have 100% of our support. Just <strong>keep going!</strong>"
            </>
          ) : (
            <>
              "Oh no. Some villagers were taken by the fog 😢
              <br />
              But <strong>don’t give up, hero</strong> The others are still
              waiting to be rescued.!
              <br />
              You must unlock the doors faster before the fog finds them too.
              Every code you crack brings them closer to the Shiny Land. Let’s
              go — <strong>they believe in you</strong>. "
            </>
          )}
        </p>
      </Modal.Body>

      <Modal.Footer className="justify-content-center border-0">
        <Button variant="success" size="lg" onClick={onClose}>
          ⚔️ Continue Mission
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LevelFourModal;
