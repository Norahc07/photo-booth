import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import html2canvas from "html2canvas";
import "./App.css";

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [photoCount, setPhotoCount] = useState(0);
  const [showFrameSelection, setShowFrameSelection] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [flash, setFlash] = useState(false);
  const [frameColor, setFrameColor] = useState("#FFFFFF"); // Default frame color
  const webcamRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0 && isRecording) {
      capturePhoto();
    }
  }, [countdown, isRecording]);

  const startBooth = () => {
    setIsRecording(true);
    setPhotos([]);
    setPhotoCount(0);
    setShowFrameSelection(false);
    setCountdown(10);
  };

  const capturePhoto = () => {
    if (photoCount < 4) {
      setFlash(true);
      setTimeout(() => {
        const screenshot = webcamRef.current.getScreenshot();
        setPhotos((prevPhotos) => [...prevPhotos, screenshot]);
        setPhotoCount((prevCount) => prevCount + 1);
        setFlash(false);
        if (photoCount + 1 < 4) {
          setCountdown(10);
        } else {
          setShowFrameSelection(true);
        }
      }, 500);
    }
  };

  const handleDownload = () => {
    html2canvas(frameRef.current).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "photo-booth.png";
      link.click();
    });
  };

  const retryPhotos = () => {
    setIsRecording(false);
    setPhotos([]);
    setPhotoCount(0);
    setShowFrameSelection(false);
    setCountdown(0);
  };

  return (
    <div className="App">
      {!isRecording ? (
        <div className="instructions">
          <h1>Photo Booth</h1>
          <p>Strike a pose! You have 10 seconds between each shot.</p>
          <button onClick={startBooth}>Start</button>
        </div>
      ) : (
        <div className="photo-booth">
          <div className="camera-container">
            {photoCount < 4 && (
              <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              videoConstraints={{
                facingMode: "user", // Change to "environment" for rear camera
                width: 1280,
                height: 720
              }}
              mirrored={true} // Fixes the mirroring issue
              style={{
                width: "100%",
                maxWidth: "640px", // Ensure good size on mobile
                height: "auto",
                borderRadius: "10px" // Force landscape mode
              }}
            />
            )}
            {countdown > 0 && <div className="countdown">{countdown}</div>}
            {flash && <div className="flash-effect"></div>}
          </div>

          {showFrameSelection && (
            <div
              id="photo-container"
              ref={frameRef}
              className="photo-frame"
              style={{ backgroundColor: frameColor }}
            >
              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`photo-${index}`}
                  className="photo-item"
                />
              ))}
              <h2 className="frame-text">Photobooth</h2>
            </div>
          )}

          {showFrameSelection ? (
            <div className="frame-selection">
              <h2>Select Frame Color</h2>
              <div className="color-options">
                {["#FF0000", "#FFFF00", "#0000FF", "#FF00FF", "#00FF00", "#00FFFF"].map(
                  (color) => (
                    <button
                      key={color}
                      className="color-btn"
                      style={{ backgroundColor: color }}
                      onClick={() => setFrameColor(color)}
                    ></button>
                  )
                )}
              </div>
              <button onClick={handleDownload}>Download</button>
              <button onClick={retryPhotos}>Retry</button>
            </div>
          ) : (
            <p>{photoCount < 4 ? `Photo ${photoCount + 1}` : "Done!"}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
