import React from "react";
import { createRoot } from "react-dom/client";
import { ShaderGradientCanvas, ShaderGradient } from "https://esm-shadergradient.onrender.com/without-store.mjs";

const shaderRoot = document.querySelector("[data-shader-root]");

if (shaderRoot) {
  const urlString =
    "https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000001&brightness=1.2&cAzimuthAngle=180&cDistance=3.61&cPolarAngle=90&cameraZoom=1&color1=%23000000&color2=%23ede5f6&color3=%23000001&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=off&lightType=3d&pixelDensity=3&positionX=-1.4&positionY=0&positionZ=0&range=disabled&rangeEnd=40&rangeStart=0&reflection=0.9&rotationX=0&rotationY=10&rotationZ=50&shader=defaults&type=waterPlane&uAmplitude=4.6&uDensity=0.8&uFrequency=5.5&uSpeed=0.2&uStrength=10&uTime=0&wireframe=false";

  const root = createRoot(shaderRoot);

  root.render(
    React.createElement(
      ShaderGradientCanvas,
      {
        fov: 45,
        pixelDensity: 3,
        pointerEvents: "none",
        style: {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%"
        }
      },
      React.createElement(ShaderGradient, {
        control: "query",
        urlString
      })
    )
  );
}
