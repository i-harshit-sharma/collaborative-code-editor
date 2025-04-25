const Lorem = () => {
  return (
    <div className="grid grid-cols-20 grid-rows-20 h-screen w-full">
      {Array.from({ length: 400 }).map((_, index) => (
        <div
          key={index}
          className="bg-blue-500 border border-white text-center text-white font-bold flex items-center justify-center"
        >
          {/* {index + 1} */}
        </div>
      ))}
    </div>
  );
};

export default Lorem;
