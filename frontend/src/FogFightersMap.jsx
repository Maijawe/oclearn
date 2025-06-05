import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  ProgressBar,
  Card,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./fogMap.css";
import FogFighterImage from "./images/fogFighters.png";
import LevelOneIntroModal from "./LevelOneIntroModal"; // make sure this exists!
import LevelFourModal from "./LevelFourModal";

function FogFightersMap() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(false); // ✅ define modal state
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showLevelFour, setShowLevelFour] = useState(false);
  const [villagerCount, setVillagerCount] = useState(0); // to pass into modal

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/getlevel`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch level");
        const data = await res.json();
        setCurrentLevel(data.level);
        console.log(`current level ${data.level}`);
      } catch (err) {
        console.error("Error fetching level:", err);
      }
    };

    fetchLevel();
  }, []);

  const totalLevels = 10;
  const levels = [];

  for (let i = 1; i <= totalLevels; i++) {
    levels.push({ level: i, unlocked: i <= currentLevel });
  }

  const visibleLevels = levels.filter(
    (lvl) => lvl.level >= currentLevel - 2 && lvl.level <= currentLevel + 3
  );

  const handleLevelClick = async (level) => {
    if (level === 1) {
      setShowIntro(true);
    } else if (level === 4) {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/villagercount`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch villager count");
        const data = await res.json();
        setVillagerCount(data.count); // or data.villagerCount depending on your API
        setShowLevelFour(true);
      } catch (err) {
        console.error("Error fetching villager count:", err);
        // Fallback: skip modal and go home if villager count fails
        navigate("/home");
      }
    } else if (level === currentLevel) {
      navigate("/home");
    }
  };

  const getIcon = (lvl) => {
    if (lvl.level === currentLevel) return "🛡️";
    if (lvl.unlocked) return "🔓";
    return "🔒";
  };

  return (
    <div
      className="fog-map-background"
      style={{
        backgroundImage: `url(${FogFighterImage})`,
      }}
    >
      <div className="fog-map-overlay">
        <Container className="text-center py-5">
          <h2 className="mb-4 glowing-title">🌫️ Fog Fighters Progress Map</h2>

          <Card className="mb-4 p-3 shadow fog-story-card">
            <p>🌍 The world is under attack by a mysterious purple fog!</p>
            <p>🛡️ You are chosen to lead 500 villagers to the Shiny Land!</p>
            <p>🚪 Solve secret codes to unlock doors and keep moving!</p>
          </Card>

          <Row className="justify-content-center">
            {visibleLevels.map((lvl, idx) => (
              <Col key={idx} xs="auto" className="m-2">
                <Button
                  variant={lvl.unlocked ? "success" : "secondary"}
                  onClick={() => lvl.unlocked && handleLevelClick(lvl.level)}
                  disabled={!lvl.unlocked}
                  className={`level-btn ${
                    lvl.level === currentLevel ? "current-level" : ""
                  }`}
                >
                  {getIcon(lvl)} Level {lvl.level}
                </Button>
              </Col>
            ))}
          </Row>

          <div className="my-4">
            <ProgressBar
              now={(currentLevel / totalLevels) * 100}
              animated
              variant="warning"
            />
            <p className="mt-2">
              Door {currentLevel} progress: {currentLevel * 10}% unlocked
            </p>
          </div>
        </Container>
      </div>

      {/* ✅ Intro modal when Level 1 is clicked */}
      <LevelOneIntroModal
        show={showIntro}
        onClose={() => {
          setShowIntro(false);
          setTimeout(() => {
            navigate("/home");
          }, 100); // Small delay to allow modal cleanup
        }}
      />
      {/*level 4 modal when level 4 clicked */}
      <LevelFourModal
        show={showLevelFour}
        onClose={() => {
          setShowLevelFour(false);
          setTimeout(() => {
            navigate("/home");
          }, 100);
        }}
        villagerCount={villagerCount}
      />
    </div>
  );
}

export default FogFightersMap;
