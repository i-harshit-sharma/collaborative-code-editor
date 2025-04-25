import React, { useState, forwardRef } from "react";


//   return (
//     <>
//       <div className='pt-2 flex items-start justify-center'>
//         <div className="max-w-md bg-white border-r-[1px] border-gray-300">
//           <div className="">
//           <div className="flex justify-between items-center mb-4 ">
//             <h2 className="text-md font-semibold ml-4">
//               {currentDate.toLocaleString("default", {
//                 month: "long",
//               })}{" "}
//               {currentDate.getFullYear()}
//             </h2>
//             <div>
//               <button
//                 className="text-gray-500 hover:text-black h-7 w-7 mr-2"
//                 onClick={handlePrevMonth}
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" className="om"><path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"></path></svg>
//               </button>
//               <button
//                 className="text-gray-500 hover:text-black h-7 w-7 mr-2"
//                 onClick={handleNextMonth}
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" className="om"><path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path></svg>
//               </button>
//             </div>
//           </div>
//           <div className="grid grid-cols-7 gap-3">
//             {daysOfWeek.map((day, index) => (
//               <div
//                 key={index}
//                 className="text-center font-semibold text-gray-500"
//               >
//                 {day}
//               </div>
//             ))}
//             {renderDays()}
//           </div>
//         </div>
//         </div>
//         <ScheduleCard></ScheduleCard>
//       </div>

//     </>
//   );
// };

// export default Calendar;


// forwardRef(({ title }, ref)
const Calendar = forwardRef(({ date, handleDate, schedule }, ref) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [email, setEmail] = useState("");

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // const renderDays = () => {
  //   const year = currentDate.getFullYear();
  //   const month = currentDate.getMonth();
  //   const daysInMonth = getDaysInMonth(year, month);
  //   const firstDayIndex = new Date(year, month, 1).getDay();
  //   // const lastDayIndex = new Date(year, month + 1, 0).getDay();
  //   console.log("first day index :",firstDayIndex)
  //   // const daysInLastMonth = new Date(year, month, 0).getDate();
  //   const prevMonth = month === 0 ? 11 : month - 1;
  //   const prevYear = month === 0 ? year - 1 : year;
  //   const daysInLastMonth = getDaysInMonth(prevYear, prevMonth);
  //   // console.log("first day index :",firstDayIndex)
  //   const previousMonthDays = daysInLastMonth.slice(-firstDayIndex);
  //   console.log("previous month days :",daysInLastMonth)
  //   // const previousMonthDays = Array.from(
  //   //   { length: firstDayIndex },
  //   //   (_, i) => null
  //   // );
  //   console.log("selected previous month days :",previousMonthDays)
  //   // const nextMonthDays = getDaysInMonth(year, month+1);
  //   // const nextMonthDays = daysInFollowingMonth(year, month, lastDayIndex);
  //   // const nextMonthDays = Array.from(
  //   //   { length: 6 - lastDayIndex },
  //   //   (_, i) => null
  //   // );
  //   const totalDays = [...previousMonthDays, ...daysInMonth, ...nextMonthDays];
  //   console.log(totalDays)
  //   return totalDays.map((day, index) => (
  //     <div
  //       key={index}
  //       className={`w-10 h-10 flex items-center justify-center rounded-full font-sans text-gray-950 font-medium ${day &&
  //         day.toDateString() === selectedDate?.toDateString()
  //         ? "bg-blue-600 text-white"
  //         : day &&
  //           day.toDateString() === new Date().toDateString()
  //           ? "bg-blue-200"
  //           : "text-gray-700"
  //         } ${day ? "cursor-pointer hover:bg-blue-100" : "text-gray-300"
  //         }`}
  //       onClick={() => { day && setSelectedDate(day); handleDate(day) }}
  //     >
  //       {day ? day.getDate() : ""}
  //     </div>
  //   ));
  // };

  const renderDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get days of current month
    const daysInMonth = getDaysInMonth(year, month);

    // Get first day index of current month
    const firstDayIndex = new Date(year, month, 1).getDay();

    // Get days from previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    const lastDayIndex = new Date(year, month + 1, 0).getDay();
    const nextMonthDays = Array.from({ length: 6 - lastDayIndex }, (_, i) =>
      new Date(year, month + 1, i + 1)
    );
    console.log(firstDayIndex, "  ", 6 - lastDayIndex)
    const previousMonthDays = firstDayIndex == 0 ? daysInPrevMonth.slice(0, 0) : daysInPrevMonth.slice(-firstDayIndex);
    console.log("previous month days :", previousMonthDays)

    const totalDays = [...previousMonthDays, ...daysInMonth, ...nextMonthDays];

    return totalDays.map((day, index) => {
      const isPrevMonth = day.getMonth() < month;
      const isNextMonth = day.getMonth() > month;
      const isCurrentDay = day.toDateString() === new Date().toDateString();
      const isSelected = day.toDateString() === selectedDate?.toDateString();

      return (
        <div key={index} className="flex justify-center items-center border-b-[1px] border-gray-300 w-16 h-12">
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full font-sans font-medium text-center
            ${isSelected ? "bg-blue-600 text-white hover:bg-blue-400" : ""}
            ${isSelected && isCurrentDay ? "bg-gray-800 text-white " : ""}
            ${isCurrentDay ? "hover:bg-gray-300 font-semibold bg-blue-300" : ""}
            ${isPrevMonth || isNextMonth ? "text-gray-400" : "text-gray-950"}
            cursor-pointer hover:bg-blue-100`}
            onClick={() => { setSelectedDate(day); handleDate(day); }}
          >
            {day.getDate()}
          </div>
        </div>
      );
    });
  };


  const ScheduleCard = () => {


    const [hoveredId, setHoveredId] = useState(null);

    return (
      <div className="max-w-sm max-h-[20rem] bg-white overflow-y-auto p-8 flex flex-col align-center ">
        <h2 className="text-lg font-bold mb-4">
          Schedule for {`${selectedDate.toLocaleDateString("en-gb", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`}
        </h2>
        <div className="space-y-4 max-h-[280px] overflow-scroll">
          {schedule.filter(
            (item) =>
              new Date(item.date).toLocaleDateString() ===
              selectedDate.toLocaleDateString()
          ).map((item) => (
            <div
              key={item.id}
              className={`flex items-center  p-2 rounded-lg transition-all ${hoveredId === item.id ? "bg-gray-100" : ""
                } `}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="ml-4 flex-1 cursor-pointer">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">{item.time}</p>
              </div>
            </div>
          ))}
          {schedule.filter((item) => new Date(item.date).toLocaleDateString() === selectedDate.toLocaleDateString()).length === 0 ? <div className="my-3">No doctors available on selected dates</div> : <div></div>}
        </div>
      </div>
    );

  };
  return (
    <section className="w-full flex justify-center align-center " ref={ref}>
      <div className="max-w-container  flex flex-col items-center justify-center w-full">
        <div className="sm:max-w-[50%] w-full flex justify-end sm:px-16 px-4 border-r-[1px]">
          <div className="max-h-sm max-w-sm">
            <div className="flex justify-between items-center mb-4 ">
              <h2 className="text-md font-semibold ml-4">
                {currentDate.toLocaleString("default", {
                  month: "long",
                })}{" "}
                {currentDate.getFullYear()}
              </h2>
              <div>
                <button
                  className="text-gray-500 hover:text-black h-7 w-7 mr-2"
                  onClick={handlePrevMonth}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" className="om"><path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd"></path></svg>
                </button>
                <button
                  className="text-gray-500 hover:text-black h-7 w-7 mr-2"
                  onClick={handleNextMonth}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" className="om"><path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"></path></svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 ">
              {daysOfWeek.map((day, index) => (
                <div
                  key={index}
                  className="text-center font-semibold text-gray-500 w-16 h-12"
                >
                  {day}
                </div>
              ))}
              {renderDays()}
            </div>
          </div>
        </div>
        <div className="sm:max-w-[50%] w-full sm:px-16 pl-4 mt-6 pr-2">
          <ScheduleCard />
        </div>
      </div>
    </section>
  )
})
export default Calendar;