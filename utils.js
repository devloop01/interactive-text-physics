export function getRandomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function getDeviceOrientation() {
  let error = null;
  let orientation = null;

  const handleOrientation = (event) => {
    orientation = {
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    };
  };

  const revokeAccess = () => {
    window.removeEventListener("deviceorientation", handleOrientation);
    orientation = null;
  };

  const requestAccess = async () => {
    if (!window.DeviceOrientationEvent) {
      error = new Error("Device orientation event is not supported by your browser");
      return false;
    }

    if (
      DeviceOrientationEvent.requestPermission &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      let permission;
      try {
        permission = await DeviceOrientationEvent.requestPermission();
      } catch (err) {
        error = err;
        return false;
      }
      if (permission !== "granted") {
        error = new Error("Request to access the device orientation was rejected");
        return false;
      }
    }

    window.addEventListener("deviceorientation", handleOrientation);
    return true;
  };

  return {
    get orientation() {
      return orientation;
    },
    get error() {
      return error;
    },
    requestAccess,
    revokeAccess,
  };
}

export function getFont(font) {
  return `${font.weight} ${font.size}px ${font.family}`;
}
