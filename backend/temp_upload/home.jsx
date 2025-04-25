import { useState, useRef } from "react";
import "../App.css";
import Navbar from "../Components/navbar";
import Calendar from "../Components/calendar";
import Lorem from "../Components/Lorem";
// import ScheduleCard from '../Components/scheduleCard'
import schedule from "../assets/doctor_schedule_jan_2025.json";
import Carousel from "../Components/carousal";
import img1 from "../assets/images/fpImg/DSC_1410.jpg";
import img2 from "../assets/images/fpImg/DSC_1385.jpg";
import img3 from "../assets/images/fpImg/DSC_1400.jpg";
import img4 from "../assets/images/fpImg/DSC_1402.jpg";
import img5 from "../assets/images/fpImg/DSC_1405.jpg";
import img6 from "../assets/images/fpImg/DSC_1411.jpg";
import img7 from "../assets/images/fpImg/DSC_1381.jpg";
import img8 from "../assets/images/fpImg/DSC_1411.jpg";
import img9 from "../assets/images/fpImg/DSC_1545.jpg";
import img10 from "../assets/images/fpImg/DSC_1456.jpg";
import img11 from "../assets/images/fpImg/DSC_1460.jpg";
import img12 from "../assets/images/fpImg/DSC_1473.jpg";

function Home() {
  const [loginState, setLoginState] = useState(false);
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState(false);
  const [date, setDate] = useState(new Date());
  const handleSignOut = (e) => {
    setUsername("");
    setEmail("");
    setLoginState(e);
    setImage("");
  };
  const handleMode = (e) => {
    setMode(e);
  };

  const handleDate = (e) => {
    console.log(e);
    setDate(e);
  };
  const scrollRef = useRef(null);
  const scrollSection = () => {
    scrollRef.current.scrollIntoView({ behavior: "smooth" });
  };

  //   "https://placehold.co/400x400?text=Slide+1",
  //   "https://placehold.co/400x400?text=Slide+2",
  //   "https://placehold.co/400x400?text=Slide+3",
  //   "https://placehold.co/400x400?text=Slide+4",
  //   "https://placehold.co/400x400?text=Slide+5",

  const slides = [
    [
      img1,
      img2,
      img3,
      "Medical Camp NIT Delhi",
      "NIT Delhi organised a medical camp for the students and staff of the college. The camp was organised in the college premises and was a great success. The camp was organised in collaboration with the local hospital and the doctors were very helpful and friendly.",
    ],
    [
      img4,
      img5,
      img6,
      "Medical Camp NIT Delhi",
      "NIT Delhi organised a medical camp for the students and staff of the college. The camp was organised in the college premises and was a great success. The camp was organised in collaboration with the local hospital and the doctors were very helpful and friendly.",
    ],
    [
      img7,
      img8,
      img9,
      "Medical Camp NIT Delhi",
      "NIT Delhi organised a medical camp for the students and staff of the college. The camp was organised in the college premises and was a great success. The camp was organised in collaboration with the local hospital and the doctors were very helpful and friendly.",
    ],
    [
      img10,
      img11,
      img12,
      "Medical Camp NIT Delhi",
      "NIT Delhi organised a medical camp for the students and staff of the college. The camp was organised in the college premises and was a great success. The camp was organised in collaboration with the local hospital and the doctors were very helpful and friendly.",
    ],
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Subscribed with email: ${email}`);
    setEmail("");
  };



  let arr = [
    ["1","Artemis Hospital, Gurugram","Sector-51, Gurugram – 122001, Haryana","Emergency : +91- 124 4588 888 For Appointments : +91-124 4511 111","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Artemis-Hospital.pdf"],
    ["2","Fortis Hospital, Shalimar Bagh","AA-299, Shaheed Udham Singh Marg, AA Block, Poorbi Shalimar Bagh, Shalimar Bagh, Delhi, 110088","011 4530 2222 08045781371","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Fortis-Hopital.pdf"],
    ["3","Shri Aggarsain Hospital Rohini","Police Station, PSP Aman Vihar, CH Bhim Singh Nambardar Marg, Sector 22, Rohini, New Delhi, Delhi 110086","011-66636600 , 011-45911911 Ambulance service: 011-66636600 011-45911911","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Shri-Aggarsain-Hospital-Rohini.pdf"],
    ["4","Sir Ganga Ram Hospital","Sir Ganga Ram Hospital Marg, Old Rajinder Nagar, New Rajinder Nagar, New Delhi, Delhi 110060","011-42254000","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Sir-Ganga-Ram-Hospital.pdf"],
    ["5","Venkateshwar Hospital, Dwarka","Sector 12 Rd, Sector 18, Sector 18A Dwarka, Dwarka, New Delhi, Delhi 110075","011 4855 5555 For Ambulance Service: +91-11-48-555-666","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Venkateshwar-Hopital-Dwarka.pdf"],
    ["6","Dr. Lal Path Lab","National Reference laboratory, B7 Rd, Block E, Sector 18, Rohini, New Delhi, Delhi 110085","011 4984 7500","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Dr.-Lal-Path-Lab.pdf"],
    ["7","Must and More Health Care Pvt. Ltd. Rohini","West Metro Station, Kings Mall, Plot No. 1B1, 3rd Floor, Kings Mall, Bhagwan Mahavir Marg, near Rohini, Sector 10, Delhi 110085","011-6644-4444","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Must-and-More-Health-Care-Pvt.-Ltd.-Rohini.pdf"],
    ["8","Clove Dental","First floor, Eldeco Centre, Malviya Nagar metro station, New Delhi – 110017","North India +919599734477, South and West India +918587856826","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Clove-Dental.pdf"],
    ["9","Center for Sight","All Delhi/NCR locations (List is attached)","For Appointments: 9810423972, 01142504250","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Center-for-Sight.pdf"],
    ["10","Saroj Super Speciality Hospital","Sector-14(Extn.)Industrial Area, Near Madhuban Chowk, Rohini, Delhi- 110085","011 4944 4444","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Saroj-Super-Speciality-Hospital.pdf"],
    ["11","Saroj Medical Institute","78B, Sector 19, Rohini, Delhi, 110042","011 6901 3333","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Saroj-Medical-Institute.pdf"],
    ["12","Sardana eye institute","Rajori Garden","9716101030","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Sardana-eye-institute.pdf"],
    ["13","Nishtha Speciality Hospital, Narela","Plot No. 22 near SHRC Hospital,Pocket-7,Sector A-10, Narela, Delhi-110040","9821623577","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Nishtha-Speciality-Hospital-Narela.pdf"],
    ["14","Ayushman Hospital.","Sector-10 Dwarka New Delhi-110075","9971141488","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Ayushman-Hospital..pdf"],
    ["15","Shri Bhagwan Diagnostic & Imaging Centre Pvt. Ltd., Narela.","2116, Bawana Road, Narela, Delhi – 110040","9599593107","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Shri-Bhagwan-Diagnostic-Imaging-Centre-Pvt.-Ltd.-Narela..pdf"],
    ["16","Sushila Hospital, Narela","Gali No. 09 Gautam Colony, Safiabad Road, Narela, New Delhi – 110040","9811505961","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Sushila-Hospital-Narela.pdf"],
    ["17","Hasija Hospital & Trauma Care Centre, Kundli","32 Milestone, G.T Karnal Road, Kundli, Sonipat, Haryana 131028","9416536804, 9812032202","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Hasija-Hospital-Trauma-Care-Centre-Kundli.pdf"],
    ["18","Tulip Multispeciality Hospital, Sonipat","Near vivekanand chowk, Delhi road, Sonipat – 131001, Haryana","7404321021","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Tulip-Multispeciality-Hospital-Sonipat.pdf"],
    ["19","Khanna Medicare Centre (Eye Hospital)","W-6, MAIN PATEL ROAD, WEST PATEL NAGAR, SHADIPUR METRO STATION, PILLAR NO. 234, NEW DELHI – 110008","9811087151, 9911087151","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Khanna-Medicare-Centre-Eye-Hospital.pdf"],
    ["20","Khanna Eye Centre, Model Town","A-2/2, MODEL TOWN-1st, NEW DELHI-110009","9810067048","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Khanna-Eye-Centre-Model-Town.pdf"],
    ["21","Shroff Eye Centre, Delhi NCR.","All Delhi NCR locations (mentioned in MoU)","8826267999","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Shroff-Eye-Centre-Delhi-NCR..pdf"],
    ["22","Saxena Multispeciality Hospital, Sonipat","TP Scheme, 112/113, Delhi Road, Sonipat, Haryana","01302218811","https://nitdelhi.ac.in/wp-content/uploads/2024/07/Saxena-Multispeciality-Hospital-Sonipat.pdf"],
  ]

  return (
    <>
      <Navbar
        logIn={loginState}
        email={email}
        image={image}
        signoutSignal={handleSignOut}
        username={username}
        mode={mode}
        handleMode={handleMode}
      ></Navbar>
      <Carousel slides={slides} />
      <div className="w-full justify-center items-center h-22 hidden md:flex">
        <button onClick={scrollSection} className="flex flex-col">
          <span className="animate-bounce h-12 w-12"></span>
          Scroll
        </button>
      </div>
      <div className="w-full flex flex-col ">
        <div className="m-6">
          <div className="text-xl font-bold">Emergency Numbers</div>
          <div>
            <div className="font-semibold">
              Disaster Helpline :<span className="font-medium">&nbsp;1077</span>
            </div>
            <div className="font-semibold">
              Women Helpline :<span className="font-normal">&nbsp;1091</span>
            </div>
            <div className="font-semibold">
              Child Helpline :<span className="font-normal">&nbsp;1098</span>
            </div>
            <div className="font-semibold">
              Police :<span className="font-normal">&nbsp;100</span>
            </div>
            <div className="font-semibold">
              Fire and Rescue :<span className="font-normal">&nbsp;101</span>
            </div>
            <div className="font-semibold">
              Ambulance :<span className="font-normal">&nbsp;102/1099</span>
            </div>
          </div>
        </div>
      </div>
      <Calendar
        date={date}
        handleDate={handleDate}
        schedule={schedule}
        ref={scrollRef}
      ></Calendar>
      <div className="flex items-center justify-center">
        <div className="bg-white p-8 text-center max-w-sm w-full">
          <h2 className="text-2xl font-bold mb-4">
            Want regular updates regarding timings and events?
          </h2>
          <p className="text-gray-600 mb-6">Sign up for our newsletter.</p>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white font-medium py-2 rounded-md hover:bg-[#212178] transition"
            >
              Subscribe
            </button>
          </form>
          <p className="text-gray-500 text-sm mt-4">
            We care about your data. Read our{" "}
            <a href="#" className="text-indigo-600 underline">
              privacy policy
            </a>
            .
          </p>
        </div>
      </div>
      <h1>Empanelled Hospitals</h1>
      <div className="">
        <div className="">
          <h1>List of Empanelled Hospitals/ Medical Organizations:</h1>
          <div className="grid grid-cols-[29px_160px_160px_160px_60px] overflow-y-scroll w-sm ml-3 border-indigo-500 border-l-2 border-t-2 sm:w-full">
            <div className="font-medium text-lg border-b-[1px] border-r-[1px] -red-600 text-center bg-gray-700 text-white">
              S. No.
            </div>
            <div className="font-medium text-lg border-b-[1px] border-r-[1px] -blue-600 text-center bg-gray-700 text-white">
              Name of the Hospital
            </div>
            <div className="font-medium text-lg border-b-[1px] border-r-[1px] -green-600 text-center bg-gray-700 text-white">
              Location and Address
            </div>
            <div className="font-medium text-lg border-b-[1px] border-r-[1px] -purple-400 text-center bg-gray-700 text-white">
              Contact Number
            </div>
            <div className="font-medium  border-b-[1px] border-r-[1px] -orange-400 text-center bg-gray-700 text-white">
              MoU
            </div>
            {arr.map((item,index)=>{
              return(
                <>
                <div className="border-b-[1px] border-r-[1px] -red-600 text-center">
                  {item[0]}
                </div>
                <div className="border-b-[1px] border-r-[1px] -blue-600 text-center">
                {item[1]}
                </div>
                <div className="border-b-[1px] border-r-[1px] -green-600 text-center">
                {item[2]}
                </div>
                <div className="font-  border-b-[1px] border-r-[1px] -purple-400 text-center">
                {item[3]}
                </div>
                <div className="-orange-400 text-center  text-lg border-b-[1px] border-r-[1px]">
                  <a href={`${item[4]}`} className="underline text-gray-700">Click here</a>
                </div>
                </>
              )
            })}
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          if (loginState === true) {
            handleSignOut(!loginState);
          } else {
            setEmail("mail@gmail.com");
            setUsername("Hashit Sharma");
            setLoginState(!loginState);
            // setImage(
            //   "https://images.unsplash.com/photo-1736598734718-daa665cc511c?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            // );
          }
        }}
      >
        {!loginState ? <p>Login</p> : <p>Log out</p>}
      </button>

      <p>{loginState == true}</p>
      <p>{email}</p>
      <p>{username}</p>
      <p>{image}</p>
      <p>{mode ? "Dark" : "Light"}</p>
      <p>{date.toLocaleDateString()}</p>
      <Lorem>1</Lorem>
    </>
  );
}

export default Home;
