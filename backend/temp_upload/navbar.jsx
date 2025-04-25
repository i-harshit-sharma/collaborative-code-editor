import { useState, useEffect } from 'react';
import GoogleSearch from './Search';
import logo from '../assets/images/logo.webp'
import Logo from '../assets/images/logo.svg'
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { deepOrange, deepPurple } from '@mui/material/colors';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { styled } from '@mui/material/styles';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import SettingDropdown from './settingDropdown'
import { useRef } from 'react';




function MenuComponent({ logIn, username, email, signoutSignal, image, mode, changeMode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    function stringToColor(string) {
        let hash = 0;
        let i;

        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';

        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }

        return color;
    }

    function stringAvatar(name) {
        console.log("Background color:", stringToColor(name)); // Log the background color for debugging
        return {
            sx: {
                bgcolor: stringToColor(name),
            },
            children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`, // Extract initials from the name
        };
    }


    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsMenuOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative ml-3" ref={menuRef}>
            <div>
                <button
                    onClick={toggleMenu}
                    className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 w-12 h-12
                    sm: justify-center items-center"
                >
                    <span className="absolute -inset-1.5 " />
                    <span className="sr-only">Open user menu</span>
                    {logIn && !image && username ? (
                        <Stack>
                            <Avatar
                                {...stringAvatar(username)}
                                sx={{
                                    ...stringAvatar(username).sx, // Spread sx styles from stringAvatar
                                    width: '60px',
                                    height: '60px',
                                }}
                            />
                        </Stack>
                    ) : (
                        <img
                            alt="User Avatar"
                            src={image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                            className="w-12 h-12 rounded-full"
                        />
                    )}
                </button>
            </div>
            {isMenuOpen && (
                <div className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black/5 min-w-56 max-w-7xl">
                    <div className="block text-center px-4 py-1 text-sm text-gray-700 dark:text-gray-300">
                        {username}
                    </div>
                    <div className="block text-center px-4 py-1 text-sm text-gray-700 dark:text-gray-300">
                        {email}
                    </div>
                    <div className="block h-[1.5px] w-full bg-slate-300 my-2"></div>
                    <a
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Profile
                    </a>
                    <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Settings
                    </a>
                    <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => signoutSignal(!logIn)}
                    >
                        Sign out
                    </a>
                </div>
            )}
        </div>
    );
}


function Navbar({ logIn, image, email, signoutSignal, username, mode, handleMode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const sidebarRef = useRef(null);
    const [isDarkMode, setIsDarkMode] = useState(mode);


    const MaterialUISwitch = ({ checked, handle }) => {
        return (
            <label className="relative inline-flex items-center cursor-pointer">
                {/* Hidden Checkbox */}
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={checked} // Fix: Ensure correct checked state
                    onChange={handle} // Fix: Directly pass the function
                />

                {/* Switch Track */}
                <div className="w-[50px] h-[26px] bg-gray-300 rounded-full peer-checked:bg-white-600 transition duration-300"></div>

                {/* Switch Thumb */}
                <div
                    className={`absolute left-[3px] top-[3px] w-[21px] h-[21px] bg-white rounded-full shadow-md transform transition-all duration-300 
                ${checked ? "translate-x-[23px] " : "bg-yellow-600"}`}
                ></div>
            </label>
        );
    };



    const handleSwitchChange = (event) => {
        setIsDarkMode(event.target.checked);
        handleMode(event.target.checked);
    };
    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            setIsMenuOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        console.log("Function fired");
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    function stringToColor(string) {
        let hash = 0;
        let i;

        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';

        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xdf;
            color += `00${value.toString(16)}`.slice(-2);
        }

        return color;
    }

    function stringAvatar(name) {
        return {
            sx: {
                bgcolor: stringToColor(name),
            },
            children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
        };
    }


    return (<>
        <header className=" z-50 w-full flex-none text-sm/6 font-semibold text-slate-900 bg-white">
            <nav aria-label="Global" className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex items-center py-[0.25rem] width-full justify-between ">
                    <div className="absolute inset-x-0 bottom-0 h-px bg-slate-900/5">
                    </div>
                    <a className="flex text-slate-900" href="/">
                        <img src={Logo} className='w-16' />
                        <div className='flex flex-col ml-2 justify-center'>
                            <span className="text-xl lg:text-2xl text-[#212178]">Health Center</span>
                            <span className="text-xs sm:text-sm lg:text-lg text-stone-700">National Institute of Technology Delhi</span>
                        </div>
                    </a>
                    <button type="button" className="hidden -my-1 mx-5 flex  items-center justify-center rounded-lg sm:block flex-1 max-w-[26rem]">
                        <GoogleSearch></GoogleSearch>
                    </button>
                    <div className=" hidden lg:flex lg:items-center h-[34px] relative">
                        <a href="https://nitdelhi.ac.in/" className='h-full u-underline content-center text-base'>NITD Home</a>
                        <a className="ml-6 u-underline h-full content-center text-base" href="/services">Services</a>
                        <a className="ml-6  u-underline h-full content-center text-base mr-6" href="/contact">Contact</a>
                        {/* <div className="block px-4  text-sm text-gray-700 dark:text-gray-300 hidden lg:block" > */}
                        {/* <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} > */}
                        {/* <MaterialUISwitch checked={isDarkMode} handle={handleSwitchChange} /> */}
                        {/* </Stack> */}
                        {/* </div> */}
                        <div className="hidden lg:ml-0 lg:flex lg:border-l lg:border-slate-900/15">
                            {logIn == false ? (<a className="inline-flex justify-center rounded-lg text-sm font-semibold py-2.5 px-4 bg-[#212178] text-white hover:bg-slate-700 -my-2.5 " href="/sign-in">
                                <span className=''>Sign in </span>
                            </a>) : (
                                <MenuComponent logIn={logIn} username={username} email={email} signoutSignal={signoutSignal} image={image} mode={mode} changeMode={handleMode}></MenuComponent>
                            )}
                        </div>
                    </div>
                    <button type="button" className="-my-1 mr-1 sm:ml-6 flex size-8 items-center justify-center lg:hidden" onClick={() => setIsMenuOpen(true)}>
                        <span className="sr-only">Open navigation</span>
                        <svg viewBox="0 0 24 24" className="size-6 stroke-slate-900"><path d="M3.75 12h16.5M3.75 6.75h16.5M3.75 17.25h16.5" fill="none" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                    </button>

                </div>
            </nav>
            <div className=' min-[1400px]:absolute min-[1400px]:top-6  min-[1400px]:right-4  fixed min-[1400px]:w-7 h-7 w-7 bg-white'>
                <SettingDropdown />
            </div>
        </header>
        {isMenuOpen && (
            <>
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div id="headlessui-portal-root">
                        <div data-headlessui-portal="">
                            <button type="button" data-headlessui-focus-guard="true" aria-hidden="true" style={{
                                clip: 'rect(0px, 0px, 0px, 0px)',
                            }}
                                className="fixed top-1 left-1 w-1 h-0 p-0 m-[-1px] overflow-hidden whitespace-nowrap border-0"
                            />
                            <div>
                                <div
                                    className="fixed inset-0 z-50 overflow-hidden lg:hidden"
                                    id="headlessui-dialog-:r9:"
                                    role="dialog"
                                    tabIndex="-1"
                                    aria-modal="true"
                                    aria-labelledby="headlessui-dialog-title-:rh:"
                                >
                                    <div
                                        className="absolute inset-0 bg-black/25 backdrop-blur-xs transition-opacity" onClick={() => setIsMenuOpen(false)}
                                    />
                                    <div className="fixed inset-0 flex items-start justify-end overflow-y-auto">
                                        <div
                                            className="min-h-full w-full sm:w-[min(20rem,calc(100vw-calc(var(--spacing)*10)))] bg-white ring-1 shadow-2xl ring-black/10 transition"
                                            id="headlessui-dialog-panel-:rg:"
                                            ref={sidebarRef}
                                        >
                                            <h2
                                                className="sr-only"
                                                id="headlessui-dialog-title-:rh:"
                                            >
                                                Navigation
                                            </h2>
                                            <button onClick={() => setIsMenuOpen(false)}
                                                type="button"
                                                className="absolute top-10 right-5 flex size-8 items-center justify-center"
                                            >
                                                <span className="sr-only">Close navigation</span>
                                                <svg
                                                    className="h-3.5 w-3.5 overflow-visible stroke-slate-900"
                                                    fill="none"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M0 0L14 14M14 0L0 14" />
                                                </svg>
                                            </button>
                                            <nav className="divide-y divide-slate-900/10 text-base/7 text-slate-900">
                                                <div className="px-8 py-[1.5rem]">
                                                    {!logIn ? (
                                                        <div className="block w-16 h-16 overflow-hidden" >
                                                            <span className="sr-only">NIT Delhi</span>
                                                            <img src={Logo} alt="NIT Delhi Logo" />
                                                        </div>
                                                    ) : (
                                                        (!image && username) ? (
                                                            <Stack >
                                                                <Avatar {...stringAvatar(username)} sx={{ width: '60px', height: '60px', position: "absolute" }} />
                                                            </Stack>
                                                        ) : (
                                                            <img
                                                                alt="User Avatar"
                                                                src={image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                                                                className="w-12 h-12 rounded-full"
                                                            />
                                                        )
                                                    )}
                                                </div>


                                                <div className="px-8 py-6">
                                                    <div className="-my-2 items-start space-y-2">
                                                        <button type="button" className="-my-1 flex  items-center justify-center rounded-lg lg:ml-2 sm:hidden w-full h-16">
                                                            <GoogleSearch></GoogleSearch>
                                                        </button>
                                                        <a className="block w-full py-2 font-semibold" href="https://nitdelhi.ac.in/">NITD Home</a>
                                                        <a className="block w-full py-2 font-semibold" href="/services">Services</a>
                                                        <a className="block w-full py-2 font-semibold" href="/contact">Contact</a>
                                                        <div className="block w-full py-2 text-sm text-gray-700 dark:text-gray-300 block lg:hidden" >
                                                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} >
                                                                <Typography sx={{ fontSize: '0.875rem', color: "rgb(55 65 81 /0.25,1)", fontWeight: "600" }}>Light</Typography>
                                                                <MaterialUISwitch checked={isDarkMode} onChange={handleSwitchChange} />
                                                                <Typography sx={{ fontSize: '0.875rem', color: "rgb(55 65 81)", fontWeight: "600" }}>Dark</Typography>
                                                            </Stack>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="px-8 py-6">
                                                    <div className="-my-2 space-y-4">
                                                        {/* <a className="block w-full py-2 font-semibold" href="/login">Sign in</a> */}

                                                        {logIn == false ? (
                                                            <div
                                                                className="inline-flex justify-center rounded-lg text-sm font-semibold py-3 px-4 bg-slate-900 text-white hover:bg-slate-700 w-full"
                                                            >
                                                                <a href='/sign-in'>Sign in </a>
                                                            </div>
                                                        ) : (
                                                            <MenuComponent logIn={logIn} username={username} email={email} signoutSignal={signoutSignal} image={image} mode={mode} changeMode={handleMode}></MenuComponent>
                                                        )}
                                                    </div>
                                                </div>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                data-headlessui-focus-guard="true"
                                aria-hidden="true"
                                className="fixed top-1 left-1 w-1 h-0 p-0 m-[-1px] overflow-hidden clip-rect-0px clip-rect-0px-0px-0px whitespace-nowrap border-0"
                            />
                        </div>
                    </div>
                </div>
            </>
        )}
    </>
    )
}

export default Navbar;