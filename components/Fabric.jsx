import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image, Transformer } from "react-konva";

const URLImage = ({
  id,
  src,
  x,
  y,
  mapId,
  mouseY,
  mouseX,
  images,
  setImages,
  selected,
  setSelected,
  isSelected,
  stageScale,
}) => {
  const imageRef = useRef(null);
  const [image, setImage] = useState(null);
  const [xPos, setXPos] = useState(x);
  const [yPos, setYPos] = useState(y);

  const handleClick = (e) => {
    setSelected(mapId);
    console.log(imageRef);
  };

  const updateLocation = (e) => {
    // onDrag -> Set position of image
    setXPos(e.target.x());
    setYPos(e.target.y());
    setImages({
      ...images,
      [id]: {
        x: xPos,
        y: yPos,
        height: e.target.getHeight(),
        width: e.target.getWidth(),
      },
    });
    console.log(images[id]);
    setSelected(mapId);
    console.group("Image");
    console.log(e.target.x(), e.target.y());
    console.groupEnd();
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
    // setImages({
    //   ...images,
    //   [id]: {
    //     x: xPos,
    //     y: yPos,
    //     height: img.getHeight(),
    //     width: img.getWidth(),
    //   },
    // });
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
    <>
      <Image
        stroke="white"
        ref={imageRef}
        strokeWidth={id == selected ? 10 / stageScale : 0}
        x={xPos}
        y={yPos}
        image={image}
        onDragMove={updateLocation}
        onDragEnd={updateLocation}
        onClick={handleClick}
        draggable
      />
    </>
  );
};

// ------------ MAIN FUNCTIOn -----------

export default function Fabric() {
  const [images, setImages] = useState({});
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({
    x: 0,
    y: 0,
  });
  const [selected, setSelected] = useState(null);
  const stageRef = useRef(null);

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
    const pointerPosition = stageRef.current.getRelativePointerPosition();
    const file = e.dataTransfer.files[0];
    var url = URL.createObjectURL(file);
    const selectedId = Object.keys(images).length + 1;
    setImages({
      ...images,
      [selectedId]: {
        src: url,
        x: pointerPosition.x,
        y: pointerPosition.y,
      },
    });
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    setMouseX(stage.getRelativePointerPosition().x);
    setMouseY(stage.getRelativePointerPosition().y);
  };

  const handleWheel = (e) => {
    const stage = e.target.getStage();
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    const absolutePointerPosition = stage.getPointerPosition(); // Position in Window
    const relativePointerPosition = stage.getRelativePointerPosition(); // Relative position of mouse to stage

    setMouseX(absolutePointerPosition.x);
    setMouseY(absolutePointerPosition.y);

    if (newScale < 10 && newScale > 0.1) {
      setStageScale(newScale);
      setStagePosition({
        x: absolutePointerPosition.x - relativePointerPosition.x * newScale,
        y: absolutePointerPosition.y - relativePointerPosition.y * newScale,
      });
    }
  };

  const handleDragMove = (e) => {
    const stage = stageRef.current;

    setStagePosition({
      x: stage.x(),
      y: stage.y(),
    });
  };

  const handleClick = (e, index) => {
    if (e.target.className != "Image") {
      setSelected(null);
    }
  };

  const handleKeyDown = (e) => {
    const { keyCode } = e;
    const stage = stageRef.current;
    console.log(keyCode);
    // F - keyCode 70
    if (keyCode === 70) {
      if (Object.keys(images).length > 0) {
        setStageScale(1);
        const x = -images[1].x;
        const y = -images[1].y;
        setStagePosition({
          x,
          y,
        });
      } else {
        setStagePosition({
          x: 0,
          y: 0,
        });
      }
    }
    // Delete
    if (keyCode === 46) {
      console.log(selected);
      if (selected !== null) {
        let mp = images;
        delete mp[selected];
        setImages(mp);
      }
    }
  };

  useEffect(() => {
    // console.log("Scale: ", stageScale.toFixed(2));
    // console.log(
    //   "stagePosition: ",
    //   Math.floor(stagePosition.x),
    //   Math.floor(stagePosition.y)
    // );
    // if (Object.keys(images).length > 0) {
    //   console.log(
    //     "Image: ",
    //     Math.floor(images[1].x - window.innerWidth / 2),
    //     Math.floor(images[1].y - window.innerHeight / 2)
    //   );
    // }
    // console.log(
    //   "SCREEN MID: ",
    //   Math.floor(window.innerWidth / 2),
    //   Math.floor(window.innerHeight / 2)
    // );
  }, [stageScale, stagePosition, images]);

  useEffect(() => {
    console.log(stageRef.current);
  }, []);

  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onFileDrop}
      tabIndex={1}
      onKeyDown={handleKeyDown}
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
        onDragMove={handleDragMove}
        onTouchStart={handleMouseMove}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        ref={stageRef}
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
                  mapId={key}
                  images={images}
                  setImages={setImages}
                  selected={selected}
                  setSelected={setSelected}
                  isSelected={index + 1 == selected}
                  stageScale={stageScale}
                />
              );
            })}
        </Layer>
      </Stage>
    </div>
  );
}
