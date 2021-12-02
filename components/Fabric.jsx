import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image, Transformer } from "react-konva";

const URLImage = ({
  id,
  src,
  x,
  y,
  selectedId,
  mouseY,
  mouseX,
  images,
  setImages,
}) => {
  const imageRef = useRef(null);
  const [image, setImage] = useState(null);
  const [xPos, setXPos] = useState(x);
  const [yPos, setYPos] = useState(y);
  const [selected, setSelected] = useState(null);

  const updateLocation = (e) => {
    // onDrag -> Set position of image
    setImages({ ...images, [id]: { x: xPos, y: yPos } });
    setXPos(e.target.attrs.x);
    setYPos(e.target.attrs.y);
    setSelected(selectedId);
  };

  const loadImage = () => {
    // create new Image() object
    const img = new window.Image();
    // set the src from the props
    img.src = src;
    setXPos(mouseX);
    setYPos(mouseY);
    // set the imageRef current DOM element to the new Image object
    imageRef.current = img;
    // call handleLoad function when DOM element loads
    imageRef.current.addEventListener("load", handleLoad);
  };

  const handleLoad = () => {
    // set Image as the element
    setImage(imageRef.current);
  };

  useEffect(() => {
    // create on first call
    loadImage();
    return () => {
      // if DOM element eists, remove the handleLoad function
      if (imageRef.current) {
        imageRef.current.removeEventListener("load", handleLoad);
      }
    };
  }, []);

  useEffect(() => {
    // if source changes in the props, reload
    loadImage();
  }, [src]);

  return (
    <Image
      stroke="white"
      strokeWidth={id == selected ? 10 : 0}
      x={xPos}
      y={yPos}
      image={image}
      onDragMove={updateLocation}
      onDragEnd={() => {
        setSelected(null);
      }}
      isSelected={id == selected}
      draggable
    />
  );
};

export default function Fabric() {
  const [images, setImages] = useState({});
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({
    x: 0,
    y: 0,
  });

  const handlePaste = (e) => {
    console.log("HELLO!");
  };
  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    var url = URL.createObjectURL(file);
    const selectedId = Object.keys(images).length + 1;
    setImages({
      ...images,
      [selectedId]: {
        src: url,
        x: (mouseX - stagePosition.x) / stageScale,
        y: (mouseY - stagePosition.y) / stageScale,
      },
    });
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    setMouseX(stage.getRelativePointerPosition().x);
    setMouseY(stage.getRelativePointerPosition().y);
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();

    const scaleBy = 1.11;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    setMouseX(mousePointTo.x);
    setMouseY(mousePointTo.y);

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setStageScale(newScale);
    setStagePosition({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    });
  };

  const handleDragMove = (e) => {};

  const handleClick = (e, index) => {};

  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onFileDrop}
      onPaste={handlePaste}
    >
      <Stage
        className="bg-gray-700 transition-all duration-500 ease-in-out"
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseMove={handleMouseMove}
        preventDefault={false}
        onWheel={handleWheel}
        onPaste={handlePaste}
        onDragMove={handleDragMove}
        draggable
      >
        <Layer preventDefault={false}>
          {Object.keys(images).length > 0 &&
            Object.keys(images).map((key, index) => {
              return (
                <URLImage
                  key={index}
                  id={index + 1}
                  src={images[key].src}
                  x={images[key].x}
                  y={images[key].y}
                  mouseX={mouseX}
                  mouseY={mouseY}
                  selectedId={key}
                  images={images}
                  setImages={setImages}
                />
              );
            })}
        </Layer>
      </Stage>
    </div>
  );
}
