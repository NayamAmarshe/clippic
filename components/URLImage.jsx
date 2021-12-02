import { useRef, useState, useEffect } from "react";
import { Image } from "react-konva";

const URLImage = ({ src, x, y }) => {
  const imageRef = useRef(null);
  const [image, setImage] = useState(null);
  const [xPos, setXPos] = useState(x);
  const [yPos, setYPos] = useState(y);

  const loadImage = () => {
    const img = new window.Image();
    img.src = src;
    img.crossOrigin = "Anonymous";
    imageRef.current = img;
    imageRef.current.addEventListener("load", handleLoad);
  };

  const handleLoad = () => {
    setImage(imageRef.current);
  };

  useEffect(() => {
    loadImage();
    return () => {
      if (imageRef.current) {
        imageRef.current.removeEventListener("load", handleLoad);
      }
    };
  }, []);

  useEffect(() => {
    loadImage();
  }, [src]);

  return <Image x={xPos} y={yPos} image={image} draggable />;
};

export default URLImage;
