// App.jsx
import { Link } from "react-router-dom";
import '../App.css';
import { Facebook, Heart, Instagram, Linkedin, MoveRight, Twitter } from "lucide-react";
import Laptopimg from '../assets/laptop_realistic.png';
import { CplusplusOriginal, Css3Original, GithubOriginal, Html5Original, JavaOriginal, JavascriptOriginal, NextjsOriginal, NodejsOriginal, PythonOriginal, ReactOriginal, TailwindcssOriginal, TypescriptOriginal } from 'devicons-react';
import screenshot from '../assets/screenshot.png';
import React from "react";
const techIcons = [
    <Html5Original size={34} />,
    <Css3Original size={34} />,
    <JavascriptOriginal size={34} />,
    <TypescriptOriginal size={34} />,
    <ReactOriginal size={34} />,
    <NextjsOriginal size={34} />,
    <NodejsOriginal size={34} />,
    <GithubOriginal size={34} color="#222" />,
    <JavaOriginal size={34} />,
    <CplusplusOriginal size={34} />,
    <PythonOriginal size={34} />,
    <TailwindcssOriginal size={34} />,

];

const TechStack = () => {
    return (
        <div className="w-full text-white p-20">
            {/* Subheading */}
            <div className="text-center text-gray-400 text-sm tracking-widest uppercase mb-4">
                Easy to use
            </div>

            {/* Main Text */}
            <h2 className="text-center text-5xl md:text-6xl font-bold leading-tight">
                Develop anywhere, <br className="block " />
                with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">
                    Code Collab
                </span>
            </h2>

            {/* Icon Row */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-6 px-4">
                {techIcons.map((icon, idx) => (
                    <div
                        key={idx}
                        className="w-14 h-14 bg-[#323235] rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        {/* <img src={icon} alt={`icon-${idx}`} className="w-7 h-7" /> */}
                        {icon}
                    </div>
                ))}
            </div>
        </div>
    );
};

const Landing = () => {

    return (

        <div className="w-full bg-[#0e1525] text-white font-sans ">
            {/* Navbar */}
            <header className="flex items-center justify-between px-6 py-4 border-b-1 border-dark-3">
                <div className="flex items-center space-x-12">
                    <div className="text-2xl font-bold">✳ CodeCollab</div>
                    <nav className="space-x-6 text-gray-300 text-sm">
                        {/* <Link to="/working" className="hover:text-white">How it works</Link> */}
                        {/* <Link  to="/about" className="hover:text-white">About</Link> */}
                    </nav>
                </div>
                <div className="flex gap-3">
                    <Link to="/try" className="flex gap-2 items-center justify-center border-dark-3 border text-gray-300 px-4 py-1 rounded hover:bg-gray-700 text-sm cursor-pointer">Try editor <MoveRight color="#fff" size={14} /></Link>
                    <Link to="/sign-in" className="border-dark-3 border text-gray-300 px-4 py-1 rounded hover:bg-gray-700 text-sm cursor-pointer">Login</Link>
                </div>
            </header>


            {/* Main Content */}
            <div className="dotted">
                <main className="px-6  grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="sora-font sm:text-[11rem] leading-48 tracking-loose text-left bg-gradient-to-br from-[#b1b8d6] to-[#95e0e6] text-transparent bg-clip-text py-6 select-none">
                        <div>Code.</div>
                        <div>Collab.</div>
                        <div>Deploy.</div>
                    </div>

                    <div className="flex flex-col justify-center gap-6 items-center">
                        <h2 className="text-white text-3xl font-bold text-center">Upgrade your process</h2>
                        <p className="text-gray-400 text-base text-center">
                            Collaborate with People over voice, video and whiteboard.
                        </p>
                        <ul className="text-sm text-gray-300 list-disc pl-5 space-y-2 ">
                            <li>It works on every machine</li>
                            <li>Easy Collaboration</li>
                            <li>Dedicated machines</li>
                        </ul>
                        <Link to="sign-up" className="cursor-pointer hover:bg-gray-100 text-black px-4 py-2 rounded-xl bg-gray-200 w-fit">
                            <p>Get Started </p>
                        </Link>
                    </div>
                </main>
                <div className="flex items-center justify-center h-[620px] w-full relative bg-transparent overflow-hidden my-8">
                    <img
                        src={Laptopimg}
                        alt="Laptop"
                        className="h-full w-[75%] object-cover opacity-90"
                    />
                    <div className="absolute bg-red-400 top-10 h-[82%] w-[54%] bg-[url(./screenshot.png)] bg-cover">
                        {/* <img
                        src={screenshot}
                        alt="Laptop"
                        className="  w-full h-full"
                    /> */}

                    </div>
                </div>
                <div className="text-center text-sm font-mono tracking-widest">Development Process Simplified</div>
                <div className="text-center text-xl font-semibold p-4">Edit, Collaborate, Run and Host all your code in one place</div>

                <section>
                    <TechStack />
                    <div className="px-64 text-2xl font-semibold">
                        <div className="">
                            Start Coding with{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">One Click</span>
                        </div>
                        <div>No Setup Required</div>
                    </div>
                    <div className="flex relative items-center justify-center w-full my-16">
                        <img src={screenshot} className=" w-[1200px] relative z-1" />
                    <div className="absolute bottom-0 h-1 w-7/12 shadow-[0_2px_30px_10px_rgba(0,255,255,0.4)] rounded-full"></div>
                    </div>
                </section>
                <div className=" bg-[#0e1525] w-full z-0 p-3 flex items-center justify-center">
                    <div className="flex gap-2">
                    {/* <Instagram color="#fff" />
                    <Twitter color="#fff" />
                    <Facebook color="#fff" />
                    <Linkedin color="#fff" /> */}
                    Created by Harshit, Bhavay and Dheeraj
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Landing;
