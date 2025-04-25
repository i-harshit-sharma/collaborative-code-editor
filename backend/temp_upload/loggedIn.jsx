import React, { useState, useRef } from "react";
import { physioDoctors, gynacoDoctors, dermaDoctors, psychDoctors, endoDoctors } from "./doctorsInfo";

export const LoggedIn = () => {
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });


  const fields = [
    { name: 'Physiotherapist', Doctor: physioDoctors },
    { name: 'Gynaecologist', Doctor: gynacoDoctors },
    { name: 'Dermatologist', Doctor: dermaDoctors },
    { name: 'Psychologist', Doctor: psychDoctors },
    { name: 'Endocrinologist', Doctor: endoDoctors },
  ];

  const bookedSlots = ['10:15 AM', '11:00 AM', '12:45 PM']; // You can fetch this from the backend

  const doctorOptions = fields.find(field => field.name === selectedSpecialization)?.Doctor || [];

  const generateTimeSlots = (startTime, endTime) => {
    const timeSlots = [];
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    let currentHours = startHours;
    let currentMinutes = startMinutes;

    const formatTime = (hours, minutes) => {
      const h = hours % 12 || 12;
      const ampm = hours >= 12 ? "PM" : "AM";
      const m = minutes < 10 ? `0${minutes}` : minutes;
      return `${h}:${m} ${ampm}`;
    };

    while (
      currentHours < endHours ||
      (currentHours === endHours && currentMinutes < endMinutes)
    ) {
      const nextMinutes = currentMinutes + 15;
      if (nextMinutes === 60) {
        currentHours += 1;
        currentMinutes = 0;
      } else {
        currentMinutes = nextMinutes;
      }
      timeSlots.push(formatTime(currentHours, currentMinutes));
    }

    return timeSlots;
  };

  const availableSlots =
    selectedDoctor && selectedDate
      ? generateTimeSlots(selectedDoctor.startTime, selectedDoctor.endTime)
      : [];

  const selectedDay = selectedDate ? new Date(selectedDate).getDay() : null;
  const isDoctorAvailable =
    selectedDoctor && selectedDoctor.availableDays.includes(selectedDay);

  const handleSubmit = () => {
    if (!selectedSpecialization || !selectedDoctor || !selectedDate || !selectedTimeSlot) {
      setToast({ visible: true, message: "Please fill in all fields." });
      setTimeout(() => setToast({ visible: false, message: "" }), 3000);
      return;
    }

    setLoading(true);
    // Simulate an API call
    setTimeout(() => {
      setLoading(false);
      setToast({
        visible: true,
        message: `Your appointment with Dr. ${selectedDoctor.name} is booked on ${new Date(selectedDate).toDateString()} at ${selectedTimeSlot}.`,
      });
      // Reset selections
      setSelectedSpecialization("");
      setSelectedDoctor("");
      setSelectedDate("");
      setSelectedTimeSlot("");
      setTimeout(() => setToast({ visible: false, message: "" }), 3000);
    }, 2000);
  };

  const handleTimeSlotClick = (slot) => {
    if (!bookedSlots.includes(slot)) {
      setSelectedTimeSlot(slot);
    }
  };

  return (
    <div>
      {toast.visible && (
        <div className="toast">
          {toast.message}
        </div>
      )}

      <div className="p-6 bg-gray-100 rounded-lg max-w-4xl mx-auto">
  {/* Specialization and Doctor Selection */}
  <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-4">
    {/* Specialization Dropdown */}
    <div className="mb-4">
      <select
        value={selectedSpecialization}
        onChange={(e) => {
          setSelectedSpecialization(e.target.value);
          setSelectedDoctor("");
        }}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>Select Specialization</option>
        {fields.map((field, index) => (
          <option key={index} value={field.name}>
            {field.name}
          </option>
        ))}
      </select>
    </div>

    {/* Doctor Dropdown */}
    <div className="mb-4">
      <select
        value={selectedDoctor ? selectedDoctor.name : ""}
        onChange={(e) => {
          const selectedDoc = doctorOptions.find(
            (doctor) => doctor.name === e.target.value
          );
          setSelectedDoctor(selectedDoc);
        }}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          !selectedSpecialization ? "bg-gray-200 cursor-not-allowed" : ""
        }`}
        disabled={!selectedSpecialization}
      >
        <option value="" disabled>Select Doctor</option>
        {doctorOptions.map((doctor, index) => (
          <option key={index} value={doctor.name}>
            {doctor.name}
          </option>
        ))}
      </select>
    </div>

    {/* Date Picker */}
    <div className="mb-4">
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        min={new Date().toISOString().split("T")[0]}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          !selectedDoctor ? "bg-gray-200 cursor-not-allowed" : ""
        }`}
        disabled={!selectedDoctor}
      />
    </div>
  </div>

  {/* Time Slots */}
  <div className="mb-6">
    {selectedDoctor && selectedDate ? (
      isDoctorAvailable ? (
        availableSlots.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableSlots.map((slot, index) => (
              <div
                key={index}
                className={`p-2 text-center border rounded-lg cursor-pointer ${
                  bookedSlots.includes(slot)
                    ? "bg-red-500 text-white cursor-not-allowed"
                    : selectedTimeSlot === slot
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-blue-100"
                }`}
                onClick={() => handleTimeSlotClick(slot)}
              >
                {slot} {bookedSlots.includes(slot) && "(Already Booked)"}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            No available time slots.
          </div>
        )
      ) : (
        <div className="text-center text-gray-500">
          Doctor is not available on the selected day.
        </div>
      )
    ) : (
      <div className="text-center text-gray-500">
        Select a doctor and date to see available time slots.
      </div>
    )}
  </div>

  {/* Submit Button */}
  <button
    className={`w-full py-2 text-white rounded-lg ${
      loading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-500 hover:bg-blue-600"
    }`}
    onClick={handleSubmit}
    disabled={loading}
  >
    {loading ? "Submitting..." : "Book Appointment"}
  </button>
</div>

    </div>
  );
};
