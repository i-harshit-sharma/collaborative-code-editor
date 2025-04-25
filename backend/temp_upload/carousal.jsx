import React, { useState, useEffect } from "react";

const Carousel = ({ slides, autoSlide = true, autoSlideInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!slides.length) {
    return <div>No slides available</div>;
  }
  const nextSlide = () => {
    // console.log("Next Slide", prevIndex);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    if (!autoSlide) return;

    const interval = setInterval(nextSlide, autoSlideInterval);

    return () => clearInterval(interval); // Cleanup on unmount or when `autoSlide` changes
  }, [autoSlide, autoSlideInterval]);
  // console.log(slides[0][0])


  return (
    <div className="relative w-full max-w-7xl mx-auto overflow-hidden mt-2 rounded-xl">
      {/* Carousel Slides */}
      <div
        className="flex transition-transform duration-500 p-0 "
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full flex-shrink-0 flex gap-[18px] max-[1320px]:justify-center max-[1320px]:items-center max-[915px]:px-6">
            <img
              src={slide[0]}
              alt={`Slide ${index + 1}, Image 1`}
              className=" max-h-[569px]"
              loading="eager"
              fetchPriority="high"
            />
            <div className=" flex flex-col gap-[25px] max-[1320px]:hidden">
              <img
                src={slide[1]}
                alt={`Slide ${index + 1}, Image 2`}
                className=" max-h-[556px]"
                loading="eager"
                fetchPriority="low"
              />
              <img
                src={slide[2]}
                alt={`Slide ${index + 1}, Image 3`}
                className=" max-h-[556px]"
                loading="eager"
                fetchPriority="low"
              />
            </div>
            <div className="absolute min-[768px]:bottom-14 max-[425px]:bottom-6 bottom-10 w-full flex justify-center items-center">
              <div className=" bg-opacity-75 rounded-xl bg-white max-[915px]:mx-12">
                <h1 className="text-4xl max-[730px]:text-3xl max-[600px]:text-2xl  p-0 text-black text-center min-[915px]:max-w-3xl min-[1320px]:max-w-6xl  max-[420px]:text-xl max-[420px]:p-1 max-[545px]:p-3 max-[345px]:text-sm max-[345px]:font-semibold max-[345px]:p-2">{slide[3]}</h1>
                <h1 className="text-base p-3 max-[600px]:p-1 max-[730px]:text-sm text- text-black text-center min-[915px]:max-w-3xl min-[1320px]:max-w-6xl max-[545px]:hidden">{slide[4]}</h1>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 focus:outline-none"
      >
        ❮
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 focus:outline-none"
      >
        ❯
      </button>

      {/* Indicators */}

      <div className="absolute min-[425px]:bottom-4 bottom-1 w-full flex justify-center  items-center">
        <div className="space-x-2 flex justify-center items-center bg-gray-800 bg-opacity-60 p-1 min-[768px]:p-2 rounded-full">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`min-[768px]:w-8 w-5 h-1 rounded-full ${index === currentIndex ? "bg-[#212178]" : "bg-gray-300"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;